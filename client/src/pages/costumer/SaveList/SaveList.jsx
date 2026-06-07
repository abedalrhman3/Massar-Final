import { useState, useEffect } from "react";
import styles from "./SaveList.module.css";
//import Layout from "@/components/Layout/Layout";
//import Topbar from "@/components/Topbar/Topbar";
//import Icons from "@/components/Icons/Icons";
import AdminSidebar from "../../admin/AdminSidebar";

// ── Stars ─────────────────────────────────────────────────────────
const Stars = ({ rating = 5 }) => (
  <span className={styles.stars}>
    {Array.from({ length: 5 }).map((_, i) => (
      <span
        key={i}
        style={{
          color: i < Math.round(rating) ? "#1B56FD" : "#ddd",
          fontSize: 12,
        }}
      >
        ★
      </span>
    ))}
  </span>
);

// ── Destinations (entries 31-60) ───────────────────────────────
const destinations = [
  {
    id: 31,
    title: "Ajloun Castle",
    location: "Ajloun",
    description:
      "A spectacular 12th-century Muslim fortress built by Saladins general in 1184. It features an intricate network of towers, galleries, and drawbridges designed to secure trade routes and defend against Crusaders.",
    rating: 4.7,
    reviews: 892,
    img: "/destinations/Ajloun Castle.jpg",
  },
  {
    id: 32,
    title: "Ramtha Amphitheater",
    location: "Ramtha",
    description:
      "A vital cultural and historical open-air site located in northern Jordan. It proudly hosts traditional festivals, poetry nights, and community gatherings, reflecting rich agricultural heritage.",
    rating: 4.3,
    reviews: 456,
    img: "/destinations/Ramtha Amphitheater.jpg",
  },
  {
    id: 33,
    title: "Petra",
    location: "Ma'an",
    description:
      "A world-famous archaeological treasure carved directly into vibrant red-rose sandstone cliffs by the Nabataeans over 2,000 years ago. It features stunning monuments like the Treasury and Monastery.",
    rating: 4.9,
    reviews: 3420,
    img: "/destinations/Petra.jpg",
  },
  {
    id: 34,
    title: "Jerash",
    location: "Jerash",
    description:
      "An extraordinary ancient city representing one of the largest and best-preserved Roman provincial cities in the world, boasting highlights such as Hadrians Arch, the Oval Forum, and the Cardo Maximus.",
    rating: 4.8,
    reviews: 2156,
    img: "/destinations/Jerash.jpg",
  },
  {
    id: 35,
    title: "Wadi Rum",
    location: "Aqaba Governorate",
    description:
      "A breathtaking desert wilderness also known as the Valley of the Moon. Famous for dramatic red sand dunes, massive natural sandstone arches, ancient rock inscriptions, and majestic deep canyons.",
    rating: 4.9,
    reviews: 2890,
    img: "/destinations/Wadi Rum.jpg",
  },
  {
    id: 36,
    title: "Dead Sea",
    location: "Jordan Valley",
    description:
      "The lowest point on Earth, sitting roughly 430 meters below sea level. It is globally renowned for its hyper-saline waters allowing effortless floating and mineral-rich dark therapeutic mud.",
    rating: 4.8,
    reviews: 3102,
    img: "/destinations/Dead Sea.jpg",
  },
  {
    id: 37,
    title: "Amman Citadel",
    location: "Amman",
    description:
      "A historic site located on a hill in downtown Amman. It features ancient ruins spanning the Roman, Byzantine, and Umayyad periods, including the famous Pillars of the Temple of Hercules.",
    rating: 4.5,
    reviews: 1234,
    img: "/destinations/Amman Citadel.jpg",
  },
  {
    id: 38,
    title: "Roman Theater",
    location: "Amman",
    description:
      "A 6,000-seat, 2nd-century architectural marvel carved directly into a downtown hillside. It faces north to shield spectators from the sun and is still used today for cultural events.",
    rating: 4.6,
    reviews: 1567,
    img: "/destinations/Roman Theater.jpg",
  },
  {
    id: 39,
    title: "Aqaba Coastal City",
    location: "Aqaba",
    description:
      "Jordans only coastal gateway, located on the Red Sea. It is a major hub for luxury beach resorts and marine tourism, world-renowned for crystal-clear snorkeling and scuba diving reefs.",
    rating: 4.7,
    reviews: 1876,
    img: "/destinations/Aqaba Coastal City.webp",
  },
  {
    id: 40,
    title: "Mount Nebo",
    location: "Madaba Governorate",
    description:
      "An important holy mountain overlooking the Jordan Valley. According to traditions, it is where Moses was granted a view of the Promised Land, featuring a church with Byzantine mosaic floors.",
    rating: 4.6,
    reviews: 987,
    img: "/destinations/Mount Nebo.jpg",
  },
  {
    id: 41,
    title: "Madaba City",
    location: "Madaba",
    description:
      "A historic town celebrated as the City of Mosaics. Its crown jewel is the 6th-century Byzantine mosaic map of Jerusalem and the Holy Land laid out meticulously across a church floor.",
    rating: 4.4,
    reviews: 723,
    img: "/destinations/Madaba City.jpg",
  },
  {
    id: 42,
    title: "Dana Biosphere Reserve",
    location: "Tafilah Governorate",
    description:
      "Jordans largest nature reserve, cutting through majestic sandstone cliffs and mountain ridges. It offers rugged hiking trails, birdwatching, and traditional stone-village stays.",
    rating: 4.7,
    reviews: 645,
    img: "/destinations/Dana Biosphere Reserve.jpg",
  },
  {
    id: 43,
    title: "Umm Qais",
    location: "Irbid Governorate",
    description:
      "An archaeological site in northwest Jordan featuring the ancient Greco-Roman city of Gadara, built out of distinctive black basalt stone overlooking the Sea of Galilee.",
    rating: 4.5,
    reviews: 534,
    img: "/destinations/Umm Qais.jpg",
  },
  {
    id: 44,
    title: "Al-Maghtas Baptism Site",
    location: "Jordan River Valley",
    description:
      "A UNESCO World Heritage site verified as the official biblical location of the Baptism of Jesus by John the Baptist, featuring ancient Roman and Byzantine pools.",
    rating: 4.8,
    reviews: 1123,
    img: "/destinations/Al-Maghtas Baptism Site.jpg",
  },
  {
    id: 45,
    title: "Kerak Castle",
    location: "Kerak",
    description:
      "A massive, dark Crusader fortress located in the southern city of Kerak, featuring an extensive maze of underground stone vaulted halls, kitchens, living quarters, and towers.",
    rating: 4.6,
    reviews: 876,
    img: "/destinations/Kerak Castle.JPG",
  },
  {
    id: 46,
    title: "Shobak Castle",
    location: "Ma'an Governorate",
    description:
      "An isolated Crusader fortress built in 1115 by King Baldwin I, perched on a conical mountain featuring rugged walls, secret water escape tunnels, and ancient carvings.",
    rating: 4.4,
    reviews: 432,
    img: "/destinations/Shobak Castle.jpg",
  },
  {
    id: 47,
    title: "Wadi Mujib Canyon",
    location: "Dead Sea Region",
    description:
      "A dramatic, deep desert canyon that feeds into the Dead Sea. It features the famous Siq water trail where visitors hike, climb, and swim through towering sandstone cliffs.",
    rating: 4.7,
    reviews: 987,
    img: "/destinations/Wadi Mujib Canyon.jpg",
  },
  {
    id: 48,
    title: "Quseir Amra",
    location: "Zarqa Governorate",
    description:
      "An 8th-century Umayyad desert castle and a UNESCO site. Its interior walls are covered in colorful, detailed frescoes depicting hunters, early Islamic court life, and zodiac signs.",
    rating: 4.5,
    reviews: 567,
    img: "/destinations/Quseir Amra.jpg",
  },
  {
    id: 49,
    title: "Qasr Al-Azraq",
    location: "Azraq",
    description:
      "A historic desert castle built out of black basalt stone. It served as a military fortress for the Romans and later as the desert headquarters for Lawrence of Arabia.",
    rating: 4.3,
    reviews: 345,
    img: "/destinations/Qasr Al-Azraq.jpg",
  },
  {
    id: 50,
    title: "Ma'in Hot Springs",
    location: "Madaba Governorate",
    description:
      "A natural therapeutic oasis hidden deep within a desert valley near the Dead Sea, featuring dramatic thermal waterfalls heated by underground volcanic fissures.",
    rating: 4.6,
    reviews: 789,
    img: "/destinations/Ma'in Hot Springs.jpg",
  },
  {
    id: 51,
    title: "Pella Ancient Site",
    location: "Jordan Valley",
    description:
      "An ancient archaeological site containing rich ruins spanning over 6,000 years, including Bronze Age temples, Greco-Roman structures, and Byzantine churches set against green hills.",
    rating: 4.5,
    reviews: 612,
    img: "/destinations/Pella Ancient Site.jpg",
  },
  {
    id: 52,
    title: "The Jordan Museum",
    location: "Amman",
    description:
      "The countries national repository for history and culture, housing Jordans most valuable artifacts, including the famous copper Dead Sea Scrolls and Ain Ghazal plaster statues.",
    rating: 4.8,
    reviews: 1456,
    img: "/destinations/The Jordan Museum.jpg",
  },
  {
    id: 53,
    title: "Royal Automobile Museum",
    location: "Amman",
    description:
      "A unique museum showcasing the private collection of classic cars and motorcycles belonging to the late King Hussein, charting modern political history through rare vehicles.",
    rating: 4.6,
    reviews: 923,
    img: "/destinations/Royal Automobile Museum.jpg",
  },
  {
    id: 54,
    title: "Dibbeen Forest Reserve",
    location: "Jerash Governorate",
    description:
      "A protected pine-oak forest located in northern Jordan. Spanning rolling green hills, it represents a favorite local spot for nature walks and scenic family picnics.",
    rating: 4.4,
    reviews: 478,
    img: "/destinations/Dibbeen Forest Reserve.jpg",
  },
  {
    id: 55,
    title: "Azraq Wetland Reserve",
    location: "Azraq Oasis",
    description:
      "A unique desert oasis featuring natural freshwater pools and mudflats that serve as a crucial migration stopover for thousands of migratory bird species traveling between continents.",
    rating: 4.5,
    reviews: 356,
    img: "/destinations/Azraq Wetland Reserve.JPG",
  },
  {
    id: 56,
    title: "Ajloun Forest Reserve",
    location: "Ajloun",
    description:
      "Features open woodlands of evergreen oak, carob, and wild pistachio trees in northern Jordan, offering eco-cabins, organic food trails, and beautiful guided nature hikes.",
    rating: 4.6,
    reviews: 534,
    img: "/destinations/Ajloun Forest Reserve.jpg",
  },
  {
    id: 57,
    title: "Mukawir Hilltop",
    location: "Madaba Governorate",
    description:
      "A fortified hilltop archaeological site holding deep historic significance as the location of Herods palace, where ancient records state John the Baptist was imprisoned.",
    rating: 4.3,
    reviews: 289,
    img: "/destinations/Mukawir Hilltop.jpg",
  },
  {
    id: 58,
    title: "Cave of Seven Sleepers",
    location: "Amman",
    description:
      "A religious heritage site tied to a famous story in both Christian and Islamic traditions, featuring ancient rock-cut tombs believed to belong to young men fleeing persecution.",
    rating: 4.4,
    reviews: 412,
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT4XzansgKwERKb67XUGA3m-kbMqmnB2fBJnzPxVqIK05sFm3Ltuzpbz3zsiA85SaCGAje5BCFviiRRCDD3TZ6FVpyHXccWTE7eacLn62mlVg&s=10",
  },
  {
    id: 59,
    title: "Qasr Al-Kharana",
    location: "Eastern Desert Plains",
    description:
      "One of the best-preserved Umayyad desert castles, standing isolated in the eastern plains. Built in the early 8th century, it features a stark square architecture with arrow slits.",
    rating: 4.3,
    reviews: 267,
    img: "/destinations/Qasr Al-Kharana.jpg",
  },
  {
    id: 60,
    title: "Rainbow Street",
    location: "Amman",
    description:
      "A historic, vibrant cobblestone street located in Ammans old Jabal Amman district, famous for its lively cafes, local art galleries, street food stalls, and scenic viewpoints.",
    rating: 4.7,
    reviews: 1678,
    img: "/destinations/Rainbow Street.jpg",
  },
];

