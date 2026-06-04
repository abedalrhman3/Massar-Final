import { useState } from "react";
import styles from "./Destinations.module.css";
import DestinationCard from "../../../components/DestinationCard/DestinationCard";
import SearchBar from "../../../components/SearchBar/SearchBar";

const wadiRum = "/images/destinationCard/wadi-rum.webp";
const petra = "/images/destinationCard/Petra.jpg";

const destinations = [
    {
        id: 1,
        image: wadiRum,
        name: "Wadi Rum",
        description:
            "A vast desert landscape with red cliffs and golden sands. Ideal for trekkers and stargazers.",
        rating: 4.5,
        likes: 120,
    },
    {
        id: 2,
        image: petra,
        name: "Petra",
        description:
            "The rose-red city carved into rock, one of the world's most iconic archaeological sites.",
        rating: 4.8,
        likes: 240,
    },
    {
        id: 3,
        image: wadiRum,
        name: "Wadi Rum",
        description:
            "A vast desert landscape with red cliffs and golden sands. Ideal for trekkers and stargazers.",
        rating: 5,
        likes: 120,
    },
    {
        id: 4,
        image: petra,
        name: "Petra",
        description:
            "The rose-red city carved into rock, one of the world's most iconic archaeological sites.",
        rating: 3.5,
        likes: 240,
    },
    {
        id: 5,
        image: wadiRum,
        name: "Wadi Rum",
        description:
            "A vast desert landscape with red cliffs and golden sands. Ideal for trekkers and stargazers.",
        rating: 2,
        likes: 120,
    },
    {
        id: 6,
        image: petra,
        name: "Petra",
        description:
            "The rose-red city carved into rock, one of the world's most iconic archaeological sites.",
        rating: 4.8,
        likes: 240,
    },
    {
        id: 7,
        image: wadiRum,
        name: "Wadi Rum",
        description:
            "A vast desert landscape with red cliffs and golden sands. Ideal for trekkers and stargazers.",
        rating: 4.5,
        likes: 120,
    },
    {
        id: 8,
        image: petra,
        name: "Petra",
        description:
            "The rose-red city carved into rock, one of the world's most iconic archaeological sites.",
        rating: 4.8,
        likes: 240,
    },
    {
        id: 9,
        image: wadiRum,
        name: "Wadi Rum",
        description:
            "A vast desert landscape with red cliffs and golden sands. Ideal for trekkers and stargazers.",
        rating: 4.5,
        likes: 120,
    },
    {
        id: 10,
        image: petra,
        name: "Petra",
        description:
            "The rose-red city carved into rock, one of the world's most iconic archaeological sites.",
        rating: 4.8,
        likes: 240,
    },
    {
        id: 11,
        image: wadiRum,
        name: "Wadi Rum",
        description:
            "A vast desert landscape with red cliffs and golden sands. Ideal for trekkers and stargazers.",
        rating: 4.5,
        likes: 120,
    },
    {
        id: 12,
        image: petra,
        name: "Petra",
        description:
            "The rose-red city carved into rock, one of the world's most iconic archaeological sites.",
        rating: 4.8,
        likes: 240,
    },
    {
        id: 13,
        image: wadiRum,
        name: "Wadi Rum",
        description:
            "A vast desert landscape with red cliffs and golden sands. Ideal for trekkers and stargazers.",
        rating: 4.5,
        likes: 120,
    },
    {
        id: 14,
        image: petra,
        name: "Petra",
        description:
            "The rose-red city carved into rock, one of the world's most iconic archaeological sites.",
        rating: 4.8,
        likes: 240,
    },
    {
        id: 15,
        image: wadiRum,
        name: "Wadi Rum",
        description:
            "A vast desert landscape with red cliffs and golden sands. Ideal for trekkers and stargazers.",
        rating: 4.5,
        likes: 120,
    },
    {
        id: 16,
        image: petra,
        name: "Petra",
        description:
            "The rose-red city carved into rock, one of the world's most iconic archaeological sites.",
        rating: 4.8,
        likes: 240,
    },
    {
        id: 17,
        image: wadiRum,
        name: "Wadi Rum",
        description:
            "A vast desert landscape with red cliffs and golden sands. Ideal for trekkers and stargazers.",
        rating: 4.5,
        likes: 120,
    },
    {
        id: 18,
        image: petra,
        name: "Petra",
        description:
            "The rose-red city carved into rock, one of the world's most iconic archaeological sites.",
        rating: 4.8,
        likes: 240,
    },
    {
        id: 19,
        image: wadiRum,
        name: "Wadi Rum",
        description:
            "A vast desert landscape with red cliffs and golden sands. Ideal for trekkers and stargazers.",
        rating: 4.5,
        likes: 120,
    },
    {
        id: 20,
        image: petra,
        name: "Petra",
        description:
            "The rose-red city carved into rock, one of the world's most iconic archaeological sites.",
        rating: 4.8,
        likes: 240,
    },
    {
        id: 21,
        image: wadiRum,
        name: "Wadi Rum",
        description:
            "A vast desert landscape with red cliffs and golden sands. Ideal for trekkers and stargazers.",
        rating: 4.5,
        likes: 120,
    },
    {
        id: 22,
        image: petra,
        name: "Petra",
        description:
            "The rose-red city carved into rock, one of the world's most iconic archaeological sites.",
        rating: 4.8,
        likes: 240,
    },
    {
        id: 23,
        image: wadiRum,
        name: "Wadi Rum",
        description:
            "A vast desert landscape with red cliffs and golden sands. Ideal for trekkers and stargazers.",
        rating: 4.5,
        likes: 120,
    },
    {
        id: 24,
        image: petra,
        name: "Petra",
        description:
            "The rose-red city carved into rock, one of the world's most iconic archaeological sites.",
        rating: 4.8,
        likes: 240,
    },
    {
        id: 25,
        image: wadiRum,
        name: "Wadi Rum",
        description:
            "A vast desert landscape with red cliffs and golden sands. Ideal for trekkers and stargazers.",
        rating: 4.5,
        likes: 120,
    },
    {
        id: 26,
        image: petra,
        name: "Petra",
        description:
            "The rose-red city carved into rock, one of the world's most iconic archaeological sites.",
        rating: 4.8,
        likes: 240,
    },
    {
        id: 27,
        image: wadiRum,
        name: "Wadi Rum",
        description:
            "A vast desert landscape with red cliffs and golden sands. Ideal for trekkers and stargazers.",
        rating: 4.5,
        likes: 120,
    },
    {
        id: 28,
        image: petra,
        name: "Petra",
        description:
            "The rose-red city carved into rock, one of the world's most iconic archaeological sites.",
        rating: 4.8,
        likes: 240,
    },
    {
        id: 29,
        image: wadiRum,
        name: "Wadi Rum",
        description:
            "A vast desert landscape with red cliffs and golden sands. Ideal for trekkers and stargazers.",
        rating: 4.5,
        likes: 120,
    },
    {
        id: 30,
        image: petra,
        name: "Petra",
        description:
            "The rose-red city carved into rock, one of the world's most iconic archaeological sites.",
        rating: 4.8,
        likes: 240,
    },
    {
        id: 31,
        image: wadiRum,
        name: "Wadi Rum",
        description:
            "A vast desert landscape with red cliffs and golden sands. Ideal for trekkers and stargazers.",
        rating: 4.5,
        likes: 120,
    },
    {
        id: 32,
        image: petra,
        name: "Petra",
        description:
            "The rose-red city carved into rock, one of the world's most iconic archaeological sites.",
        rating: 4.8,
        likes: 240,
    },
    {
        id: 33,
        image: wadiRum,
        name: "Wadi Rum",
        description:
            "A vast desert landscape with red cliffs and golden sands. Ideal for trekkers and stargazers.",
        rating: 4.5,
        likes: 120,
    },
    {
        id: 34,
        image: petra,
        name: "Petra",
        description:
            "The rose-red city carved into rock, one of the world's most iconic archaeological sites.",
        rating: 4.8,
        likes: 240,
    },
];

function Destinations() {
    const [visible, setVisible] = useState(16);

    const showMore = () => {
        setVisible((prev) => prev + 16);
    };

    return (
        <>
            <div style={{ backgroundColor: "#2D6BFF" }}>
                <div className={styles.toursHero}>
                    <h2>Explore travel guides and itineraries</h2>
                    <SearchBar />
                </div>
            </div>
            <div className={styles.toursPage}>
                <div className={styles.toursGrid}>
                    {destinations.slice(0, visible).map((dest) => (
                        <DestinationCard
                            key={dest.id}
                            id={dest.id}
                            image={dest.image}
                            name={dest.name}
                            description={dest.description}
                            rating={dest.rating}
                            likes={dest.likes}
                        />
                    ))}
                </div>
                {visible < destinations.length && (
                    <button className={styles.toursMore} onClick={showMore}>
                        Show more
                    </button>
                )}
            </div>
        </>
    );
}

export default Destinations;
