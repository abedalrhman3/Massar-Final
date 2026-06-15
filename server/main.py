import os
import re
import io
import json
import base64
from datetime import datetime, timedelta
from collections import defaultdict
from typing import Optional, List, Dict, Any

from fastapi import FastAPI, UploadFile, File, HTTPException, Request, Depends
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pymongo import MongoClient
from pymongo.errors import ServerSelectionTimeoutError
import google.generativeai as genai
from langdetect import detect, LangDetectException
from deep_translator import GoogleTranslator
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Massar Chatbot API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={"reply": "Too many requests. Please slow down and try again in a moment."}
    )

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/massar")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

client: Optional[MongoClient] = None
db: Optional[Any] = None

def connect_db():
    global client, db
    try:
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        client.server_info()
        db = client.get_database()
        print(f"[DB] Connected to MongoDB: {MONGO_URI}")
    except ServerSelectionTimeoutError as e:
        print(f"[DB] Connection failed: {e}")
        client = None
        db = None

def get_db():
    return db

class Message(BaseModel):
    role: str
    content: str
    text: Optional[str] = None
    file_data: Optional[str] = None
    mime_type: Optional[str] = None

class ChatRequest(BaseModel):
    messages: List[Message]

class ImageScanRequest(BaseModel):
    file_data: str
    mime_type: str

@app.post("/api/scan-image")
@app.post("/api/chat/scan-image")
@limiter.limit("10/minute")
async def scan_image(request: Request, scan_req: ImageScanRequest):
    safe, reason = await check_image_safety_helper(scan_req.file_data, scan_req.mime_type, request)
    if not safe:
        return JSONResponse(status_code=403, content={"safe": False, "reason": reason})
    return {"safe": True}

class ChatResponse(BaseModel):
    reply: str

conversation_history: Dict[str, List[Dict]] = defaultdict(list)
MAX_HISTORY_TURNS = 4

SLIDING_WINDOW_MESSAGES = 5
SLIDING_WINDOW_SECONDS = 60

user_rate_windows: Dict[str, Dict] = {}

def check_sliding_window_rate_limit(client_id: str, detected_lang: str = "en") -> tuple[bool, str, int]:
    import time
    current_time = time.time()

    if client_id not in user_rate_windows:
        user_rate_windows[client_id] = {
            "first_message_time": current_time,
            "count": 1
        }
        return False, "", 0

    window = user_rate_windows[client_id]
    elapsed = current_time - window["first_message_time"]

    if elapsed > SLIDING_WINDOW_SECONDS:
        user_rate_windows[client_id] = {
            "first_message_time": current_time,
            "count": 1
        }
        return False, "", 0

    window["count"] += 1

    if window["count"] > SLIDING_WINDOW_MESSAGES:
        unblock_time = int(window["first_message_time"] + SLIDING_WINDOW_SECONDS)
        remaining = int(unblock_time - current_time) + 1
        unblock_time_str = time.strftime("%H:%M:%S", time.localtime(unblock_time))

        if detected_lang == "ar":
            msg = f"لقد بلغت الحد المسموح به (5 رسائل في دقيقة). يرجى المحاولة مرة أخرى في {unblock_time_str}"
        elif detected_lang == "tr":
            msg = f"Dakikada 5 mesaj sınırına ulaştınız. Lütfen {unblock_time_str}'de tekrar deneyin"
        else:
            msg = f"You've sent {SLIDING_WINDOW_MESSAGES} messages in {SLIDING_WINDOW_SECONDS} seconds. Please wait until {unblock_time_str} to send more."

        return True, msg, unblock_time

    return False, "", 0

SWEAR_WORDS = {
    "fuck", "shit", "damn", "bitch", "ass", "hell", "crap", "piss", "dick", "cock",
    "cunt", "whore", "slut", "bastard", "bullshit", "fucker", "motherfucker", "shitty"
}

ARABIC_PROFANITY = ["كلب", "عاهرة", "زب"]

OFF_TOPIC_KEYWORDS = {
    "politics": ["election", "vote", "president", "government", "party", "political"],
    "religion": ["god", "jesus", "church", "mosque", "temple", "pray", "religion", "faith"],
    "sports": ["football", "soccer", "basketball", "nba", "world cup", "match", "score"],
    "news": ["news", "headline", "journalist", "report", "breaking"],
    "adult": ["porn", "xxx", "adult", "nude", "naked", "sex"],
    "violence": ["kill", "murder", "attack", "bomb", "weapon", "gun"],
}

GEMINI_MODEL = None

GEMINI_MODEL_LIST = []
GEMINI_CURRENT_MODEL_INDEX = 0

def detect_gemini_model():
    global GEMINI_MODEL_LIST, GEMINI_CURRENT_MODEL_INDEX
    if not GEMINI_API_KEY:
        print("[GEMINI] No API key configured")
        return None

    try:
        genai.configure(api_key=GEMINI_API_KEY)
        models = genai.list_models()
        available = [m.name.replace("models/", "") for m in models]

        priority = [
            "gemini-2.5-flash",
            "gemini-2.0-flash",
            "gemini-2.5-flash-lite",
            "gemini-2.0-flash-lite",
            "gemini-1.5-flash",
            "gemini-1.5-flash-8b",
            "gemini-1.5-flash-latest",
            "gemini-2.0-flash-exp",
            "gemini-1.5-flash-002",
            "gemini-pro",
            "gemini-3.1-flash-lite",
        ]
        GEMINI_MODEL_LIST = [p for p in priority if p in available]

        if GEMINI_MODEL_LIST:
            GEMINI_CURRENT_MODEL_INDEX = 0
            print(f"[GEMINI] Model fallback list: {GEMINI_MODEL_LIST}")
            print(f"[GEMINI] Primary model: {GEMINI_MODEL_LIST[0]}")
        else:
            print(f"[GEMINI] No free-tier models found")
            print(f"[GEMINI] Available: {available}")

        return GEMINI_MODEL_LIST[0] if GEMINI_MODEL_LIST else None
    except Exception as e:
        print(f"[GEMINI] Detection error: {e}")
        return None

def get_current_model():
    global GEMINI_CURRENT_MODEL_INDEX
    if not GEMINI_MODEL_LIST:
        return None
    if GEMINI_CURRENT_MODEL_INDEX >= len(GEMINI_MODEL_LIST):
        GEMINI_CURRENT_MODEL_INDEX = 0
    return GEMINI_MODEL_LIST[GEMINI_CURRENT_MODEL_INDEX]

def switch_to_next_model():
    global GEMINI_CURRENT_MODEL_INDEX
    if not GEMINI_MODEL_LIST:
        return
    GEMINI_CURRENT_MODEL_INDEX = (GEMINI_CURRENT_MODEL_INDEX + 1) % len(GEMINI_MODEL_LIST)
    print(f"[GEMINI] Switched to: {GEMINI_MODEL_LIST[GEMINI_CURRENT_MODEL_INDEX]}")

def contains_swear_word(text: str) -> bool:
    if not text:
        return False
    lower = text.lower()
    words = re.findall(r'\b[a-zA-Z]+\b', lower)
    for word in SWEAR_WORDS:
        if word in words:
            return True
    for word in ARABIC_PROFANITY:
        if word in text:
            return True
    return False

def detect_off_topic(text: str) -> Optional[str]:
    if not text:
        return None
    lower = text.lower()
    for category, keywords in OFF_TOPIC_KEYWORDS.items():
        for kw in keywords:
            if kw in lower:
                return category
    return None

def detect_language(text: str) -> str:
    try:
        return detect(text)
    except LangDetectException:
        return "en"

def translate_to_english(text: str, source_lang: str = None) -> str:
    if not text:
        return text
    if source_lang is None:
        source_lang = detect_language(text)
    if source_lang == "en":
        return text
    try:
        return GoogleTranslator(source=source_lang, target="en").translate(text)
    except Exception:
        return text

def get_conversation_history(session_id: str) -> List[Dict]:
    return conversation_history.get(session_id, [])[-MAX_HISTORY_TURNS:]

def add_to_history(session_id: str, role: str, content: str):
    conversation_history[session_id].append({"role": role, "content": content})
    if len(conversation_history[session_id]) > MAX_HISTORY_TURNS * 2:
        conversation_history[session_id] = conversation_history[session_id][-MAX_HISTORY_TURNS:]

