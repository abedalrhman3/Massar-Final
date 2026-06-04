import { useState } from "react";
import styles from "./Destinations.module.css";
import Navbar from "../../../components/Navbar/Navbar";
import DestinationCard from "../../../components/DestinationCard/DestinationCard";
import SearchBar from "../../../components/SearchBar/SearchBar";

/* ─── Image paths ────────────────────────────────────────────────────────── */
const wadiRum = "/images/destinationCard/wadi-rum.webp";
const wadiRumBalloon = "images/destinationCard/wadi-rum-balloon.jpg";
const petra = "/images/destinationCard/Petra.jpg";
const jerash = "/images/destinationCard/jerash.jpg";
const deadSea = "/images/destinationCard/dead sea.webp";
const aqaba = "/images/destinationCard/aqaba.jpg";
const ammanCitadel = "/images/destinationCard/amman-citadel.jpg";
const ajlounCastle = "/images/destinationCard/ajloun-castle.jpg";
const danaReserve = "/images/destinationCard/dana-reserve.jpg";
const wadiMujib = "/images/destinationCard/wadi-mujib.jpg";
const madaba = "/images/destinationCard/madaba.jpg";
const mountNebo = "/images/destinationCard/mount-nebo.jpg";
const littlePetra = "/images/destinationCard/little-petra.jpg";
const ummQais = "/images/destinationCard/umm-qais.jpg";
const azraq = "/images/destinationCard/azraq.jpg";
const qasrAmra = "/images/destinationCard/qasr-amra.jpg";
const karakCastle = "/images/destinationCard/karak-castle.jpg";

/* ─── Data ───────────────────────────────────────────────────────────────── */
const topDestinations = [
    {
        id: 1,
        image: petra,
        name: "Petra",
        description:
            "The rose-red city carved into rock, one of the world's most iconic archaeological sites and a UNESCO World Heritage Site.",
        rating: 4.9,
        likes: 3200,
    },
    {
        id: 2,
        image: wadiRum,
        name: "Wadi Rum",
        description:
            "A vast desert landscape of red cliffs and golden sands, known as the Valley of the Moon. Ideal for trekking and stargazing.",
        rating: 4.8,
        likes: 2850,
    },
    {
        id: 3,
        image: deadSea,
        name: "Dead Sea",
        description:
            "The lowest point on Earth at 430 m below sea level. Float effortlessly in its mineral-rich, intensely salty waters.",
        rating: 4.7,
        likes: 2400,
    },
    {
        id: 4,
        image: jerash,
        name: "Jerash",
        description:
            "One of the best-preserved Greco-Roman cities in the world, featuring colonnaded streets, temples, and amphitheatres.",
        rating: 4.6,
        likes: 1980,
    },
    {
        id: 5,
        image: aqaba,
        name: "Aqaba",
        description:
            "Jordan's only coastal city on the Red Sea, celebrated for world-class diving, snorkelling, and sun-soaked beaches.",
        rating: 4.5,
        likes: 1740,
    },
    {
        id: 6,
        image: ammanCitadel,
        name: "Amman Citadel",
        description:
            "A hilltop archaeological site overlooking the capital, with ruins spanning the Bronze Age, Roman, Byzantine and Umayyad eras.",
        rating: 4.4,
        likes: 1520,
    },
    {
        id: 7,
        image: ajlounCastle,
        name: "Ajloun Castle",
        description:
            "A 12th-century Islamic fortress built to defend against Crusader armies, commanding panoramic views of the northern hills.",
        rating: 4.3,
        likes: 1340,
    },
    {
        id: 8,
        image: danaReserve,
        name: "Dana Biosphere Reserve",
        description:
            "Jordan's largest nature reserve, spanning sandstone mountains and canyons, home to diverse wildlife and ancient Dana village.",
        rating: 4.5,
        likes: 1120,
    },
    {
        id: 9,
        image: madaba,
        name: "Madaba",
        description:
            "The City of Mosaics, home to the famed 6th-century Byzantine mosaic map of the Holy Land inside St. George's Church.",
        rating: 4.2,
        likes: 980,
    },
    {
        id: 10,
        image: mountNebo,
        name: "Mount Nebo",
        description:
            "The sacred summit where Moses is said to have seen the Promised Land, offering sweeping views over the Jordan Valley.",
        rating: 4.1,
        likes: 870,
    },
];

