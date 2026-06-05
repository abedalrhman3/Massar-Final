// DestinationDetails.utils.js

// Maps a backend place/restaurant/hotel/event to the card shape RightPanel expects.
// The "details" sub-object is constructed from the listing's own fields.
function toCard(item, section) {
    return {
        _id: item._id,
        id: item._id,
        name: item.name,
        image: item.coverImage,
        isSaved: false,           // you can wire saved state later
        details: {
            section,
            about: section === "events"
                ? {
                    address: item.location?.address ?? "",
                    fees: item.startingFromPrice ? `${item.startingFromPrice} JOD` : "—",
                    startDate: item.startDate ? new Date(item.startDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "",
                    endDate: item.endDate ? new Date(item.endDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "",
                    startTime: item.startTime?.formatted ?? "",
                    endTime: item.endTime?.formatted ?? "",
                }
                : {
                    address: item.location?.address ?? "",
                    workDays: [],           // not in API — leave empty or omit
                    cost: item.startingFromPrice ? `From ${item.startingFromPrice} JOD` : "—",
                    openTime: "",
                    closeTime: "",
                },
            reviews: {
                rating: 0,
                reviewsNumber: 0,
                fiveStarReviews: 0, fourStarReviews: 0,
                threeStarReviews: 0, twoStarReviews: 0, oneStarReviews: 0,
                comments: [],
            },
            contact: item.contact ?? {},
            photos: item.images ?? [],
            ...(section === "hotels" && {
                book: { bookingUrl: item.bookingUrl ?? "" }
            }),
        }
    }
}

export function buildComposed(destination, details, places, restaurants, hotels, events) {
    const ov = details?.overview ?? {}
    const acts = details?.activities ?? []
    const guide = details?.guideSections ?? []

    return {
        _id: destination._id,
        id: destination._id,
        name: destination.name,
        title: destination.subtitle ?? "",
        lat: destination.location?.coordinates?.[1],
        lng: destination.location?.coordinates?.[0],
        imageURL: destination.image,
        sections: {
            overview: {
                title: "Overview",
                description: ov.description ?? "",
                location: ov.location ?? "",
                recommendedStay: ov.recommendedStay ?? "",
                bestSeason: ov.bestSeason ?? "",
                averageCost: ov.averageCost ?? "",
            },
            activities: {
                title: "Activities",
                list: acts,
            },
            travelGuide: {
                subTitle: "Travel Guide",
                list: guide.map(s => ({
                    subTitle: s.title,
                    body: s.items?.length ? s.items : s.body ?? "",
                })),
            },
            placesToVisit: {
                title: "Places to Visit",
                placesList: places.map(p => toCard(p, "places to visit")),
            },
            foodAndDining: {
                title: "Food and Dining",
                restaurants: {
                    subTitle: "Restaurants",
                    isAvailable: restaurants.length > 0,
                    cardList: restaurants.map(r => toCard(r, "foodAndDining")),
                },
                traditionalDining: {
                    subTitle: "Traditional Dining",
                    isAvailable: false,   // no API endpoint for this yet
                    cardList: [],
                },
            },
            hotels: {
                title: "Hotels",
                cardList: hotels.map(h => toCard(h, "hotels")),
            },
            events: {
                title: "Events",
                cardList: events.map(e => toCard(e, "events")),
            },
        },
    }
}