def search_destinations(query: str):
    if db is None:
        print(f"[DB] Database not connected")
        return {"destinations": [], "destination_details": [], "places": [], "restaurants": [], "hotels": [], "events": []}

    search_term = query.strip()
    regex = {"$regex": search_term, "$options": "i"}
    print(f"[DB] Searching for: {search_term}")

    destinations = list(db.destinations.find({
        "$or": [
            {"name": regex},
            {"tagline": regex},
            {"description": regex}
        ]
    }).limit(5))
    print(f"[DB] Found {len(destinations)} destinations")

    for d in destinations:
        d["_id"] = str(d["_id"])

    from bson import ObjectId

    dest_ids = [d["_id"] for d in destinations]
    destination_details = []
    if dest_ids:
        destination_details = list(db.destination_details.find({
            "destinationId": {"$in": [ObjectId(id) for id in dest_ids]}
        }).limit(5))
        for dd in destination_details:
            dd["_id"] = str(dd["_id"])
            dd["destinationId"] = str(dd["destinationId"])

    places = list(db.places.find({
        "$or": [
            {"name": regex},
            {"customOverview": regex}
        ]
    }).limit(5))
    for p in places:
        p["_id"] = str(p["_id"])
        if p.get("destinationId"):
            dest_id = p["destinationId"]
            try:
                if isinstance(dest_id, dict) and "$oid" in dest_id:
                    dest_id = dest_id["$oid"]
                dest = db.destinations.find_one({"_id": ObjectId(dest_id)})
                p["destinationName"] = dest.get("name") if dest else None
            except Exception:
                p["destinationName"] = None
            p["destinationId"] = str(dest_id)

    restaurants = list(db.restaurants.find({
        "$or": [
            {"name": regex},
            {"customOverview": regex}
        ]
    }).limit(5))
    for r in restaurants:
        r["_id"] = str(r["_id"])
        if r.get("destinationId"):
            dest_id = r["destinationId"]
            try:
                if isinstance(dest_id, dict) and "$oid" in dest_id:
                    dest_id = dest_id["$oid"]
                dest = db.destinations.find_one({"_id": ObjectId(dest_id)})
                r["destinationName"] = dest.get("name") if dest else None
            except Exception:
                r["destinationName"] = None
            r["destinationId"] = str(dest_id)

    hotels = list(db.hotels.find({
        "$or": [
            {"name": regex},
            {"customOverview": regex}
        ]
    }).limit(5))
    for h in hotels:
        h["_id"] = str(h["_id"])
        if h.get("destinationId"):
            dest_id = h["destinationId"]
            try:
                if isinstance(dest_id, dict) and "$oid" in dest_id:
                    dest_id = dest_id["$oid"]
                dest = db.destinations.find_one({"_id": ObjectId(dest_id)})
                h["destinationName"] = dest.get("name") if dest else None
            except Exception:
                h["destinationName"] = None
            h["destinationId"] = str(dest_id)

    events = list(db.events.find({
        "$or": [
            {"name": regex},
            {"customOverview": regex}
        ]
    }).limit(5))
    for e in events:
        e["_id"] = str(e["_id"])
        if e.get("destinationId"):
            dest_id = e["destinationId"]
            try:
                if isinstance(dest_id, dict) and "$oid" in dest_id:
                    dest_id = dest_id["$oid"]
                dest = db.destinations.find_one({"_id": ObjectId(dest_id)})
                e["destinationName"] = dest.get("name") if dest else None
            except Exception:
                e["destinationName"] = None
            e["destinationId"] = str(dest_id)

    return {
        "destinations": destinations,
        "destination_details": destination_details,
        "places": places,
        "restaurants": restaurants,
        "hotels": hotels,
        "events": events
    }

def format_db_results_for_gemini(results: dict) -> str:
    lines = []

    if results.get("destinations"):
        lines.append("=== DESTINATIONS ===")
        for d in results["destinations"]:
            lines.append(f"Name: {d.get('name', 'N/A')}")
            if d.get("tagline"):
                lines.append(f"Tagline: {d.get('tagline')}")
            if d.get("description"):
                lines.append(f"Description: {d.get('description')}")
            if d.get("budget"):
                lines.append(f"Budget: {d.get('budget')} JOD")
            if d.get("rating"):
                lines.append(f"Rating: {d.get('rating')}/5")
            if d.get("location", {}).get("coordinates"):
                coords = d["location"]["coordinates"]
                lines.append(f"Coordinates: {coords[1]}, {coords[0]}")

        for dd in results.get("destination_details", []):
            overview = dd.get("overview", {})
            if overview.get("text"):
                lines.append(f"Overview: {overview.get('text')}")
            if overview.get("locationText"):
                lines.append(f"Location: {overview.get('locationText')}")
            if overview.get("bestSeason"):
                lines.append(f"Best Season: {overview.get('bestSeason')}")
            if overview.get("recommendedStay"):
                lines.append(f"Recommended Stay: {overview.get('recommendedStay')}")
            if overview.get("averageCost"):
                lines.append(f"Average Cost: {overview.get('averageCost')}")

            activities = dd.get("activities", [])
            if activities:
                lines.append("Activities: " + ", ".join([a.get("name", "") for a in activities if a.get("name")]))

            guides = dd.get("guideSections", [])
            if guides:
                for g in guides:
                    if g.get("title") and g.get("content"):
                        lines.append(f"Guide - {g.get('title')}: {g.get('content')}")

    if results.get("places"):
        lines.append("\n=== PLACES & ATTRACTIONS ===")
        for p in results["places"]:
            lines.append(f"Name: {p.get('name', 'N/A')}")
            if p.get("destinationName"):
                lines.append(f"Location: {p.get('destinationName')}")
            if p.get("customOverview"):
                lines.append(f"Overview: {p.get('customOverview')}")
            if p.get("budget"):
                lines.append(f"Budget: {p.get('budget')}")
            if p.get("location", {}).get("coordinates"):
                coords = p["location"]["coordinates"]
                lines.append(f"Coordinates: {coords[1]}, {coords[0]}")

    if results.get("restaurants"):
        lines.append("\n=== RESTAURANTS ===")
        for r in results["restaurants"]:
            lines.append(f"Name: {r.get('name', 'N/A')}")
            if r.get("destinationName"):
                lines.append(f"Location: {r.get('destinationName')}")
            if r.get("customOverview"):
                lines.append(f"Overview: {r.get('customOverview')}")
            if r.get("budget"):
                lines.append(f"Budget: {r.get('budget')}")
            if r.get("operatingHours"):
                oh = r["operatingHours"]
                if oh.get("start") and oh.get("end"):
                    lines.append(f"Hours: {oh.get('start')} - {oh.get('end')}")
            if r.get("bookingUrl"):
                lines.append(f"Booking: {r.get('bookingUrl')}")

    if results.get("hotels"):
        lines.append("\n=== HOTELS ===")
        for h in results["hotels"]:
            lines.append(f"Name: {h.get('name', 'N/A')}")
            if h.get("destinationName"):
                lines.append(f"Location: {h.get('destinationName')}")
            if h.get("customOverview"):
                lines.append(f"Overview: {h.get('customOverview')}")
            if h.get("budget"):
                lines.append(f"Budget: {h.get('budget')}")
            if h.get("bookingUrl"):
                lines.append(f"Booking: {h.get('bookingUrl')}")

    if results.get("events"):
        lines.append("\n=== EVENTS ===")
        for e in results["events"]:
            lines.append(f"Name: {e.get('name', 'N/A')}")
            if e.get("destinationName"):
                lines.append(f"Location: {e.get('destinationName')}")
            if e.get("customOverview"):
                lines.append(f"Overview: {e.get('customOverview')}")
            if e.get("startDate"):
                lines.append(f"Start Date: {e.get('startDate')}")
            if e.get("endDate"):
                lines.append(f"End Date: {e.get('endDate')}")
            if e.get("startingFromPrice"):
                lines.append(f"Price from: {e.get('startingFromPrice')}")
            if e.get("bookingUrl"):
                lines.append(f"Booking: {e.get('bookingUrl')}")

    return "\n".join(lines) if lines else ""

def extract_destination_name(text: str) -> Optional[str]:
    if not text:
        return None
    if not GEMINI_MODEL_LIST or not GEMINI_API_KEY:
        return None

    prompt = f"""Analyze this user query: "{text}"
If the user is asking about or referring to a specific travel destination, city, historical landmark, or region in Jordan (such as Petra, Wadi Rum, Amman, Jerash, Dead Sea, Aqaba, Madaba, Ajloun, etc.), output ONLY the main English name of that destination (e.g., "Petra", "Wadi Rum", "Amman").
If the message is NOT referring to or asking about a specific destination, or if it is just a greeting, thanking, or general chat, output "none".
Output only the destination name or "none", with no punctuation, explanation, or extra words."""

    max_attempts = len(GEMINI_MODEL_LIST)
    for attempt in range(max_attempts):
        current_model = get_current_model()
        try:
            model = genai.GenerativeModel(current_model)
            response = model.generate_content(prompt)
            result = response.text.strip().lower()
            if result and result != "none":
                clean_name = re.sub(r'["\'\.\?\!]', '', result).strip()
                if clean_name:
                    print(f"[GEMINI DETECT] Extracted destination name: {clean_name}")
                    return clean_name
            return None
        except Exception as e:
            print(f"[GEMINI DETECT] Error with {current_model}: {e}")
            is_rate_limit = "429" in str(e) or "rate limit" in str(e).lower()
            if is_rate_limit:
                switch_to_next_model()
                continue
            break
    return None

def is_destination_query(text: str) -> bool:
    return extract_destination_name(text) is not None