const trending = [
    {
        id: 1,
        image: wadiMujib,
        name: "Wadi Mujib",
        description:
            "The world's lowest nature reserve, featuring dramatic gorges and canyons that plunge into the Dead Sea — perfect for canyoneering.",
        rating: 4.7,
        likes: 2100,
    },
    {
        id: 2,
        image: littlePetra,
        name: "Little Petra (Siq al-Barid)",
        description:
            "A compact Nabataean settlement carved into rose sandstone canyon walls, just north of Petra and far less crowded.",
        rating: 4.5,
        likes: 1650,
    },
    {
        id: 3,
        image: petra,
        name: "Petra by Night",
        description:
            "The Treasury illuminated by thousands of candles under a star-filled sky — one of the most magical experiences in the Middle East.",
        rating: 4.9,
        likes: 2900,
    },
    {
        id: 4,
        image: wadiRum,
        name: "Wadi Rum Stargazing",
        description:
            "With virtually zero light pollution, Wadi Rum offers extraordinary stargazing under an unpolluted sky straight from a Bedouin camp.",
        rating: 4.8,
        likes: 2200,
    },
    {
        id: 5,
        image: aqaba,
        name: "Aqaba Marine Park",
        description:
            "Pristine coral reefs teeming with clownfish, reef sharks, eagle rays and sea turtles — Jordan's premier dive and snorkel destination.",
        rating: 4.6,
        likes: 1800,
    },
    {
        id: 6,
        image: danaReserve,
        name: "Feynan Ecolodge",
        description:
            "An off-grid ecolodge in the heart of Dana Reserve powered entirely by solar energy, offering guided hikes with Bedouin rangers.",
        rating: 4.7,
        likes: 1430,
    },
    {
        id: 7,
        image: ajlounCastle,
        name: "Ajloun Forest Reserve",
        description:
            "Dense oak and carob forests crossed by 13 walking trails, alive with roe deer, black iris and spectacular spring wildflowers.",
        rating: 4.4,
        likes: 1150,
    },
    {
        id: 8,
        image: ammanCitadel,
        name: "Roman Theatre, Amman",
        description:
            "A 2nd-century Roman theatre cut into a hillside in downtown Amman, still seating 6,000 people and occasionally hosting live performances.",
        rating: 4.3,
        likes: 1020,
    },
    {
        id: 9,
        image: jerash,
        name: "Jerash Festival",
        description:
            "An annual summer festival held among the ancient Roman ruins, featuring Arab cultural performances, music and theatre.",
        rating: 4.5,
        likes: 1380,
    },
    {
        id: 10,
        image: deadSea,
        name: "Dead Sea Mud Spa",
        description:
            "Coat yourself in mineral-rich black mud on the shores of the Dead Sea — a centuries-old wellness ritual with remarkable skin benefits.",
        rating: 4.4,
        likes: 1560,
    },
];