// ── Hotels (entries 1-8) ─────────────────────────────────────────
const hotels = [
  {
    id: 1,
    title: "Landmark Amman Hotel & Conference Center",
    location: "Amman, Jordan",
    description:
      "A landmark five-star business hotel in central Amman, offering spacious rooms, world-class conference facilities, and easy access to the city's major attractions.",
    rating: 4.5,
    reviews: 2100,
    img: "/images/Hotels/Landmark Amman Hotel & Conference Center.jpg",
  },
  {
    id: 2,
    title: "Movenpick Hotel Amman",
    location: "Amman, Jordan",
    description:
      "A prestigious international hotel in the heart of Amman, renowned for its Swiss hospitality, rooftop pool, and panoramic views over the city hills.",
    rating: 4.6,
    reviews: 2450,
    img: "/images/Hotels/Movenpick Hotel Amman.jpg",
  },
];

// ── Restaurants (entries 1-10) ────────────────────────────────────
const restaurants = [
  {
    id: 1,
    title: "High Garden Rooftop",
    location: "Amman, Jordan",
    description:
      "A stunning rooftop dining experience in the heart of Amman, offering panoramic city views alongside a creative Mediterranean menu with local Jordanian influences.",
    rating: 4.7,
    reviews: 1240,
    img: "/images/Restaurants/High Garden Rooftop.jpg",
  },
  {
    id: 2,
    title: "Jubran",
    location: "Amman, Jordan",
    description:
      "A beloved Amman institution serving authentic Levantine cuisine in a warm, family-style setting. Famous for its mezze spread and slow-cooked lamb dishes.",
    rating: 4.6,
    reviews: 980,
    img: "/images/Restaurants/Jubran.jpg",
  },
  {
    id: 3,
    title: "Sakeyat Addaraweesh",
    location: "Amman, Jordan",
    description:
      "A charming heritage restaurant set in a traditional Jordanian house, celebrated for its cultural atmosphere and classic home-cooked Jordanian dishes.",
    rating: 4.5,
    reviews: 760,
    img: "/images/Restaurants/Sakeyat Addaraweesh.jpg",
  },
];