def get_available_categories(db_results: dict) -> List[str]:
    categories = []
    if db_results.get("destinations"):
        categories.append("overview")
    if db_results.get("places"):
        categories.append("places")
    if db_results.get("hotels"):
        categories.append("hotels")
    if db_results.get("restaurants"):
        categories.append("restaurants")
    if db_results.get("events"):
        categories.append("events")
    return categories

def truncate_to_limit(text: str, max_chars: int = 400) -> str:
    if len(text) <= max_chars:
        return text
    return text[:max_chars-3].rsplit(' ', 1)[0] + "..."

def get_db_destination_names() -> List[str]:
    global db
    if db is None:
        return []
    try:
        return [d.get("name") for d in db.destinations.find({}, {"name": 1}) if d.get("name")]
    except Exception as e:
        print(f"[DB] Error fetching destination names: {e}")
        return []

def get_active_destination_from_history(history: List[Any]) -> Optional[str]:
    names = get_db_destination_names()
    if not names:
        return None
    names_lower = [n.lower() for n in names]
    
    for msg in reversed(history):
        content = ""
        if isinstance(msg, dict):
            content = msg.get("content", "")
        else:
            content = getattr(msg, "content", "") or getattr(msg, "text", "") or ""
        
        content_lower = content.lower()
        for name in names_lower:
            if name in content_lower:
                return name
    return None

def is_contextual_query(text: str) -> bool:
    text_lower = text.lower()
    referring_words = ["there", "it", "this", "that", "place", "destination", "here", "visit", "activities", "do", "how", "what", "fee", "cost", "price", "entrance", "hours", "when"]
    return any(w in text_lower for w in referring_words) or len(text_lower.strip()) <= 15

def get_all_serialized_db_data() -> str:
    global db
    if db is None:
        return "Database not connected"
    try:
        destinations = list(db.destinations.find({}))
        places = list(db.places.find({}))
        restaurants = list(db.restaurants.find({}))
        hotels = list(db.hotels.find({}))
        events = list(db.events.find({}))
        dest_details = list(db.destination_details.find({}))

        dest_map = {}
        for d in destinations:
            d_id = str(d["_id"])
            dest_map[d_id] = {
                "name": d.get("name", "N/A"),
                "tagline": d.get("tagline", ""),
                "description": d.get("description", ""),
                "budget": d.get("budget", ""),
                "rating": d.get("rating", ""),
                "location": d.get("location", {}).get("coordinates", []),
                "places": [],
                "restaurants": [],
                "hotels": [],
                "events": [],
                "activities": [],
                "guide_sections": []
            }

        for dd in dest_details:
            d_id = str(dd.get("destinationId", ""))
            if d_id in dest_map:
                overview = dd.get("overview", {})
                if overview:
                    dest_map[d_id]["overview_text"] = overview.get("text", "")
                    dest_map[d_id]["recommended_stay"] = overview.get("recommendedStay", "")
                    dest_map[d_id]["best_season"] = overview.get("bestSeason", "")
                    dest_map[d_id]["average_cost"] = overview.get("averageCost", "")

                activities = dd.get("activities", [])
                dest_map[d_id]["activities"] = [a.get("name", "") for a in activities if a.get("name")]

                guides = dd.get("guideSections", [])
                for g in guides:
                    dest_map[d_id]["guide_sections"].append({
                        "title": g.get("title", ""),
                        "content": g.get("content", "")
                    })

        for p in places:
            d_id = str(p.get("destinationId", ""))
            p_info = {
                "name": p.get("name", ""),
                "customOverview": p.get("customOverview", ""),
                "operatingHours": p.get("operatingHours", {}),
                "workingDays": p.get("workingDays", []),
                "address": ""
            }
            for m in p.get("contact", {}).get("methods", []):
                if m.get("type") == "address":
                    p_info["address"] = m.get("value", "")
            if d_id in dest_map:
                dest_map[d_id]["places"].append(p_info)

        for r in restaurants:
            d_id = str(r.get("destinationId", ""))
            r_info = {
                "name": r.get("name", ""),
                "customOverview": r.get("customOverview", ""),
                "operatingHours": r.get("operatingHours", {}),
                "workingDays": r.get("workingDays", []),
                "address": ""
            }
            for m in r.get("contact", {}).get("methods", []):
                if m.get("type") == "address":
                    r_info["address"] = m.get("value", "")
            if d_id in dest_map:
                dest_map[d_id]["restaurants"].append(r_info)

        for h in hotels:
            d_id = str(h.get("destinationId", ""))
            h_info = {
                "name": h.get("name", ""),
                "customOverview": h.get("customOverview", ""),
                "bookingUrl": h.get("bookingUrl", ""),
                "address": ""
            }
            for m in h.get("contact", {}).get("methods", []):
                if m.get("type") == "address":
                    h_info["address"] = m.get("value", "")
            if d_id in dest_map:
                dest_map[d_id]["hotels"].append(h_info)

        for e in events:
            d_id = str(e.get("destinationId", ""))
            e_info = {
                "name": e.get("name", ""),
                "customOverview": e.get("customOverview", ""),
                "startDate": str(e.get("startDate", "")),
                "endDate": str(e.get("endDate", "")),
                "startingFromPrice": e.get("startingFromPrice", ""),
                "durationText": e.get("durationText", ""),
                "bookingUrl": e.get("bookingUrl", ""),
                "address": ""
            }
            for m in e.get("contact", {}).get("methods", []):
                if m.get("type") == "address":
                    e_info["address"] = m.get("value", "")
            if d_id in dest_map:
                dest_map[d_id]["events"].append(e_info)

        import json
        return json.dumps(list(dest_map.values()), indent=2, ensure_ascii=False)
    except Exception as exc:
        print(f"Error serializing DB data: {exc}")
        return "Error loading database data"

