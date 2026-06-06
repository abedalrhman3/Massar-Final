// DestinationDetails.utils.js

// Maps a backend place/restaurant/hotel/event to the card shape RightPanel expects.
// The "details" sub-object is constructed from the listing's own fields.
function toCard(item, section) {
    return {
        _id: item._id,
        id: item._id,
        name: item.name,
        image: item.coverImage,
        isSaved: false,
        details: {
            section,
            about: section === "events"
                ? {
                    address: item.contact?.methods?.find(m => m.type === "address")?.value
                        ?? item.location?.address ?? "",
                    fees: item.startingFromPrice ? `${item.startingFromPrice} JOD` : "—",
                    startDate: item.startDate ? new Date(item.startDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "",
                    endDate: item.endDate ? new Date(item.endDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "",
                    startTime: typeof item.startTime === "string" ? item.startTime : "",
                    endTime:   typeof item.endTime   === "string" ? item.endTime   : "",
                    durationText: item.durationText ?? "",
                }
                : {
                    address: item.contact?.methods?.find(m => m.type === "address")?.value
                        ?? item.location?.address ?? "",
                    workDays: item.workingDays ?? [],
                    cost: item.budget ? `${item.budget}` : item.startingFromPrice ? `From ${item.startingFromPrice} JOD` : "—",
                    openTime: item.operatingHours?.start ?? "",
                    closeTime: item.operatingHours?.end ?? "",
                },
            reviews: {
                rating: 0,
                reviewsNumber: 0,
                fiveStarReviews: 0, fourStarReviews: 0,
                threeStarReviews: 0, twoStarReviews: 0, oneStarReviews: 0,
                comments: [],
            },
            contact: item.contact ?? {},
            photos: [
                ...(item.coverImage ? [item.coverImage] : []),
                ...(item.images || [])
            ].filter((val, index, self) => self.indexOf(val) === index),
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

    const firstPlace = places?.[0];
    const fallbackLat = firstPlace?.location?.coordinates?.[1] || 31.9539;
    const fallbackLng = firstPlace?.location?.coordinates?.[0] || 35.9106;

    const lat = typeof destination.location?.coordinates?.[1] === "number"
        ? destination.location.coordinates[1]
        : fallbackLat;

    const lng = typeof destination.location?.coordinates?.[0] === "number"
        ? destination.location.coordinates[0]
        : fallbackLng;

    return {
        // Nest destination info to match LeftPanel expectation (data.destination)
        destination: {
            _id: destination._id,
            id: destination._id,
            name: destination.name,
            title: destination.tagline ?? "",
            image: destination.image,
            location: ov.locationText ?? "",
        },
        _id: destination._id,
        id: destination._id,
        name: destination.name,
        title: destination.tagline ?? "",
        lat,
        lng,
        imageURL: destination.image,
        isLiked: destination.isLiked ?? false,
        sections: {
            overview: {
                title: "Overview",
                description: ov.text ?? "",
                location: ov.locationText ?? "",
                bestSeason: ov.bestSeason ?? "",
                averageCost: ov.averageCost ?? "",
                recommendedStay: ov.recommendedStay ?? "",
                details: {
                    bestSeason: ov.bestSeason ?? "",
                    averageCost: ov.averageCost ?? "",
                    recommendedStay: ov.recommendedStay ?? "",
                }
            },
            activities: {
                title: "Activities",
                list: acts.map(a => typeof a === 'object' ? a.name : a),
            },
            travelGuide: {
                subTitle: "Travel Guide",
                list: guide.map(s => ({
                    subTitle: s.title,
                    body: s.content ?? s.body ?? "",
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