// ── Events (5 Jordanian events) ──────────────────────────────────
const jordanEvents = [
  {
    id: 1,
    title: "Jerash Festival for Culture and Arts",
    description:
      "An enchanting summer celebration held in the ancient Roman city of Jerash, where the grand amphitheater comes alive with traditional Jordanian dance, folk music, and theatrical performances beneath millennia-old columns. The festival transforms one of the world's best-preserved Roman cities into a vibrant cultural hub, drawing artists from across the Arab world to perform against the backdrop of stone colonnades and historic temples.",
    location: "Jerash",
    date: "July - August",
    category: "Cultural Festival",
    img: "/images/Events/Jerash Festival for Culture and Arts.jpg",
  },
  {
    id: 2,
    title: "Fuheis Festival",
    description:
      "A beloved annual gathering in the charming town of Al-Fuheis northwest of Amman, where families flock each August for a week of exhilarating concerts, theatrical productions, and traditional folklore exhibitions. The festival has been a cornerstone of Jordanian cultural life since 1990, featuring renowned Arab singers and entertainers who perform on open-air stages against the backdrop of this picturesque hilltown.",
    location: "Al-Fuheis",
    date: "August",
    category: "Music & Arts",
    img: "/images/Events/Fuheis Festival.jpg",
  },
  {
    id: 3,
    title: "Amman International Film Festival",
    description:
      "Jordan's premier cinematic celebration bringing together debut filmmakers from around the world for a week of compelling narratives, documentaries, and short films at the historic Hussein Cultural Center. The festival showcases the best of Arab cinema while fostering emerging talent through industry workshops and networking events, transforming Amman into a vibrant gathering point for cinema enthusiasts and creators alike.",
    location: "Amman",
    date: "July",
    category: "Film Festival",
    img: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: 4,
    title: "The Jordan Rally",
    description:
      "The Middle East's most prestigious motorsport competition, thundering through the dramatic landscapes of the Dead Sea region and Jordan Valley as part of the FIA Middle East Rally Championship. Professional drivers navigate challenging desert stages, their vehicles kicking up dust against the surreal backdrop of the lowest point on Earth, while spectators gather at strategic viewpoints to witness high-speed action.",
    location: "Dead Sea / Jordan Valley",
    date: "May",
    category: "Motorsport",
    img: "/images/Events/The Jordan Rally.jpg",
  },
  {
    id: 5,
    title: "Aqaba Traditional Arts Festival",
    description:
      "A captivating celebration of Jordanian heritage and craftsmanship set along the Red Sea coastline of Aqaba, where artisan stalls showcase handwoven textiles, intricate pottery, and traditional jewelry. The festival comes alive with mesmerizing Bedouin dance performances, calligraphy workshops, and folkloric music echoing through the coastal air, offering visitors an authentic immersion into centuries-old traditions.",
    location: "Aqaba",
    date: "April",
    category: "Cultural Heritage",
    img: "/images/Events/Aqaba Traditional Arts Festival.webp",
  },
];