def generate_gemini_response(
    prompt: str,
    db_data: str = "",
    is_off_topic: bool = False,
    detected_lang: str = "en",
    available_categories: List[str] = None,
    offered_categories: List[str] = None,
    category_focus: str = None,
    destination_found_in_db: bool = True,
    previous_bot_message: str = None,
    parent_destination: str = None,
    history: List[Message] = None
) -> str:
    if not GEMINI_MODEL_LIST or not GEMINI_API_KEY:
        return "Chatbot is not configured. Please set GEMINI_API_KEY."

    if available_categories is None:
        available_categories = []
    if offered_categories is None:
        offered_categories = []

    remaining_categories = [c for c in available_categories if c not in offered_categories]

    serialized_db = get_all_serialized_db_data()
    system_instruction = f"""You are a travel assistant for the Massar platform. The following is the ONLY data you have access to. Never suggest, mention, or recommend any destination, place, restaurant, hotel, or activity that does not exist in this list. If the user asks about something not in this data, tell them it is not available on the platform.

DATABASE DATA:
{serialized_db}

CRITICAL RULES:

1. GREETINGS (only when user actually greets like 'hi', 'hello', 'مرحبا'):
   - If English: Use "Ahlan wa Sahlan!" or "Welcome!"
   - If Arabic: Use "أهلاً وسهلاً!"
   - NEVER use greeting phrases for non-greeting messages (don't say "أهلاً وسهلاً" when answering "yes" or "tell me more")

2. AFFIRMATIVE RESPONSES:
   - When a user replies with 'yes', 'sure', 'ok', or any affirmative response, always refer to your last message to understand what they are confirming, and continue from that exact context.
   - When interpreting the user's reply, always account for common typos and misspellings of affirmative words. If a word closely resembles 'yes', 'sure', 'ok', or any affirmative, treat it as a confirmation and continue from the last context in the conversation.

3. DESTINATION NOT IN DATABASE (destination_found_in_db=false):
   - NEVER offer categories like "want to know about hotels?" if that destination isn't in our DB
   - Just politely say we don't have info on that place and suggest known destinations

4. TOPIC SHIFT / INTENT PRIORITIZATION:
   - Always prioritize the user's most recent intent over previous conversation history/context.
   - If the user introduces a new destination or asks about a different question/topic entirely, you must immediately switch to that new topic and stop referencing the previous one. Do not ignore the topic shift.

5. CLARIFYING QUESTIONS AND ANSWERS:
   - When you ask the user a clarifying question and the user answers it, always go back and answer the original question using the clarification the user just provided. Never give a generic overview when the user has answered your follow-up question.

6. ACTIVITIES, THINGS TO DO, AND EXPERIENCES:
   - When the user asks about activities, things to do, or experiences at a destination, treat this as equivalent to events and places combined. Always look at both the events and places data for that destination and present them as things the user can do or experience there. Never tell the user there are no activities if events or places exist for that destination.

7. VAGUE MESSAGES / UNCLARIFIED INTENT:
   - If the user's message is vague and does not clearly reference a destination or a previous topic in the conversation (e.g. "do you know what is this place?", "what about that one?", "tell me more"), always ask the user to clarify what they mean. Never pick a destination on your own when the user's intent is unclear.

8. DECLINING OR CLOSING CONVERSATION:
   - When the user declines, says no, or signals they are done with a topic or the conversation entirely, do not repeat the same information or offer the same options again. Either ask if there is something else you can help them with, or respond with a polite goodbye. Never push the same destination or topic on the user after they have declined.

9. CHARACTER LIMIT: Your response must be MAXIMUM 400 characters.

CRITICAL - Character limit: Your response must be MAXIMUM 400 characters. This is strictly enforced - stay within the limit!

IMPORTANT - Response types:

1. GREETINGS (hi, hello, مرحبا, etc.):
   - Generate a unique warm welcome each time using authentic Jordanian phrases like "أهلاً وسهلاً", "مرحبا", "أهلا بيك"
   - Vary your responses naturally - never repeat the same greeting

2. SWEARING/INSULTS:
   - Respond politely: "Please use appropriate language. I'm here to help with Jordan travel!"
   - Do NOT use a static response - let Gemini generate it

3. GIBBERISH/NON-SENSE (e.g. ",.lnilml/kpdaeaw"):
   - Respond naturally by asking the user to clarify or rephrase
   - Example: "I didn't quite catch that - could you try asking about a Jordan destination like Petra or Wadi Rum?"

4. DESTINATION FOUND IN DATABASE (destination_found_in_db=true):
   - First response: Give a SHORT overview/description (max 400 chars)
   - END by offering more info ONLY for categories that exist in DB and haven't been offered yet
   - If hotels exist in DB → end with "Want to know about hotels?"
   - If NO more categories available → end with "Would you like to know about other destinations?"
   - DO NOT mention categories that don't exist in DB

5. DESTINATION NOT IN DATABASE (destination_found_in_db=false):
   - NEVER offer categories like "want to know about hotels?" or "want to know about places?"
   - Politely say we don't have info on this place yet in their language ({detected_lang})
   - Suggest other known destinations we DO have (Petra, Wadi Rum, Amman, Jerash, Dead Sea)
   - Keep response short (max 400 chars)

6. "TELL ME MORE ABOUT [category]" (hotels, restaurants, places, events):
   - Use ONLY that category's DB data
   - Give short info (max 400 chars)
   - Offer remaining available categories not yet covered
   - If nothing left → simply end conversation

Language preference:
- Respond in the same language the user is using ({detected_lang})
- If Arabic → respond in Arabic; If English → respond in English

Style:
- Use emojis sparingly
- Keep responses conversational
- ALWAYS stay under 400 characters"""

    gemini_messages = []
    if history:
        for msg in history:
            role = "model" if msg.role in ["assistant", "model"] else "user"
            parts = []
            if getattr(msg, 'file_data', None) and getattr(msg, 'mime_type', None):
                parts.append({
                    "mime_type": msg.mime_type,
                    "data": msg.file_data
                })
            content_str = msg.content or msg.text or ""
            if content_str:
                parts.append(content_str)
            if parts:
                gemini_messages.append({
                    "role": role,
                    "parts": parts
                })
    else:
        gemini_messages.append({
            "role": "user",
            "parts": [prompt]
        })

    last_user_idx = -1
    for idx in range(len(gemini_messages) - 1, -1, -1):
        if gemini_messages[idx]["role"] == "user":
            last_user_idx = idx
            break

    if last_user_idx != -1:
        current_text = gemini_messages[last_user_idx]["parts"][-1] if isinstance(gemini_messages[last_user_idx]["parts"][-1], str) else ""

        if len(current_text.strip().split()) == 1:
            db_context = f"\nDatabase information:\n{db_data}" if (db_data and db_data != "NOT_FOUND") else ""
            turn_prompt = f"""User message: "{current_text}"
{db_context}
Respond naturally using the conversation history context and the database information if applicable. MAX 400 characters."""
        elif is_off_topic:
            turn_prompt = f"""The user asked: "{current_text}"
This is off-topic. Politely redirect them to Jordan tourism topics. MAX 400 characters."""
        elif db_data == "NOT_FOUND":
            turn_prompt = f"""User asked about a destination not in our database: "{current_text}"
This destination is NOT in our database. DO NOT offer "want to know about hotels?" or similar. Politely say we don't have details on this place yet and suggest other known destinations (Petra, Wadi Rum, Amman, Jerash, Dead Sea). MAX 400 characters."""
        elif db_data and destination_found_in_db:
            if category_focus:
                context_info = ""
                if previous_bot_message:
                    context_info = f'\nThe user was just asked: "{previous_bot_message}"\nThe user replied: "{current_text}" (affirmative)\n'
                elif parent_destination:
                    context_info = f'\nNote: This place is within {parent_destination}.\n'

                turn_prompt = f"""{context_info}User asked for more about "{category_focus}": "{current_text}"

Database information for {category_focus}:
{db_data}

Give a short description (max 400 chars) using ONLY this data. END by offering remaining categories: {remaining_categories} - but only if there are any left."""
            else:
                offer_text = ""
                if remaining_categories:
                    if "hotels" in remaining_categories:
                        offer_text = " Want to know about hotels?"
                    elif "restaurants" in remaining_categories:
                        offer_text = " Want to know about restaurants?"
                    elif "places" in remaining_categories:
                        offer_text = " Want to know about places and attractions?"
                    elif "events" in remaining_categories:
                        offer_text = " Want to know about events?"
                    elif "overview" in remaining_categories:
                        offer_text = " Want more details?"
                else:
                    offer_text = " Ask about other Jordan destinations!"

                parent_context = ""
                if parent_destination:
                    parent_context = f"\nNote: This location is within {parent_destination}."

                turn_prompt = f"""{parent_context}User asked about a destination: "{current_text}"

Database information:
{db_data}

Give a SHORT overview (max 400 chars).{offer_text} Only mention categories that exist in DB: {available_categories}"""
        else:
            turn_prompt = f"""User message: "{current_text}"
This is general conversation/greeting/gibberish or unrelated to Jordan. Respond naturally as a friendly chatbot would. MAX 400 characters."""

        reinforcement = f"""Remember: the following is the only destination data available on this platform. Never answer about any destination, place, hotel, restaurant, or activity not in this list.

DATABASE DATA:
{serialized_db}

"""
        gemini_messages[last_user_idx]["parts"][-1] = reinforcement + turn_prompt

    max_attempts = len(GEMINI_MODEL_LIST)
    last_error = None
    for attempt in range(max_attempts):
        current_model = get_current_model()
        try:
            print(f"[GEMINI] Attempting with model: {current_model} (attempt {attempt + 1}/{max_attempts})")
            model = genai.GenerativeModel(current_model, system_instruction=system_instruction)
            response = model.generate_content(gemini_messages)
            print(f"[GEMINI] Request succeeded with model: {current_model}")
            result = response.text
            if len(result) > 400:
                result = truncate_to_limit(result, 400)
            return result
        except Exception as e:
            error_type = type(e).__name__
            error_str = str(e)
            last_error = f"{error_type}: {error_str[:150]}"
            is_rate_limit = (
                "429" in error_str or
                "rate limit" in error_str.lower() or
                "quota" in error_str.lower() or
                "RESOURCE_EXHAUSTED" in error_str or
                "limit" in error_str.lower()
            )
            print(f"[GEMINI] Error with {current_model}: {error_type} - {error_str[:150]}")
            print(f"[GEMINI] Is rate limit: {is_rate_limit}")
            if is_rate_limit:
                switch_to_next_model()
                continue
            print(f"[GEMINI] Non-rate-limit error, returning failure message")
            return "I apologize, but I couldn't generate a response right now. Please try again."

    print(f"[GEMINI] All {max_attempts} models failed. Last error: {last_error}")
    return "I apologize, but I couldn't generate a response right now. Please try again later."