const hiddenDestinations = [
    {
        id: 1,
        image: ummQais,
        name: "Umm Qais",
        description:
            "Ancient Greco-Roman Gadara in the far north, offering haunting black basalt ruins and sweeping views over the Sea of Galilee.",
        rating: 4.3,
        likes: 720,
    },
    {
        id: 2,
        image: azraq,
        name: "Azraq Wetland Reserve",
        description:
            "A desert oasis and vital wetland for migratory birds at the edge of the eastern desert — one of Jordan's best-kept natural secrets.",
        rating: 4.2,
        likes: 540,
    },
    {
        id: 3,
        image: qasrAmra,
        name: "Qasr Amra",
        description:
            "A UNESCO-listed 8th-century Umayyad desert castle famed for its remarkably preserved and vivid interior frescoes.",
        rating: 4.4,
        likes: 630,
    },
    {
        id: 4,
        image: karakCastle,
        name: "Karak Castle",
        description:
            "A formidable Crusader fortress perched 900 m above sea level with commanding views over the Dead Sea and a labyrinth of underground passages.",
        rating: 4.3,
        likes: 810,
    },
    {
        id: 5,
        image: madaba,
        name: "Madaba Mosaics Trail",
        description:
            "A self-guided walk linking Madaba's many Byzantine-era churches, each sheltering intricate floor mosaics that have survived 1,500 years.",
        rating: 4.1,
        likes: 490,
    },
    {
        id: 6,
        image: mountNebo,
        name: "Mukawir (Machaerus)",
        description:
            "A remote hilltop fortress and the legendary site where John the Baptist was imprisoned — with breathtaking Dead Sea panoramas.",
        rating: 4.0,
        likes: 370,
    },
    {
        id: 7,
        image: danaReserve,
        name: "Wadi Dana Canyon",
        description:
            "A dramatic hike descending from Dana village through spectacular canyon scenery to the desert floor of Wadi Araba.",
        rating: 4.5,
        likes: 860,
    },
    {
        id: 8,
        image: ummQais,
        name: "Pella (Tabaqat Fahl)",
        description:
            "One of the oldest continuously inhabited sites on earth, settled since 8000 BC, with ruins layered across a tel in the Jordan Valley.",
        rating: 3.9,
        likes: 290,
    },
    {
        id: 9,
        image: azraq,
        name: "Shaumari Wildlife Reserve",
        description:
            "A small desert reserve established to reintroduce locally extinct species, including the Arabian oryx, ostrich and onager.",
        rating: 4.0,
        likes: 410,
    },
    {
        id: 10,
        image: qasrAmra,
        name: "Desert Castles Loop",
        description:
            "A half-day road trip east of Amman linking a string of early Islamic hunting lodges and bathhouses across the black basalt desert.",
        rating: 4.2,
        likes: 650,
    },
];

const allDestinations = [
    ...topDestinations,
    ...trending.slice(0, 4),
    ...hiddenDestinations.slice(0, 4),
    {
        id: 101,
        image: jerash,
        name: "Jerash South Theatre",
        description:
            "The largest and best-preserved Roman theatre in Jordan, where traditional bagpipers still perform for visitors.",
        rating: 4.5,
        likes: 1100,
    },
    {
        id: 102,
        image: wadiRumBalloon,
        name: "Wadi Rum Hot Air Balloon",
        description:
            "Drift over the rust-coloured desert at sunrise in a hot air balloon for a once-in-a-lifetime view of the Valley of the Moon.",
        rating: 4.9,
        likes: 1900,
    },
];

/* ─── Sub-components ─────────────────────────────────────────────────────── */

function Tooltip({ text }) {
    return (
        <span className={styles.tooltipWrapper}>
            <span className={styles.tooltipTrigger} aria-label="More information">
                ?
            </span>
            <span className={styles.tooltipBox} role="tooltip">
                {text}
            </span>
        </span>
    );
}

const PAGE_SIZE = 8;

function Section({ title, destinations, showTooltip, tooltipText }) {
    const [visible, setVisible] = useState(PAGE_SIZE);

    const showMore = () => setVisible((prev) => prev + PAGE_SIZE);

    return (
        <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
                {title}
                {showTooltip && <Tooltip text={tooltipText} />}
            </h2>
            <div className={styles.toursGrid}>
                {destinations.slice(0, visible).map((dest) => (
                    <div key={dest.id} className={styles.cardWrapper}>
                        <DestinationCard
                            image={dest.image}
                            name={dest.name}
                            description={dest.description}
                            rating={dest.rating}
                            likes={dest.likes}
                        />
                    </div>
                ))}
            </div>
            {visible < destinations.length && (
                <button className={styles.toursMore} onClick={showMore}>
                    Show more
                </button>
            )}
        </section>
    );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */

function Tours() {
    return (
        <>
            <div style={{ backgroundColor: "#2D6BFF" }}>
                <Navbar />
                <div className={styles.toursHero}>
                    <h2>Explore travel guides and itineraries</h2>
                    <SearchBar />
                </div>
            </div>

            <div className={styles.toursPage}>
                <Section title="Top Destinations" destinations={topDestinations} />
                <Section title="Trending" destinations={trending} />
                <Section
                    title="Hidden Destinations"
                    destinations={hiddenDestinations}
                    showTooltip
                    tooltipText="These destinations aren't really hidden, but even locals might be surprised to find them in the country."
                />
                <Section title="All Destinations" destinations={allDestinations} />
            </div>
        </>
    );
}

export default Tours;