// ── PAGE ──────────────────────────────────────────────────────────
export default function SavedLists() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeEventIndex, setActiveEventIndex] = useState(0);
  const topbar = (
    {/* <Topbar title="The Editorial Archive" onSearch={setSearchQuery} /> */ }
  );

  // Auto-rotate events every 7 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveEventIndex((prev) => (prev + 1) % jordanEvents.length);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  const currentEvent = jordanEvents[activeEventIndex];

  return (
    <main className={styles.main}>
      <AdminSidebar type={"user"} />
      {/* Page Header */}
      < div className={styles.pageHeader} >
        <h1 className={styles.pageTitle}>Save Lists</h1>
        <p className={styles.pageSubtitle}>
          A curated collection of destinations, experiences, and luxury
          accommodations
          <br />
          flagged for upcoming editorial features.
        </p>
      </div >

      {/* ── Saved Destinations ── */}
      < section className={styles.section} >
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Saved Destinations</h2>
          <button className={styles.viewAllBtn}>View All</button>
        </div>
        <div className={styles.destGrid}>
          {destinations.slice(0, 6).map((d) => (
            <div key={d.id} className={styles.destCard}>
              <div className={styles.destImgWrap}>
                <img src={d.img} alt={d.title} className={styles.destImg} />
              </div>
              <div className={styles.destBody}>
                <h3 className={styles.destTitle}>{d.title}</h3>
                <p className={styles.destDesc}>{d.description}</p>
                <div className={styles.destFooter}>
                  <div className={styles.ratingRow}>
                    <span className={styles.ratingLabel}>Rating</span>
                    <Stars rating={d.rating} />
                  </div>
                  <span className={styles.destCount}>{d.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section >

      {/* ── Restaurants & Hotels ── */}
      < div className={styles.twoColSection} >
        {/* Restaurants */}
        < section >
          <h2 className={styles.sectionTitle} style={{ marginBottom: 16 }}>
            Restaurants
          </h2>
          <div className={styles.listCards}>
            {restaurants.map((r) => (
              <div key={r.id} className={styles.listCard}>
                <img src={r.img} alt={r.title} className={styles.listCardImg} />
                <div className={styles.listCardBody}>
                  <h3 className={styles.listCardTitle}>{r.title}</h3>
                  <p className={styles.listCardDesc}>{r.description}</p>
                  <div className={styles.listCardFooter}>
                    <Stars rating={r.rating} />
                    <span className={styles.listCardLocation}>
                      {r.location}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section >

        {/* Hotels */}
        < section >
          <h2 className={styles.sectionTitle} style={{ marginBottom: 16 }}>
            Hotels
          </h2>
          <div className={styles.listCards}>
            {hotels.map((h) => (
              <div key={h.id} className={styles.listCard}>
                <img src={h.img} alt={h.title} className={styles.listCardImg} />
                <div className={styles.listCardBody}>
                  <h3 className={styles.listCardTitle}>{h.title}</h3>
                  <p className={styles.listCardDesc}>{h.description}</p>
                  <div className={styles.listCardFooter}>
                    <Stars rating={h.rating} />
                    <span className={styles.listCardLocation}>
                      {h.location}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section >
      </div >

      {/* ── Events (Carousel) ── */}
      < section className={styles.section} >
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Events</h2>
          <button className={styles.viewAllBtn} style={{ color: "#1b56fd" }}>
            Full Calendar
          </button>
        </div>
        <div className={styles.eventsLayout}>
          {/* Featured event with carousel */}
          <div className={styles.eventFeatured}>
            <img
              src={currentEvent.img}
              alt={currentEvent.title}
              className={styles.eventFeaturedImg}
            />
            <div className={styles.eventFeaturedOverlay}>
              <h3 className={styles.eventFeaturedTitle}>
                {currentEvent.title}
              </h3>
              <p className={styles.eventFeaturedDesc}>
                {currentEvent.description}
              </p>
              <div className={styles.eventTags}>
                <span className={styles.eventTag}>{currentEvent.category}</span>
                <span className={styles.eventTag}>{currentEvent.location}</span>
              </div>
            </div>
            {/* Dot indicators */}
            <div
              style={{
                position: "absolute",
                bottom: "16px",
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                gap: "8px",
                zIndex: 10,
              }}
            >
              {jordanEvents.map((_, idx) => (
                <span
                  key={idx}
                  onClick={() => setActiveEventIndex(idx)}
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background:
                      idx === activeEventIndex
                        ? "#fff"
                        : "rgba(255,255,255,0.4)",
                    cursor: "pointer",
                    transition: "background 0.3s",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Side event card synced with featured */}
          <div className={styles.eventSideCard}>
            <div className={styles.eventSideIcon}>🏛️</div>
            <h3 className={styles.eventSideTitle}>{currentEvent.title}</h3>
            <p className={styles.eventSideDesc}>{currentEvent.description}</p>
            <div className={styles.eventSideMeta}>
              <span className={styles.eventSideDate}>{currentEvent.date}</span>
              <span className={styles.eventSideDot}>•</span>
              <span className={styles.eventSideLocation}>
                {currentEvent.location}
              </span>
            </div>
            <button className={styles.eventDetailsBtn}>DETAILS</button>
          </div>
        </div>
      </section >
    </main>
  );
}