# ===== IMAGE MESSAGE HANDLER =====
async def handle_image_message(file_data: str, mime_type: str, session_id: str, context_text: str = None, request: Request = None) -> ChatResponse:
    """Handle image messages - identify place and respond from DB"""
    import base64

    if not GEMINI_MODEL_LIST or not GEMINI_API_KEY:
        return ChatResponse(
            reply="To analyze images, please provide the destination name in text, or configure the Gemini API."
        )

    # Validate mime type
    valid_types = {"image/jpeg", "image/png", "image/webp"}
    if mime_type not in valid_types:
        return ChatResponse(reply="Only JPEG, PNG, and WebP images are allowed.")

    try:
        # Prepare image for Gemini
        image_parts = [{"mime_type": mime_type, "data": file_data}]

        # Build prompt with optional context
        context_info = f"\nUser's question: {context_text}" if context_text else ""
        prompt = f"""Analyze this image and identify what place/destination in Jordan it shows.
Output ONLY the destination name (like "Petra", "Wadi Rum", "Jerash", "Amman", "Dead Sea") or say "unknown" if you don't recognize it as a Jordan place.
Be specific - if you see famous structures like the Treasury or Monastery, say "Petra".{context_info}"""

        identified_place = None
        db_results = {}
        available_categories = []
        db_data = "NOT_FOUND"

        max_attempts = len(GEMINI_MODEL_LIST)
        for attempt in range(max_attempts):
            current_model = get_current_model()
            try:
                model = genai.GenerativeModel(current_model)
                response = model.generate_content([prompt, image_parts[0]])
                print(f"[IMAGE] Identification result: {response.text}")
                identified = response.text.strip().lower()

                if identified and identified != "unknown":
                    # Map common variations to known destinations
                    if "treasury" in identified or "khazneh" in identified:
                        identified = "petra"
                    elif "monastery" in identified or "ad deir" in identified:
                        identified = "petra"
                    elif "dead sea" in identified:
                        identified = "dead sea"
                    elif "wadi rum" in identified or " desert" in identified:
                        identified = "wadi rum"

                    # Check against database destinations dynamically
                    names = get_db_destination_names()
                    for name in names:
                        if name.lower() in identified:
                            identified = name.lower()
                            break

                    # Search database for identified place
                    db_results = search_destinations(identified)
                    available_categories = get_available_categories(db_results)

                    has_results = (
                        db_results.get("destinations") or
                        db_results.get("places") or
                        db_results.get("restaurants") or
                        db_results.get("hotels") or
                        db_results.get("events")
                    )

                    if has_results:
                        db_data = format_db_results_for_gemini(db_results)
                        print(f"[IMAGE] Found DB results for: {identified}")
                    else:
                        db_data = "NOT_FOUND"
                        print(f"[IMAGE] No DB results for: {identified}")
                else:
                    db_data = "NOT_FOUND"

                print(f"[IMAGE] Identified place: {identified}, Found in DB: {db_data != 'NOT_FOUND'}")
                break

            except Exception as img_error:
                error_str = str(img_error)
                is_rate_limit = "429" in error_str or "rate limit" in error_str.lower() or "quota" in error_str.lower()
                print(f"[IMAGE] Error: {error_str[:100]}")
                if is_rate_limit:
                    switch_to_next_model()
                    continue
                db_data = "NOT_FOUND"
                break

        # Generate response based on what we found
        if db_data == "NOT_FOUND":
            # Image is not a Jordan destination or not in DB
            names = get_db_destination_names()
            if names:
                dest_list = "\n".join([f"• {name}" for name in names])
                dest_section = f"I can help you discover these amazing Jordan places:\n{dest_list}\n\n"
            else:
                dest_section = ""
            not_found_msg = (
                "I can see your image, but I couldn't identify a specific Jordan destination from it, "
                "or that destination isn't in our database yet. 🏜️\n\n"
                f"{dest_section}"
                "Would you like me to tell you about any of these destinations? 🇯🇴"
            )
            return ChatResponse(reply=not_found_msg)

        # Found in DB - generate response using Gemini
        detected_lang = detect_language("hello")
        response_text = generate_gemini_response(
            prompt=f"Tell me about {identified_place or 'this destination'} from the provided information.",
            db_data=db_data,
            is_off_topic=False,
            detected_lang=detected_lang,
            available_categories=available_categories,
            offered_categories=[],
            category_focus=None,
            destination_found_in_db=True,
            parent_destination=identified_place if identified_place else None
        )

        return ChatResponse(reply=response_text)

    except Exception as e:
        print(f"[IMAGE] Error processing image: {e}")
        names = get_db_destination_names()
        if names:
            dest_list = "\n".join([f"• {name}" for name in names])
            dest_section = f", or try one of these popular spots:\n\n{dest_list}\n\nWhich one interests you?"
        else:
            dest_section = "."
        return ChatResponse(
            reply=f"I received your image! To help you with the place shown, please tell me the name of the destination you're asking about{dest_section}"
        )


# ─────────────────────────────────────────────────────────────────────────────
# Quest Photo Validation
# Called by the Node.js backend (aiService.js) when a user submits a quest photo
# ─────────────────────────────────────────────────────────────────────────────

class QuestValidationRequest(BaseModel):
    file_data:         str   # base64-encoded image (no data URI prefix)
    mime_type:         str   # image/jpeg | image/png | image/webp
    quest_requirement: str   # from Quest.ai_requirement field


class QuestValidationResponse(BaseModel):
    is_appropriate: bool
    fulfills_quest: bool
    reason:         str   # 1-sentence explanation shown to the user


class QuestRequirementRequest(BaseModel):
    title: str
    description: str


class QuestRequirementResponse(BaseModel):
    ai_requirement: str


class PhotoSafetyRequest(BaseModel):
    file_data: str  # base64-encoded image (no data URI prefix)
    mime_type: str  # image/jpeg | image/png | image/webp


class PhotoSafetyResponse(BaseModel):
    is_appropriate: bool
    reason: str


async def validate_quest_photo_with_gemini(
    file_data: str,
    mime_type: str,
    quest_requirement: str
) -> dict:
    """
    Sends the image to Gemini with a two-question prompt.
    Returns { is_appropriate, fulfills_quest, reason }.

    Falls back gracefully (is_appropriate=True, fulfills_quest=False)
    on any error so a Gemini outage never permanently blocks users.
    """
    if not GEMINI_MODEL_LIST or not GEMINI_API_KEY:
        return {
            "is_appropriate": True,
            "fulfills_quest": False,
            "reason": "AI validation service is not configured."
        }

    prompt = f"""You are a quest validator for a Jordan travel app called Masar.

Analyze this image and answer TWO questions. Respond ONLY in valid JSON with no extra text, no markdown fences.

QUESTION 1 — Content Safety:
Is this image appropriate? Only flag as inappropriate (is_appropriate: false) if the image CLEARLY contains:
- Explicit sexual or pornographic content
- Graphic gore or extreme violence
- Hate symbols or extremist content
- Full nudity
Normal travel photos, selfies, people visiting landmarks, landscapes, and food photos are ALL appropriate. When in doubt, mark as appropriate.

QUESTION 2 — Quest Fulfillment:
Quest requirement: "{quest_requirement}"
Does this image show what the quest requires? The photo does not need to be perfect — if it reasonably shows the required location or activity, mark it as fulfilled.

Respond with EXACTLY this JSON and nothing else:
{{
  "is_appropriate": true or false,
  "fulfills_quest": true or false,
  "reason": "one sentence explaining your decision"
}}"""

    max_attempts = len(GEMINI_MODEL_LIST)
    last_error = None

    for attempt in range(max_attempts):
        current_model = get_current_model()
        try:
            print(f"[AI_QUEST] Attempt {attempt + 1}/{max_attempts} with model: {current_model}")
            model = genai.GenerativeModel(current_model)

            image_part = {"mime_type": mime_type, "data": file_data}
            response = model.generate_content([prompt, image_part])

            raw = response.text.strip()
            # Strip markdown code fences if Gemini adds them despite instructions
            raw = re.sub(r"```json|```", "", raw).strip()

            result = json.loads(raw)

            # Validate shape
            if not isinstance(result.get("is_appropriate"), bool) or \
               not isinstance(result.get("fulfills_quest"), bool):
                raise ValueError(f"Unexpected response shape: {result}")

            print(f"[AI_QUEST] Result: {result}")
            return {
                "is_appropriate": result["is_appropriate"],
                "fulfills_quest": result["fulfills_quest"],
                "reason":         result.get("reason", ""),
            }

        except json.JSONDecodeError as e:
            last_error = f"JSON parse error: {e} | Raw: {response.text[:200]}"
            print(f"[AI_QUEST] {last_error}")
            # Don't switch model for parse errors — try same model once more would
            # give the same result; break and return safe fallback
            break

        except Exception as e:
            error_str = str(e)
            is_rate_limit = (
                "429" in error_str or
                "rate limit" in error_str.lower() or
                "quota" in error_str.lower() or
                "RESOURCE_EXHAUSTED" in error_str
            )
            last_error = f"{type(e).__name__}: {error_str[:150]}"
            print(f"[AI_QUEST] Error with {current_model}: {last_error}")

            if is_rate_limit:
                switch_to_next_model()
                continue

            break  # Non-rate-limit error — stop trying

    print(f"[AI_QUEST] All attempts failed. Last error: {last_error}")
    # Safe fallback: don't flag as inappropriate on AI failure,
    # but don't auto-complete quest either
    return {
        "is_appropriate": True,
        "fulfills_quest": False,
        "reason": "Photo validation is temporarily unavailable. Please try again shortly."
    }


@app.post("/api/quest/validate", response_model=QuestValidationResponse)
@limiter.limit("20/minute")
async def validate_quest(request: Request, body: QuestValidationRequest):
    """
    Called by Node.js aiService.js to validate a quest photo submission.
    Node sends the raw base64 image (no data URI prefix).
    """
    valid_mime_types = {"image/jpeg", "image/png", "image/webp"}
    if body.mime_type not in valid_mime_types:
        raise HTTPException(
            status_code=400,
            detail="Only JPEG, PNG, and WebP images are supported."
        )

    # Rough size check — base64 of a 5MB image ≈ 6.7MB string
    if len(body.file_data) > 7 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail="Image is too large. Maximum size is 5MB."
        )

    if not body.quest_requirement or not body.quest_requirement.strip():
        raise HTTPException(
            status_code=400,
            detail="quest_requirement must not be empty."
        )

    result = await validate_quest_photo_with_gemini(
        file_data=body.file_data,
        mime_type=body.mime_type,
        quest_requirement=body.quest_requirement.strip(),
    )

    return QuestValidationResponse(**result)


async def generate_quest_requirement_with_gemini(title: str, description: str) -> str:
    if not GEMINI_MODEL_LIST or not GEMINI_API_KEY:
        return f"A photo showing completion of the quest: {title}"

    prompt = f"""You are an expert content creator for Masar, a Jordan travel app.
Your task is to write a clear, concise, plain-English requirement of what a user's photo must show to prove they completed a specific quest.

Quest Title: {title}
Quest Description: {description}

Write a single, direct sentence in English describing what the photo MUST show.
Start with "A photo clearly showing..."
Example outputs:
- "A photo clearly showing the Treasury facade at Petra, Jordan"
- "A photo clearly showing the Roman Forum at Jerash"
- "A photo clearly showing the visitor center or sand dunes at Wadi Rum"

Respond ONLY with the generated requirement sentence. Do not include markdown, quotes, introduction, or explanation."""

    max_attempts = len(GEMINI_MODEL_LIST)
    last_error = None

    for attempt in range(max_attempts):
        current_model = get_current_model()
        try:
            print(f"[AI_REQ] Attempt {attempt + 1}/{max_attempts} with model: {current_model}")
            model = genai.GenerativeModel(current_model)
            response = model.generate_content(prompt)
            result = response.text.strip()
            # Clean up quotes if Gemini adds them
            result = result.replace('"', '').replace("'", "").strip()
            print(f"[AI_REQ] Generated requirement: {result}")
            return result
        except Exception as e:
            error_str = str(e)
            is_rate_limit = (
                "429" in error_str or
                "rate limit" in error_str.lower() or
                "quota" in error_str.lower() or
                "RESOURCE_EXHAUSTED" in error_str
            )
            last_error = f"{type(e).__name__}: {error_str[:150]}"
            print(f"[AI_REQ] Error with {current_model}: {last_error}")
            if is_rate_limit:
                switch_to_next_model()
                continue
            break

    return f"A photo showing completion of the quest: {title}"


@app.post("/api/quest/generate-requirement", response_model=QuestRequirementResponse)
@limiter.limit("20/minute")
async def generate_requirement(request: Request, body: QuestRequirementRequest):
    result = await generate_quest_requirement_with_gemini(
        title=body.title,
        description=body.description
    )
    return QuestRequirementResponse(ai_requirement=result)


async def check_photo_safety_with_gemini(file_data: str, mime_type: str) -> dict:
    if not GEMINI_MODEL_LIST or not GEMINI_API_KEY:
        return {
            "is_appropriate": True,
            "reason": "AI moderation service is not configured."
        }

    prompt = """You are an extremely strict content safety moderator for a family-friendly Jordan travel app called Masar.

Analyze this image for any inappropriate, unsafe, or sensitive content.
Respond ONLY in valid JSON with no extra text, no markdown fences.

You must flag the image as inappropriate (is_appropriate: false) if it contains ANY of the following:
1. Nudity, semi-nudity, or sexual content (including pornography, underwear, cleavage, suggestive poses, sexually explicit items).
2. Violence, weapons, blood, gore, injuries, or disturbing/scary imagery.
3. Alcohol, drugs, cigarettes, vaping, or related paraphernalia.
4. Offensive gestures, hate speech, political symbols, or extremist content.
5. Personal identifiable information (PII) like passports, IDs, or credit cards clearly visible.
6. Highly low-quality, blurry, solid color, or spam/troll images (e.g. memes, unrelated screenshots).

Be extremely conservative. If you are unsure or if the image is borderline, flag it as inappropriate (is_appropriate: false).

Respond with EXACTLY this JSON format and nothing else:
{
  "is_appropriate": true or false,
  "reason": "a very short description of why it was flagged or 'Appropriate image'"
}"""

    max_attempts = len(GEMINI_MODEL_LIST)
    last_error = None

    for attempt in range(max_attempts):
        current_model = get_current_model()
        try:
            print(f"[AI_SAFETY] Attempt {attempt + 1}/{max_attempts} with model: {current_model}")
            model = genai.GenerativeModel(current_model)

            image_part = {"mime_type": mime_type, "data": file_data}
            response = model.generate_content([prompt, image_part])

            raw = response.text.strip()
            # Strip markdown code fences if Gemini adds them
            raw = re.sub(r"```json|```", "", raw).strip()

            result = json.loads(raw)

            # Validate shape
            if not isinstance(result.get("is_appropriate"), bool):
                raise ValueError(f"Unexpected response shape: {result}")

            print(f"[AI_SAFETY] Result: {result}")
            return {
                "is_appropriate": result["is_appropriate"],
                "reason":         result.get("reason", "Inappropriate content detected"),
            }

        except json.JSONDecodeError as e:
            last_error = f"JSON parse error: {e} | Raw: {response.text[:200]}"
            print(f"[AI_SAFETY] {last_error}")
            break

        except Exception as e:
            error_str = str(e)
            is_rate_limit = (
                "429" in error_str or
                "rate limit" in error_str.lower() or
                "quota" in error_str.lower() or
                "RESOURCE_EXHAUSTED" in error_str
            )
            last_error = f"{type(e).__name__}: {error_str[:150]}"
            print(f"[AI_SAFETY] Error with {current_model}: {last_error}")
            if is_rate_limit:
                switch_to_next_model()
                continue
            break

    print(f"[AI_SAFETY] All attempts failed. Last error: {last_error}")
    # Safe fallback: don't flag as inappropriate on AI failure, but return safe fallback
    return {
        "is_appropriate": True,
        "reason": "Safety check temporarily unavailable. Defaulting to safe."
    }


@app.post("/api/photo/check-safety", response_model=PhotoSafetyResponse)
@limiter.limit("20/minute")
async def check_photo_safety(request: Request, body: PhotoSafetyRequest):
    """
    Called by Node.js to strictly moderation check an uploaded photo buffer.
    """
    valid_mime_types = {"image/jpeg", "image/png", "image/webp"}
    if body.mime_type not in valid_mime_types:
        raise HTTPException(
            status_code=400,
            detail="Only JPEG, PNG, and WebP images are supported."
        )

    # Rough size check — base64 of a 5MB image ≈ 6.7MB string
    if len(body.file_data) > 7 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail="Image is too large. Maximum size is 5MB."
        )

    result = await check_photo_safety_with_gemini(
        file_data=body.file_data,
        mime_type=body.mime_type
    )

    return PhotoSafetyResponse(**result)


@app.on_event("startup")
async def startup_event():
    connect_db()
    detect_gemini_model()

@app.get("/")
async def root():
    return {"status": "Masar Chatbot API is running"}

@app.get("/health")
async def health_check():
    db_status = "connected" if db is not None else "disconnected"
    gemini_status = f"configured ({GEMINI_MODEL_LIST[0]})" if GEMINI_MODEL_LIST else "not configured"
    return {
        "status": "healthy",
        "database": db_status,
        "gemini": gemini_status
    }

def detect_category_followup(text: str) -> str:
    text_lower = text.lower()
    categories = {
        "hotels": ["hotel", "stay", "accommodation", "where to stay"],
        "restaurants": ["restaurant", "food", "eat", "dining", "where to eat"],
        "places": ["place", "attraction", "sight", "see", "visit", "things to do"],
        "events": ["event", "happening", "when to go", "calendar"],
    }
    for category, keywords in categories.items():
        if any(kw in text_lower for kw in keywords):
            return category
    return None

def is_affirmative_reply(text: str) -> bool:
    text_lower = text.lower()
    affirmative = {"yes", "yep", "yeah", "sure", "ok", "please", "go ahead", "tell me", "more"}
    return any(aff in text_lower for aff in affirmative)

async def check_image_safety_helper(file_data: str, mime_type: str, request: Request) -> tuple[bool, str]:
    """
    Runs safety check on the image. If unsafe, flags the user, stores in audit, and returns (False, reason).
    Otherwise returns (True, "").
    """
    if not GEMINI_MODEL_LIST or not GEMINI_API_KEY:
        return True, ""

    import json
    from bson import ObjectId

    user_id_str = request.headers.get("x-user-id") if request else None
    safe = True
    reason = ""

    try:
        image_parts = [{"mime_type": mime_type, "data": file_data}]
        prompt = (
            "You are a content moderation system. Analyze this image and respond ONLY with a valid JSON object, "
            "no markdown, no explanation: { \"safe\": true/false, \"reason\": \"string\" }. "
            "Flag as unsafe if the image contains nudity, explicit sexual content, violence, or any immoral material."
        )

        current_model = get_current_model()
        model = genai.GenerativeModel(current_model)
        response = model.generate_content([prompt, image_parts[0]])
        
        resp_text = response.text.strip()
        print(f"RAW GEMINI SAFETY RESPONSE: {resp_text}")
        if resp_text.startswith("```"):
            lines = resp_text.splitlines()
            if len(lines) >= 3 and lines[0].startswith("```") and lines[-1].startswith("```"):
                resp_text = "\n".join(lines[1:-1]).strip()
                if resp_text.startswith("json"):
                    resp_text = resp_text[4:].strip()

        try:
            data = json.loads(resp_text)
            safe = data.get("safe", False)
            reason = data.get("reason", "unknown")
        except Exception as parse_err:
            print(f"[SAFETY CHECK] JSON parse error: {parse_err}. Response was: {resp_text}")
            safe = False
            reason = "parse error"
    except Exception as e:
        print(f"[SAFETY CHECK] Safety check call failed: {e}")
        safe = False
        reason = f"api error: {str(e)}"

    if not safe:
        # Flag user in MongoDB
        if user_id_str and db is not None:
            try:
                db.users.update_one(
                    {"_id": ObjectId(user_id_str)},
                    {
                        "$set": {"isBanned": True, "flagged": True},
                        "$push": {
                            "violations": {
                                "reason": reason,
                                "timestamp": datetime.utcnow(),
                                "type": "unsafe_image"
                            }
                        }
                    }
                )
                print(f"[SAFETY CHECK] Flagged user {user_id_str} in DB due to unsafe image: {reason}")
            except Exception as db_err:
                print(f"[SAFETY CHECK] Error flagging user: {db_err}")

        # Store image in audit collection
        if db is not None:
            try:
                db.audit.insert_one({
                    "userId": user_id_str,
                    "timestamp": datetime.utcnow(),
                    "mimeType": mime_type,
                    "imageData": file_data,
                    "reason": reason
                })
                print("[SAFETY CHECK] Stored unsafe image in audit collection")
            except Exception as db_err:
                print(f"[SAFETY CHECK] Error storing in audit: {db_err}")

    return safe, reason

@app.post("/api/chat", response_model=ChatResponse)
@limiter.limit("10/minute")
async def chat(request: Request, chat_request: ChatRequest):
    session_id = get_remote_address(request)

    user_messages = [m for m in chat_request.messages if m.role == "user"]
    if not user_messages:
        return ChatResponse(reply="Please send a message to start the conversation.")

    last_message = user_messages[-1]
    user_text = (last_message.content or last_message.text or "").strip()
    file_data = getattr(last_message, 'file_data', None)
    mime_type = getattr(last_message, 'mime_type', None)

    # ===== HANDLE IMAGE MESSAGES (with or without text) =====
    # Check for image in the last message - process image FIRST, then use any text as context
    if file_data:
        print(f"[CHAT] Image received (mime: {mime_type}, size: {len(file_data)} bytes)")
        # Pass the text as context to help Gemini identify the image
        context_text = user_text if user_text else None
        return await handle_image_message(file_data, mime_type, session_id, context_text, request)

    detected_lang = detect_language(user_text)
    is_rate_limited, rate_limit_msg, unblock_time = check_sliding_window_rate_limit(session_id, detected_lang)

    if is_rate_limited:
        return JSONResponse(
            status_code=429,
            content={"reply": rate_limit_msg, "unblockTime": unblock_time}
        )

    has_swear = contains_swear_word(user_text)
    if has_swear:
        return ChatResponse(reply="Please use appropriate language. I'm here to help with Jordan travel!")

    translated_text = translate_to_english(user_text, detected_lang)

    is_short_reply = len(user_text.strip()) <= 4
    user_affirmative = is_affirmative_reply(user_text)

    history = get_conversation_history(session_id)
    if is_short_reply and history:
        last_user_lang = None
        for msg in reversed(history):
            if msg.get("role") == "user" and len(msg.get("content", "").strip()) > 4:
                last_user_lang = detect_language(msg.get("content", ""))
                break
        if last_user_lang and last_user_lang != "unknown":
            detected_lang = last_user_lang

    off_topic = detect_off_topic(translated_text)
    search_term = extract_destination_name(translated_text)
    is_dest = search_term is not None
    category_followup = detect_category_followup(translated_text)

    active_dest = get_active_destination_from_history(history)
    if not is_dest and active_dest:
        if off_topic is None and is_contextual_query(translated_text):
            search_term = active_dest
            is_dest = True
            print(f"[FLOW] Resolved contextual query to active destination from history: {active_dest}")

    db_results = {}
    db_data_formatted = ""
    available_categories = []
    offered_categories = []
    destination_found_in_db = False
    parent_destination = None  # Track parent destination for sub-locations

    # Get last bot message for context in affirmative replies - check BOTH request messages AND server history
    last_bot_message = None
    # First check request messages (most recent)
    for msg in reversed(chat_request.messages):
        if msg.role == "assistant":
            last_bot_message = msg.content
            break
    # Fallback to server history if not found in request
    if not last_bot_message:
        for msg in reversed(history):
            if msg.get("role") == "assistant":
                last_bot_message = msg.get("content", "")
                break

    # Parse offered categories from request messages (more accurate than server history)
    request_messages = chat_request.messages
    for msg in request_messages:
        content_lower = (msg.content or "").lower()
        if "want to know about hotels" in content_lower or "about hotels" in content_lower or "hotels?" in content_lower:
            offered_categories.append("hotels")
        if "want to know about restaurants" in content_lower or "about restaurants" in content_lower or "restaurants?" in content_lower:
            offered_categories.append("restaurants")
        if "want to know about places" in content_lower or "about places" in content_lower or "about attractions" in content_lower or "places and attractions" in content_lower or "places?" in content_lower or "attractions?" in content_lower or "places or events" in content_lower:
            offered_categories.append("places")
        if "want to know about events" in content_lower or "about events" in content_lower or "events?" in content_lower:
            offered_categories.append("events")

    # Debug: show what we're parsing
    print(f"[DEBUG] Parsing messages, offered_categories={offered_categories}")
    for i, msg in enumerate(request_messages):
        safe_content = (msg.content or '').encode('ascii', errors='replace').decode('ascii')
        print(f"[DEBUG] msg[{i}] role={msg.role}, content={safe_content[:50]}")

    # Now compute last_offered_category AFTER populated
    last_offered_category = offered_categories[-1] if offered_categories else None
    safe_user_text = user_text.encode('ascii', errors='replace').decode('ascii')
    print(f"[DEBUG] After populate: user_text={safe_user_text}, user_affirmative={user_affirmative}, last_offered_category={last_offered_category}")

    if is_dest:
        print(f"[DB] Extracted search term: {search_term}")
        db_results = search_destinations(search_term)
        available_categories = get_available_categories(db_results)
        print(f"[DB] Available categories: {available_categories}")

        has_results = (
            db_results.get("destinations") or
            db_results.get("places") or
            db_results.get("restaurants") or
            db_results.get("hotels") or
            db_results.get("events")
        )
        destination_found_in_db = has_results

        # Detect sub-locations and track parent destination
        if has_results and search_term:
            search_lower = search_term.lower()
            # Map sub-locations to their parent destinations
            sublocation_parents = {
                "the treasury": "Petra",
                "treasury": "Petra",
                "khazneh": "Petra",
                "the monastery": "Petra",
                "monastery": "Petra",
                "ad deir": "Petra",
                "the siq": "Petra",
                "siq": "Petra",
                "little petra": "Petra",
                "um qais": "Jerash",
                "umm qais": "Jerash",
                "mount nebo": "Madaba",
                "mt nebo": "Madaba",
            }
            for subloc, parent in sublocation_parents.items():
                if subloc in search_lower:
                    # Verify parent exists in DB results
                    if db_results.get("destinations"):
                        for dest in db_results["destinations"]:
                            if parent.lower() in dest.get("name", "").lower():
                                parent_destination = parent
                                print(f"[DB] Detected sub-location: {search_term} -> parent: {parent}")
                                break

        if category_followup and has_results:
            category_data = {}
            if category_followup == "places" and db_results.get("places"):
                category_data["places"] = db_results["places"]
            elif category_followup == "hotels" and db_results.get("hotels"):
                category_data["hotels"] = db_results["hotels"]
            elif category_followup == "restaurants" and db_results.get("restaurants"):
                category_data["restaurants"] = db_results["restaurants"]
            elif category_followup == "events" and db_results.get("events"):
                category_data["events"] = db_results["events"]

            if category_data:
                db_data_formatted = format_db_results_for_gemini(category_data)
                is_dest = False
            else:
                db_data_formatted = "NOT_FOUND"
        elif has_results:
            db_data_formatted = format_db_results_for_gemini(db_results)
        else:
            db_data_formatted = "NOT_FOUND"

    if user_affirmative and last_offered_category and not category_followup:
        print(f"[FLOW] User said affirmative, last offer was: {last_offered_category}")
        destination_found = None

        # First, check request messages for destination (more accurate than server history)
        for msg in chat_request.messages:
            if msg.role == "user":
                content = (msg.content or "")
                content_lower = content.lower()

                # Check sub-locations first
                sublocation_parents = {
                    "the treasury": "petra", "treasury": "petra", "khazneh": "petra",
                    "the monastery": "petra", "monastery": "petra", "ad deir": "petra",
                    "the siq": "petra", "siq": "petra", "little petra": "petra",
                    "um qais": "jerash", "umm qais": "jerash",
                    "mount nebo": "madaba", "mt nebo": "madaba",
                }
                for subloc, parent in sublocation_parents.items():
                    if subloc in content_lower:
                        destination_found = parent
                        parent_destination = parent.title()  # Track for prompt
                        print(f"[FLOW] Resolved sub-location to parent: {parent}")
                        break

                # If no sub-location, check regular destinations dynamically
                if not destination_found:
                    names = get_db_destination_names()
                    for name in names:
                        if name.lower() in content_lower:
                            destination_found = name.lower()
                            break
            if destination_found:
                break

        # Fallback: check server history dynamically if not found in request
        if not destination_found:
            for msg in reversed(history):
                if msg.get("role") == "user":
                    content = msg.get("content", "")
                    content_lower = content.lower()
                    names = get_db_destination_names()
                    for name in names:
                        if name.lower() in content_lower:
                            destination_found = name.lower()
                            break
                if destination_found:
                    break

        if destination_found:
            print(f"[FLOW] Found destination in user history: {destination_found}")
            db_results = search_destinations(destination_found)
            available_categories = get_available_categories(db_results)
            print(f"[DB] Category follow-up search for {destination_found}: categories = {available_categories}")
            has_results = (
                db_results.get("destinations") or
                db_results.get("places") or
                db_results.get("restaurants") or
                db_results.get("hotels") or
                db_results.get("events")
            )
            if has_results:
                category_data = {}
                if last_offered_category == "places" and db_results.get("places"):
                    category_data["places"] = db_results["places"]
                elif last_offered_category == "hotels" and db_results.get("hotels"):
                    category_data["hotels"] = db_results["hotels"]
                elif last_offered_category == "restaurants" and db_results.get("restaurants"):
                    category_data["restaurants"] = db_results["restaurants"]
                elif last_offered_category == "events" and db_results.get("events"):
                    category_data["events"] = db_results["events"]

                if category_data:
                    print(f"[DB] Found category data for {last_offered_category}")
                    db_data_formatted = format_db_results_for_gemini(category_data)
                    is_dest = False
                    destination_found_in_db = True  # Fix: Mark as found for proper prompt

    elif category_followup:
        for msg in history:
            content_lower = msg.get("content", "").lower()
            names = [n.lower() for n in get_db_destination_names()]
            if any(dest in content_lower for dest in names):
                search_term = next((d for d in names if d in content_lower), None)
                if search_term:
                    db_results = search_destinations(search_term)
                    available_categories = get_available_categories(db_results)
                    has_results = (
                        db_results.get("destinations") or
                        db_results.get("places") or
                        db_results.get("restaurants") or
                        db_results.get("hotels") or
                        db_results.get("events")
                    )
                    if has_results:
                        category_data = {}
                        if category_followup == "places" and db_results.get("places"):
                            category_data["places"] = db_results["places"]
                        elif category_followup == "hotels" and db_results.get("hotels"):
                            category_data["hotels"] = db_results["hotels"]
                        elif category_followup == "restaurants" and db_results.get("restaurants"):
                            category_data["restaurants"] = db_results["restaurants"]
                        elif category_followup == "events" and db_results.get("events"):
                            category_data["events"] = db_results["events"]

                        if category_data:
                            db_data_formatted = format_db_results_for_gemini(category_data)
                            is_dest = False
                            destination_found_in_db = True  # Mark as found for proper prompt construction
                            print(f"[AFFIRMATIVE] Set destination_found_in_db=True, category={last_offered_category}")
                            break

    user_has_valid_db_context = db_data_formatted != "" and db_data_formatted != "NOT_FOUND"

    if not is_dest and not category_followup and not user_has_valid_db_context:
        db_data_formatted = ""

    effective_category_focus = category_followup
    if user_affirmative and last_offered_category and db_data_formatted and db_data_formatted != "NOT_FOUND":
        effective_category_focus = last_offered_category

    print(f"[DEBUG] Before Gemini: is_dest={is_dest}, category_followup={category_followup}, user_affirmative={user_affirmative}, effective_category_focus={effective_category_focus}, db_data_formatted length={len(db_data_formatted) if db_data_formatted else 0}")

    response_text = generate_gemini_response(
        prompt=user_text,
        db_data=db_data_formatted,
        is_off_topic=off_topic is not None and not is_dest,
        detected_lang=detected_lang,
        available_categories=available_categories,
        offered_categories=offered_categories,
        category_focus=effective_category_focus,
        destination_found_in_db=destination_found_in_db,
        previous_bot_message=last_bot_message if user_affirmative else None,
        parent_destination=parent_destination,
        history=chat_request.messages
    )

    add_to_history(session_id, "user", user_text)
    add_to_history(session_id, "assistant", response_text)

    return ChatResponse(reply=response_text)

@app.post("/api/chat/image")
@limiter.limit("5/minute")
async def chat_with_image(
    request: Request,
    file: UploadFile = File(...),
    message: str = ""
):
    session_id = get_remote_address(request)

    if file.content_type not in ["image/jpeg", "image/png", "image/webp"]:
        raise HTTPException(
            status_code=400,
            detail="Only JPEG, PNG, and WebP images are allowed."
        )

    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail="Image size must be less than 10MB."
        )

    file_data_base64 = base64.b64encode(contents).decode("utf-8")
    safe, reason = await check_image_safety_helper(file_data_base64, file.content_type, request)
    if not safe:
        return ChatResponse(reply="This image contains inappropriate content and cannot be processed.")

    if contains_swear_word(message):
        return JSONResponse(
            status_code=400,
            content={"reply": "Please use appropriate language."}
        )

    if not GEMINI_MODEL_LIST or not GEMINI_API_KEY:
        return ChatResponse(
            reply="To analyze the image, please provide the destination name in text."
        )

    db_data = "NOT_FOUND"
    identified_place = None
    available_categories = []

    try:
        image_parts = [
            {
                "mime_type": file.content_type,
                "data": base64.b64encode(contents).decode("utf-8")
            }
        ]

        identified_place = None
        db_results = {}
        available_categories = []

        prompt = f"""Analyze this image and identify the Jordan destination shown. Output ONLY the destination name (like "Petra", "Wadi Rum", "Jerash", "Amman") or say "unknown" if you don't recognize it. Be specific about Jordan places."""

        max_attempts = len(GEMINI_MODEL_LIST)
        for attempt in range(max_attempts):
            current_model = get_current_model()
            try:
                model = genai.GenerativeModel(current_model)
                response = model.generate_content([prompt, image_parts[0]])
                print(f"[IMAGE] Identification result: {response.text}")
                identified = response.text.strip().lower()
                if identified != "unknown" and identified:
                    if "treasury" in identified or "khazneh" in identified:
                        identified = "petra"
                    elif "monastery" in identified or "ad deir" in identified:
                        identified = "petra"
                    else:
                        names = get_db_destination_names()
                        for name in names:
                            if name.lower() in identified:
                                identified = name.lower()
                                break

                    db_results = search_destinations(identified)
                    available_categories = get_available_categories(db_results)

                    has_results = (
                        db_results.get("destinations") or
                        db_results.get("places") or
                        db_results.get("restaurants") or
                        db_results.get("hotels") or
                        db_results.get("events")
                    )

                    if has_results:
                        db_data = format_db_results_for_gemini(db_results)
                    else:
                        db_data = "NOT_FOUND"
                else:
                    db_data = "NOT_FOUND"

                print(f"[IMAGE] Identified place: {identified}, Found: {len(available_categories) > 0}")
                break

            except Exception as img_error:
                error_str = str(img_error)
                is_rate_limit = "429" in error_str or "rate limit" in error_str.lower() or "quota" in error_str.lower()
                print(f"[IMAGE] Error: {error_str[:100]}")
                if is_rate_limit:
                    switch_to_next_model()
                    continue
                db_data = "NOT_FOUND"
                break

        # Convert server history to Message objects
        history_objs = []
        for h in get_conversation_history(session_id):
            history_objs.append(Message(role="assistant" if h["role"] == "assistant" else "user", content=h["content"]))
        # Add current user message with image context
        history_objs.append(Message(
            role="user",
            content=message or f"Tell me about {identified_place}",
            file_data=base64.b64encode(contents).decode("utf-8"),
            mime_type=file.content_type
        ))

        detected_lang = detect_language(message or "hello")
        response_text = generate_gemini_response(
            prompt=message or f"Tell me about {identified_place}",
            db_data=db_data,
            is_off_topic=False,
            detected_lang=detected_lang,
            available_categories=available_categories,
            offered_categories=[],
            category_focus=None,
            history=history_objs
        )

        return ChatResponse(reply=response_text)

    except Exception as e:
        print(f"[IMAGE] Error: {e}")
        return ChatResponse(
            reply="I received your image! To help you with the place in the image, please tell me the name of the destination you're asking about."
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5002)