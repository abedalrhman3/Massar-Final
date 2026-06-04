const mockData = {
    id: 1,
    name: "Wadi Rum",
    title: "The Valley of the Moon",
    lat: 29.5722,
    lng: 35.4181,
    description: "A vast, silent desert of rust-red cliffs and golden sands — Wadi Rum is Jordan's most breathtaking escape.",
    imageURL: "/images/destinationCard/wadi-rum.webp",
    sections: {
        overview: {
            title: "Overview",
            description: "Wadi Rum is a breathtaking protected desert wilderness in southern Jordan, carved by wind and time into towering red sandstone cliffs and vast golden plains. It is one of the most iconic landscapes in the Middle East — a place where Bedouin culture, ancient history, and raw natural beauty meet under one of the clearest night skies on earth.",
            location: "Southern Jordan, 4 hours from Amman",
            recommendedStay: "1 — 2 Days",
            bestSeason: "October — April",
            averageCost: "25 — 80 JOD / 35 — 115 USD per day"
        },
        activities: {
            title: "Activities",
            list: [
                "Camel Trek",
                "Stargazing",
                "Rock Climbing",
                "Sunrise and Sunset Views",
                "Bedouin Camp Experience"
            ]
        },
        placesToVisit: {
            title: "Places to Visit",
            placesList: [
                {
                    id: 1,
                    category: "nature",
                    name: "Jabal Rum",
                    description: "The highest peak in Jordan at 1754 meters. A popular destination for serious climbers and hikers looking for a challenge.",
                    image: "/images/detailPage/jabal-rum.jpg",
                    details: {
                        section: "places to visit",
                        about: {
                            title: "About",
                            address: "Wadi Rum",
                            workDays: ["Su", "Mo", "Tu", "We", "Th", "Fr"],
                            cost: "10 - 15 JOD / 20 - 30 USD",
                            openTime: "8:00 AM",
                            closeTime: "5:00 PM",
                        },
                        reviews: {
                            title: "Reviews",
                            rating: 4.5,
                            label: "",
                            reviewsNumber: 4439,
                            fiveStarReviews: 3079,
                            fourStarReviews: 783,
                            threeStarReviews: 270,
                            twoStarReviews: 124,
                            oneStarReviews: 183,
                            comments: [
                                 { rating: 5, name: "John", body: "test testtesttest testtesttestt esttesttest testtesttesttes ttesttestte sttestte sttesttesttest testtestt esttesttestte sttesttesttest test." },
                                    { rating: 5, name: "John", body: "testtes ttesttesttestt esttesttesttesttestt esttesttesttesttest testtesttest testtesttesttesttestte ttesttesttesttesttes ttesttesttest." }
                            ]
                        },
                        photos: [
                            "/images/detailPage/jabal-rum.jpg",
                            "/images/detailPage/jabal-rum.jpg",
                            "/images/detailPage/jabal-rum.jpg",
                            "/images/detailPage/jabal-rum.jpg",
                            "/images/detailPage/jabal-rum.jpg",
                            "/images/detailPage/jabal-rum.jpg",
                            "/images/detailPage/jabal-rum.jpg",
                            "/images/detailPage/jabal-rum.jpg"
                        ]
                    }
                },
                {
                    id: 2,
                    category: "nature",
                    name: "Jabal Rum",
                    description: "The highest peak in Jordan at 1754 meters. A popular destination for serious climbers and hikers looking for a challenge.",
                    image: "/images/detailPage/jabal-rum.jpg",
                    details: {
                        section: "places to visit",
                        about: {
                            title: "About",
                            address: "Wadi Rum",
                            workDays: ["Su", "Mo", "Tu", "We", "Th", "Fr"],
                            cost: "10 - 15 JOD / 20 - 30 USD",
                            openTime: "8:00 AM",
                            closeTime: "5:00 PM",
                        },
                        reviews: {
                            title: "Reviews",
                            rating: 4.5,
                            label: "",
                            reviewsNumber: 4439,
                            fiveStarReviews: 3079,
                            fourStarReviews: 783,
                            threeStarReviews: 270,
                            twoStarReviews: 124,
                            oneStarReviews: 183,
                            comments: [
                                 { rating: 5, name: "John", body: "test testtesttest testtesttestt esttesttest testtesttesttes ttesttestte sttestte sttesttesttest testtestt esttesttestte sttesttesttest test." },
                                    { rating: 5, name: "John", body: "testtes ttesttesttestt esttesttesttesttestt esttesttesttesttest testtesttest testtesttesttesttestte ttesttesttesttesttes ttesttesttest." }
                            ]
                        },
                        photos: [
                            "/images/detailPage/jabal-rum.jpg",
                            "/images/detailPage/jabal-rum.jpg",
                            "/images/detailPage/jabal-rum.jpg",
                            "/images/detailPage/jabal-rum.jpg",
                            "/images/detailPage/jabal-rum.jpg",
                            "/images/detailPage/jabal-rum.jpg",
                            "/images/detailPage/jabal-rum.jpg",
                            "/images/detailPage/jabal-rum.jpg"
                        ]
                    }
                },
                {
                    id: 3,
                    category: "nature",
                    name: "Jabal Rum",
                    description: "The highest peak in Jordan at 1754 meters. A popular destination for serious climbers and hikers looking for a challenge.",
                    image: "/images/detailPage/jabal-rum.jpg",
                    details: {
                        section: "places to visit",
                        about: {
                            title: "About",
                            address: "Wadi Rum",
                            workDays: ["Su", "Mo", "Tu", "We", "Th", "Fr"],
                            cost: "10 - 15 JOD / 20 - 30 USD",
                            openTime: "8:00 AM",
                            closeTime: "5:00 PM",
                        },
                        reviews: {
                            title: "Reviews",
                            rating: 4.5,
                            label: "",
                            reviewsNumber: 4439,
                            fiveStarReviews: 3079,
                            fourStarReviews: 783,
                            threeStarReviews: 270,
                            twoStarReviews: 124,
                            oneStarReviews: 183,
                            comments: [
                                 { rating: 5, name: "John", body: "test testtesttest testtesttestt esttesttest testtesttesttes ttesttestte sttestte sttesttesttest testtestt esttesttestte sttesttesttest test." },
                                    { rating: 5, name: "John", body: "testtes ttesttesttestt esttesttesttesttestt esttesttesttesttest testtesttest testtesttesttesttestte ttesttesttesttesttes ttesttesttest." }
                            ]
                        },
                        photos: [
                            "/images/detailPage/jabal-rum.jpg",
                            "/images/detailPage/jabal-rum.jpg",
                            "/images/detailPage/jabal-rum.jpg",
                            "/images/detailPage/jabal-rum.jpg",
                            "/images/detailPage/jabal-rum.jpg",
                            "/images/detailPage/jabal-rum.jpg",
                            "/images/detailPage/jabal-rum.jpg",
                            "/images/detailPage/jabal-rum.jpg"
                        ]
                    }
                },
                {
                    id: 4,
                    category: "nature",
                    name: "Jabal Rum",
                    description: "The highest peak in Jordan at 1754 meters. A popular destination for serious climbers and hikers looking for a challenge.",
                    image: "/images/detailPage/jabal-rum.jpg",
                    details: {
                        section: "places to visit",
                        about: {
                            title: "About",
                            address: "Wadi Rum",
                            workDays: ["Su", "Mo", "Tu", "We", "Th", "Fr"],
                            cost: "10 - 15 JOD / 20 - 30 USD",
                            openTime: "8:00 AM",
                            closeTime: "5:00 PM",
                        },
                        reviews: {
                            title: "Reviews",
                            rating: 4.5,
                            label: "",
                            reviewsNumber: 4439,
                            fiveStarReviews: 3079,
                            fourStarReviews: 783,
                            threeStarReviews: 270,
                            twoStarReviews: 124,
                            oneStarReviews: 183,
                            comments: [
                                 { rating: 5, name: "John", body: "test testtesttest testtesttestt esttesttest testtesttesttes ttesttestte sttestte sttesttesttest testtestt esttesttestte sttesttesttest test." },
                                    { rating: 5, name: "John", body: "testtes ttesttesttestt esttesttesttesttestt esttesttesttesttest testtesttest testtesttesttesttestte ttesttesttesttesttes ttesttesttest." }
                            ]
                        },
                        photos: [
                            "/images/detailPage/jabal-rum.jpg",
                            "/images/detailPage/jabal-rum.jpg",
                            "/images/detailPage/jabal-rum.jpg",
                            "/images/detailPage/jabal-rum.jpg",
                            "/images/detailPage/jabal-rum.jpg",
                            "/images/detailPage/jabal-rum.jpg",
                            "/images/detailPage/jabal-rum.jpg",
                            "/images/detailPage/jabal-rum.jpg"
                        ]
                    }
                },
                {
                    id: 5,
                    category: "nature",
                    name: "Jabal Rum",
                    description: "The highest peak in Jordan at 1754 meters. A popular destination for serious climbers and hikers looking for a challenge.",
                    image: "/images/detailPage/jabal-rum.jpg",
                    details: {
                        section: "places to visit",
                        about: {
                            title: "About",
                            address: "Wadi Rum",
                            workDays: ["Su", "Mo", "Tu", "We", "Th", "Fr"],
                            cost: "10 - 15 JOD / 20 - 30 USD",
                            openTime: "8:00 AM",
                            closeTime: "5:00 PM",
                        },
                        reviews: {
                            title: "Reviews",
                            rating: 4.5,
                            label: "",
                            reviewsNumber: 4439,
                            fiveStarReviews: 3079,
                            fourStarReviews: 783,
                            threeStarReviews: 270,
                            twoStarReviews: 124,
                            oneStarReviews: 183,
                            comments: [
                                 { rating: 5, name: "John", body: "test testtesttest testtesttestt esttesttest testtesttesttes ttesttestte sttestte sttesttesttest testtestt esttesttestte sttesttesttest test." },
                                    { rating: 5, name: "John", body: "testtes ttesttesttestt esttesttesttesttestt esttesttesttesttest testtesttest testtesttesttesttestte ttesttesttesttesttes ttesttesttest." }
                            ]
                        },
                        photos: [
                            "/images/detailPage/jabal-rum.jpg",
                            "/images/detailPage/jabal-rum.jpg",
                            "/images/detailPage/jabal-rum.jpg",
                            "/images/detailPage/jabal-rum.jpg",
                            "/images/detailPage/jabal-rum.jpg",
                            "/images/detailPage/jabal-rum.jpg",
                            "/images/detailPage/jabal-rum.jpg",
                            "/images/detailPage/jabal-rum.jpg"
                        ]
                    }
                }
            ]
        },
        travelGuide: {
            subTitle: "Travel Guide",
            list: [
                {
                    subTitle: "How to Get There",
                    body: "Wadi Rum is located 319km south of Amman. You can reach it by renting a car via the Desert Highway, which is the most flexible option. Alternatively, JETT buses run daily from Amman's Abdali station to Aqaba with a drop-off point near Wadi Rum village. The drive takes approximately 4 hours.",
                },
                {
                    subTitle: "Best Time to Visit",
                    body: "October through April is ideal when temperatures are comfortable for outdoor activities. Summer months from June to August can be extremely hot during the day, reaching up to 39°C, though nights remain cool. Spring in March and April offers the most pleasant weather overall.",
                },
                {
                    subTitle: "What to Bring",
                    body: [
                        "Sunscreen and a hat for daytime",
                        "A warm layer for the night, even in summer the desert gets cold",
                        "Comfortable closed shoes for walking and climbing",
                        "Cash, as most camps and guides don't accept cards",
                        "A power bank, network coverage is limited inside the reserve"
                    ]
                },
                {
                    subTitle: "Budget Guide",
                    body: [
                        { subTitle: "Entry to Wadi Rum Reserve", cost: "4 JOD / 7 USD" },
                        { subTitle: "Entry to Wadi Rum Reserve ", cost: "24 — 35 JOD / 35 — 50 USD" },
                        { subTitle: "Full day jeep tour  ", cost: "44 — 60 JOD / 65 — 85 USD" },
                        { subTitle: "Overnight Bedouin camp ", cost: "29 — 50 JOD / 42 — 70 USD" },
                        { subTitle: "Camel trek (0–2 hours) ", cost: "14 — 25 JOD / 21 — 35 USD" }
                    ]
                }
            ]
        },
        foodAndDining: {
            title: "Food and Dining",
            restaurants: {
                subTitle: "Restaurant",
                isAvailable: true,
                cardList: [
                    {
                        id: 1,
                        isSaved: false,
                        name: "Rum Gate",
                        image: "/images/detailPage/wadi-rum-restaurant1.jpg",
                        details: {
                            section: "foodAndDining",
                            about: {
                                address: "Wadi Rum",
                                workDays: ["Su", "Mo", "Tu", "We", "Th", "Fr"],
                                cost: "10 - 15 JOD / 20 - 30 USD",
                                openTime: "8:00 AM",
                                closeTime: "5:00 PM",
                            },
                            reviews: {
                                rating: 4.5,
                                label: "",
                                reviewsNumber: 4439,
                                fiveStarReviews: 3079,
                                fourStarReviews: 783,
                                threeStarReviews: 270,
                                twoStarReviews: 124,
                                oneStarReviews: 183,
                                comments: [
                                    { rating: 5, name: "John", body: "test testtesttest testtesttestt esttesttest testtesttesttes ttesttestte sttestte sttesttesttest testtestt esttesttestte sttesttesttest test." },
                                    { rating: 5, name: "John", body: "testtes ttesttesttestt esttesttesttesttestt esttesttesttesttest testtesttest testtesttesttesttestte ttesttesttesttesttes ttesttesttest." }
                                ]
                            },
                            contact: {
                                phone: "0776108606",
                                whatsapp: "9620776108606",
                                facebook: "Facebook@gmail.com",
                                instagram: "User",
                                x: "User"
                            },
                            photos: [
                                "/images/detailPage/wadi-rum-restaurant1.jpg",
                                "/images/detailPage/wadi-rum-restaurant1.jpg",
                                "/images/detailPage/wadi-rum-restaurant1.jpg",
                                "/images/detailPage/wadi-rum-restaurant1.jpg",
                                "/images/detailPage/wadi-rum-restaurant1.jpg",
                                "/images/detailPage/wadi-rum-restaurant1.jpg",
                                "/images/detailPage/wadi-rum-restaurant1.jpg",
                                "/images/detailPage/wadi-rum-restaurant1.jpg"
                            ]
                        }
                    },
                    {
                        id: 2,
                        isSaved: false,
                        name: "Rum Gate",
                        image: "/images/detailPage/wadi-rum-restaurant1.jpg",
                        details: {
                            section: "foodAndDining",
                            about: {
                                address: "Wadi Rum",
                                workDays: ["Su", "Mo", "Tu", "We", "Th", "Fr"],
                                cost: "10 - 15 JOD / 20 - 30 USD",
                                openTime: "8:00 AM",
                                closeTime: "5:00 PM",
                            },
                            reviews: {
                                rating: 4.5,
                                label: "",
                                reviewsNumber: 4439,
                                fiveStarReviews: 3079,
                                fourStarReviews: 783,
                                threeStarReviews: 270,
                                twoStarReviews: 124,
                                oneStarReviews: 183,
                                comments: [
                                     { rating: 5, name: "John", body: "test testtesttest testtesttestt esttesttest testtesttesttes ttesttestte sttestte sttesttesttest testtestt esttesttestte sttesttesttest test." },
                                    { rating: 5, name: "John", body: "testtes ttesttesttestt esttesttesttesttestt esttesttesttesttest testtesttest testtesttesttesttestte ttesttesttesttesttes ttesttesttest." }
                                ]
                            },
                            contact: {
                                phone: "0776108606",
                                whatsapp: "0776108606",
                                facebook: "Facebook@gmail.com",
                                instagram: "User",
                                x: "User"
                            },
                            photos: [
                                "/images/detailPage/wadi-rum-restaurant1.jpg",
                                "/images/detailPage/wadi-rum-restaurant1.jpg",
                                "/images/detailPage/wadi-rum-restaurant1.jpg",
                                "/images/detailPage/wadi-rum-restaurant1.jpg",
                                "/images/detailPage/wadi-rum-restaurant1.jpg",
                                "/images/detailPage/wadi-rum-restaurant1.jpg",
                                "/images/detailPage/wadi-rum-restaurant1.jpg",
                                "/images/detailPage/wadi-rum-restaurant1.jpg"
                            ]
                        }
                    },
                    {
                        id: 3,
                        isSaved: false,
                        name: "Rum Gate",
                        image: "/images/detailPage/wadi-rum-restaurant1.jpg",
                        details: {
                            section: "foodAndDining",
                            about: {
                                address: "Wadi Rum",
                                workDays: ["Su", "Mo", "Tu", "We", "Th", "Fr"],
                                cost: "10 - 15 JOD / 20 - 30 USD",
                                openTime: "8:00 AM",
                                closeTime: "5:00 PM",
                            },
                            reviews: {
                                rating: 4.5,
                                label: "",
                                reviewsNumber: 4439,
                                fiveStarReviews: 3079,
                                fourStarReviews: 783,
                                threeStarReviews: 270,
                                twoStarReviews: 124,
                                oneStarReviews: 183,
                                comments: [
                                     { rating: 5, name: "John", body: "test testtesttest testtesttestt esttesttest testtesttesttes ttesttestte sttestte sttesttesttest testtestt esttesttestte sttesttesttest test." },
                                    { rating: 5, name: "John", body: "testtes ttesttesttestt esttesttesttesttestt esttesttesttesttest testtesttest testtesttesttesttestte ttesttesttesttesttes ttesttesttest." }
                                ]
                            },
                            contact: {
                                phone: "0776108606",
                                whatsapp: "0776108606",
                                facebook: "Facebook@gmail.com",
                                instagram: "User",
                                x: "User"
                            },
                            photos: [
                                "/images/detailPage/wadi-rum-restaurant1.jpg",
                                "/images/detailPage/wadi-rum-restaurant1.jpg",
                                "/images/detailPage/wadi-rum-restaurant1.jpg",
                                "/images/detailPage/wadi-rum-restaurant1.jpg",
                                "/images/detailPage/wadi-rum-restaurant1.jpg",
                                "/images/detailPage/wadi-rum-restaurant1.jpg",
                                "/images/detailPage/wadi-rum-restaurant1.jpg",
                                "/images/detailPage/wadi-rum-restaurant1.jpg"
                            ]
                        }
                    },
                    {
                        id: 4,
                        isSaved: false,
                        name: "Rum Gate",
                        image: "/images/detailPage/wadi-rum-restaurant1.jpg",
                        details: {
                            section: "foodAndDining",
                            about: {
                                address: "Wadi Rum",
                                workDays: ["Su", "Mo", "Tu", "We", "Th", "Fr"],
                                cost: "10 - 15 JOD / 20 - 30 USD",
                                openTime: "8:00 AM",
                                closeTime: "5:00 PM",
                            },
                            reviews: {
                                rating: 4.5,
                                label: "",
                                reviewsNumber: 4439,
                                fiveStarReviews: 3079,
                                fourStarReviews: 783,
                                threeStarReviews: 270,
                                twoStarReviews: 124,
                                oneStarReviews: 183,
                                comments: [
                                     { rating: 5, name: "John", body: "test testtesttest testtesttestt esttesttest testtesttesttes ttesttestte sttestte sttesttesttest testtestt esttesttestte sttesttesttest test." },
                                    { rating: 5, name: "John", body: "testtes ttesttesttestt esttesttesttesttestt esttesttesttesttest testtesttest testtesttesttesttestte ttesttesttesttesttes ttesttesttest." }
                                ]
                            },
                            contact: {
                                phone: "0776108606",
                                whatsapp: "0776108606",
                                facebook: "Facebook@gmail.com",
                                instagram: "User",
                                x: "User"
                            },
                            photos: [
                                "/images/detailPage/wadi-rum-restaurant1.jpg",
                                "/images/detailPage/wadi-rum-restaurant1.jpg",
                                "/images/detailPage/wadi-rum-restaurant1.jpg",
                                "/images/detailPage/wadi-rum-restaurant1.jpg",
                                "/images/detailPage/wadi-rum-restaurant1.jpg",
                                "/images/detailPage/wadi-rum-restaurant1.jpg",
                                "/images/detailPage/wadi-rum-restaurant1.jpg",
                                "/images/detailPage/wadi-rum-restaurant1.jpg"
                            ]
                        }
                    },
                    {
                        id: 5,
                        isSaved: false,
                        name: "Rum Gate",
                        image: "/images/detailPage/wadi-rum-restaurant1.jpg",
                        details: {
                            section: "foodAndDining",
                            about: {
                                address: "Wadi Rum",
                                workDays: ["Su", "Mo", "Tu", "We", "Th", "Fr"],
                                cost: "10 - 15 JOD / 20 - 30 USD",
                                openTime: "8:00 AM",
                                closeTime: "5:00 PM",
                            },
                            reviews: {
                                rating: 4.5,
                                label: "",
                                reviewsNumber: 4439,
                                fiveStarReviews: 3079,
                                fourStarReviews: 783,
                                threeStarReviews: 270,
                                twoStarReviews: 124,
                                oneStarReviews: 183,
                                comments: [
                                     { rating: 5, name: "John", body: "test testtesttest testtesttestt esttesttest testtesttesttes ttesttestte sttestte sttesttesttest testtestt esttesttestte sttesttesttest test." },
                                    { rating: 5, name: "John", body: "testtes ttesttesttestt esttesttesttesttestt esttesttesttesttest testtesttest testtesttesttesttestte ttesttesttesttesttes ttesttesttest." }
                                ]
                            },
                            contact: {
                                phone: "0776108606",
                                whatsapp: "0776108606",
                                facebook: "Facebook@gmail.com",
                                instagram: "User",
                                x: "User"
                            },
                            photos: [
                                "/images/detailPage/wadi-rum-restaurant1.jpg",
                                "/images/detailPage/wadi-rum-restaurant1.jpg",
                                "/images/detailPage/wadi-rum-restaurant1.jpg",
                                "/images/detailPage/wadi-rum-restaurant1.jpg",
                                "/images/detailPage/wadi-rum-restaurant1.jpg",
                                "/images/detailPage/wadi-rum-restaurant1.jpg",
                                "/images/detailPage/wadi-rum-restaurant1.jpg",
                                "/images/detailPage/wadi-rum-restaurant1.jpg"
                            ]
                        }
                    }
                ]
            },
            traditionalDining: {
                subTitle: "Traditional Dining",
                isAvailable: true,
                cardList: [
                    { id: 1, subSection: "traditionalDining", isSaved: false, name: "Zarb", description: "Zarb The signature Bedouin dish — lamb, chicken, and vegetables slow-cooked underground in a sand pit for hours. It's the highlight of any camp dinner and something you won't forget.", image: "/images/detailPage/wadi-rum-restaurant1.jpg" },
                    { id: 2, subSection: "traditionalDining", isSaved: false, name: "Zarb", description: "Zarb The signature Bedouin dish — lamb, chicken, and vegetables slow-cooked underground in a sand pit for hours. It's the highlight of any camp dinner and something you won't forget.", image: "/images/detailPage/wadi-rum-restaurant1.jpg" },
                    { id: 3, subSection: "traditionalDining", isSaved: false, name: "Zarb", description: "Zarb The signature Bedouin dish — lamb, chicken, and vegetables slow-cooked underground in a sand pit for hours. It's the highlight of any camp dinner and something you won't forget.", image: "/images/detailPage/wadi-rum-restaurant1.jpg" },
                    { id: 4, subSection: "traditionalDining", isSaved: false, name: "Zarb", description: "Zarb The signature Bedouin dish — lamb, chicken, and vegetables slow-cooked underground in a sand pit for hours. It's the highlight of any camp dinner and something you won't forget.", image: "/images/detailPage/wadi-rum-restaurant1.jpg" },
                    { id: 5, subSection: "traditionalDining", isSaved: false, name: "Zarb", description: "Zarb The signature Bedouin dish — lamb, chicken, and vegetables slow-cooked underground in a sand pit for hours. It's the highlight of any camp dinner and something you won't forget.", image: "/images/detailPage/wadi-rum-restaurant1.jpg" }
                ]
            }
        },
        hotels: {
            title: "Hotels",
            cardList: [
                {
                    id: 1,
                    isSaved: false,
                    name: "Rum Camp",
                    image: "/images/detailPage/hotel1.jpg",
                    details: {
                        section: "hotels",
                        about: {
                            address: "Wadi Rum",
                            workDays: ["Su", "Mo", "Tu", "We", "Th", "Fr"],
                            cost: "10 - 15 JOD / 20 - 30 USD",
                            openTime: "8:00 AM",
                            closeTime: "5:00 PM",
                        },
                        reviews: {
                            rating: 4.5,
                            label: "",
                            reviewsNumber: 4439,
                            fiveStarReviews: 3079,
                            fourStarReviews: 783,
                            threeStarReviews: 270,
                            twoStarReviews: 124,
                            oneStarReviews: 183,
                            comments: [
                                 { rating: 5, name: "John", body: "test testtesttest testtesttestt esttesttest testtesttesttes ttesttestte sttestte sttesttesttest testtestt esttesttestte sttesttesttest test." },
                                    { rating: 5, name: "John", body: "testtes ttesttesttestt esttesttesttesttestt esttesttesttesttest testtesttest testtesttesttesttestte ttesttesttesttesttes ttesttesttest." }
                            ]
                        },
                        contact: {
                            phone: "0776108606",
                            whatsapp: "0776108606",
                            facebook: "Facebook@gmail.com",
                            instagram: "User",
                            x: "User"
                        },
                        book: {
                            title: "Book",
                            logo: "/images/booking-logo.png",
                            bookingUrl: "https://www.booking.com/hotel/jo/rum-camp.html"
                        },
                        photos: [
                            "/images/detailPage/hotel1.jpg",
                            "/images/detailPage/hotel1.jpg",
                            "/images/detailPage/hotel1.jpg",
                            "/images/detailPage/hotel1.jpg",
                            "/images/detailPage/hotel1.jpg",
                            "/images/detailPage/hotel1.jpg",
                            "/images/detailPage/hotel1.jpg",
                            "/images/detailPage/hotel1.jpg"
                        ]
                    }
                },
                {
                    id: 2,
                    isSaved: false,
                    name: "Rum Camp",
                    image: "/images/detailPage/hotel1.jpg",
                    details: {
                        section: "hotels",
                        about: {
                            address: "Wadi Rum",
                            workDays: ["Su", "Mo", "Tu", "We", "Th", "Fr"],
                            cost: "10 - 15 JOD / 20 - 30 USD",
                            openTime: "8:00 AM",
                            closeTime: "5:00 PM",
                        },
                        reviews: {
                            rating: 4.5,
                            label: "",
                            reviewsNumber: 4439,
                            fiveStarReviews: 3079,
                            fourStarReviews: 783,
                            threeStarReviews: 270,
                            twoStarReviews: 124,
                            oneStarReviews: 183,
                            comments: [
                                 { rating: 5, name: "John", body: "test testtesttest testtesttestt esttesttest testtesttesttes ttesttestte sttestte sttesttesttest testtestt esttesttestte sttesttesttest test." },
                                    { rating: 5, name: "John", body: "testtes ttesttesttestt esttesttesttesttestt esttesttesttesttest testtesttest testtesttesttesttestte ttesttesttesttesttes ttesttesttest." }
                            ]
                        },
                        contact: {
                            phone: "0776108606",
                            whatsapp: "0776108606",
                            facebook: "Facebook@gmail.com",
                            instagram: "User",
                            x: "User"
                        },
                        book: {
                            title: "Book",
                            logo: "/images/booking-logo.png",
                            bookingUrl: "https://www.booking.com/hotel/jo/rum-camp.html"
                        },
                        photos: [
                            "/images/detailPage/hotel1.jpg",
                            "/images/detailPage/hotel1.jpg",
                            "/images/detailPage/hotel1.jpg",
                            "/images/detailPage/hotel1.jpg",
                            "/images/detailPage/hotel1.jpg",
                            "/images/detailPage/hotel1.jpg",
                            "/images/detailPage/hotel1.jpg",
                            "/images/detailPage/hotel1.jpg"
                        ]
                    }
                },
                {
                    id: 3,
                    isSaved: false,
                    name: "Rum Camp",
                    image: "/images/detailPage/hotel1.jpg",
                    details: {
                        section: "hotels",
                        about: {
                            address: "Wadi Rum",
                            workDays: ["Su", "Mo", "Tu", "We", "Th", "Fr"],
                            cost: "10 - 15 JOD / 20 - 30 USD",
                            openTime: "8:00 AM",
                            closeTime: "5:00 PM",
                        },
                        reviews: {
                            rating: 4.5,
                            label: "",
                            reviewsNumber: 4439,
                            fiveStarReviews: 3079,
                            fourStarReviews: 783,
                            threeStarReviews: 270,
                            twoStarReviews: 124,
                            oneStarReviews: 183,
                            comments: [
                                 { rating: 5, name: "John", body: "test testtesttest testtesttestt esttesttest testtesttesttes ttesttestte sttestte sttesttesttest testtestt esttesttestte sttesttesttest test." },
                                    { rating: 5, name: "John", body: "testtes ttesttesttestt esttesttesttesttestt esttesttesttesttest testtesttest testtesttesttesttestte ttesttesttesttesttes ttesttesttest." }
                            ]
                        },
                        contact: {
                            phone: "0776108606",
                            whatsapp: "0776108606",
                            facebook: "Facebook@gmail.com",
                            instagram: "User",
                            x: "User"
                        },
                        book: {
                            title: "Book",
                            logo: "/images/booking-logo.png",
                            bookingUrl: "https://www.booking.com/hotel/jo/rum-camp.html"
                        },
                        photos: [
                            "/images/detailPage/hotel1.jpg",
                            "/images/detailPage/hotel1.jpg",
                            "/images/detailPage/hotel1.jpg",
                            "/images/detailPage/hotel1.jpg",
                            "/images/detailPage/hotel1.jpg",
                            "/images/detailPage/hotel1.jpg",
                            "/images/detailPage/hotel1.jpg",
                            "/images/detailPage/hotel1.jpg"
                        ]
                    }
                },
                {
                    id: 4,
                    isSaved: false,
                    name: "Rum Camp",
                    image: "/images/detailPage/hotel1.jpg",
                    details: {
                        section: "hotels",
                        about: {
                            address: "Wadi Rum",
                            workDays: ["Su", "Mo", "Tu", "We", "Th", "Fr"],
                            cost: "10 - 15 JOD / 20 - 30 USD",
                            openTime: "8:00 AM",
                            closeTime: "5:00 PM",
                        },
                        reviews: {
                            rating: 4.5,
                            label: "",
                            reviewsNumber: 4439,
                            fiveStarReviews: 3079,
                            fourStarReviews: 783,
                            threeStarReviews: 270,
                            twoStarReviews: 124,
                            oneStarReviews: 183,
                            comments: [
                                 { rating: 5, name: "John", body: "test testtesttest testtesttestt esttesttest testtesttesttes ttesttestte sttestte sttesttesttest testtestt esttesttestte sttesttesttest test." },
                                    { rating: 5, name: "John", body: "testtes ttesttesttestt esttesttesttesttestt esttesttesttesttest testtesttest testtesttesttesttestte ttesttesttesttesttes ttesttesttest." }
                            ]
                        },
                        contact: {
                            phone: "0776108606",
                            whatsapp: "0776108606",
                            facebook: "Facebook@gmail.com",
                            instagram: "User",
                            x: "User"
                        },
                        book: {
                            title: "Book",
                            logo: "/images/booking-logo.png",
                            bookingUrl: "https://www.booking.com/hotel/jo/rum-camp.html"
                        },
                        photos: [
                            "/images/detailPage/hotel1.jpg",
                            "/images/detailPage/hotel1.jpg",
                            "/images/detailPage/hotel1.jpg",
                            "/images/detailPage/hotel1.jpg",
                            "/images/detailPage/hotel1.jpg",
                            "/images/detailPage/hotel1.jpg",
                            "/images/detailPage/hotel1.jpg",
                            "/images/detailPage/hotel1.jpg"
                        ]
                    }
                },
                {
                    id: 5,
                    isSaved: false,
                    name: "Rum Camp",
                    image: "/images/detailPage/hotel1.jpg",
                    details: {
                        section: "hotels",
                        about: {
                            address: "Wadi Rum",
                            workDays: ["Su", "Mo", "Tu", "We", "Th", "Fr"],
                            cost: "10 - 15 JOD / 20 - 30 USD",
                            openTime: "8:00 AM",
                            closeTime: "5:00 PM",
                        },
                        reviews: {
                            rating: 4.5,
                            label: "",
                            reviewsNumber: 4439,
                            fiveStarReviews: 3079,
                            fourStarReviews: 783,
                            threeStarReviews: 270,
                            twoStarReviews: 124,
                            oneStarReviews: 183,
                            comments: [
                                 { rating: 5, name: "John", body: "test testtesttest testtesttestt esttesttest testtesttesttes ttesttestte sttestte sttesttesttest testtestt esttesttestte sttesttesttest test." },
                                    { rating: 5, name: "John", body: "testtes ttesttesttestt esttesttesttesttestt esttesttesttesttest testtesttest testtesttesttesttestte ttesttesttesttesttes ttesttesttest." }
                            ]
                        },
                        contact: {
                            phone: "0776108606",
                            whatsapp: "0776108606",
                            facebook: "Facebook@gmail.com",
                            instagram: "User",
                            x: "User"
                        },
                        book: {
                            title: "Book",
                            logo: "/images/booking-logo.png",
                            bookingUrl: "https://www.booking.com/hotel/jo/rum-camp.html"
                        },
                        photos: [
                            "/images/detailPage/hotel1.jpg",
                            "/images/detailPage/hotel1.jpg",
                            "/images/detailPage/hotel1.jpg",
                            "/images/detailPage/hotel1.jpg",
                            "/images/detailPage/hotel1.jpg",
                            "/images/detailPage/hotel1.jpg",
                            "/images/detailPage/hotel1.jpg",
                            "/images/detailPage/hotel1.jpg"
                        ]
                    }
                }
            ]
        },
        events: {
            title: "Events",
            cardList: [
                {
                    id: 1,
                    isSaved: false,
                    name: "Rum Camp",
                    image: "/images/detailPage/event.jpg",
                    details: {
                        section: "events",
                        about: {
                            address: "Wadi Rum",
                            fees: "10 JOD / 15 USD",
                            startDate: "1 MAR",
                            endDate: "10 MAR",
                            startTime: "8:00 AM",
                            endTime: "5:00 PM",
                        },
                        reviews: {
                            rating: 4.5,
                            label: "",
                            reviewsNumber: 4439,
                            fiveStarReviews: 3079,
                            fourStarReviews: 783,
                            threeStarReviews: 270,
                            twoStarReviews: 124,
                            oneStarReviews: 183,
                            comments: [
                                 { rating: 5, name: "John", body: "test testtesttest testtesttestt esttesttest testtesttesttes ttesttestte sttestte sttesttesttest testtestt esttesttestte sttesttesttest test." },
                                    { rating: 5, name: "John", body: "testtes ttesttesttestt esttesttesttesttestt esttesttesttesttest testtesttest testtesttesttesttestte ttesttesttesttesttes ttesttesttest." }
                            ]
                        },
                        contact: {
                            isAvailable: true,
                            phone: "0776108606",
                            whatsapp: "0776108606",
                            facebook: "Facebook@gmail.com",
                            instagram: "User",
                            x: "User"
                        },
                        book: {
                            isAvailable: true,
                            title: "Book",
                            logo: "/images/booking-logo.png",
                            bookingUrl: "https://www.booking.com"
                        },
                        photos: [
                            "/images/detailPage/event.jpg",
                            "/images/detailPage/event.jpg",
                            "/images/detailPage/event.jpg",
                            "/images/detailPage/event.jpg",
                            "/images/detailPage/event.jpg",
                            "/images/detailPage/event.jpg",
                            "/images/detailPage/event.jpg",
                            "/images/detailPage/event.jpg"
                        ]
                    }
                },
                {
                    id: 2,
                    isSaved: false,
                    name: "Rum Camp",
                    image: "/images/detailPage/event.jpg",
                    details: {
                        section: "events",
                        about: {
                            address: "Wadi Rum",
                            fees: "10 JOD / 15 USD",
                            startDate: "1 MAR",
                            endDate: "10 MAR",
                            startTime: "8:00 AM",
                            endTime: "5:00 PM",
                        },
                        reviews: {
                            rating: 4.5,
                            label: "",
                            reviewsNumber: 4439,
                            fiveStarReviews: 3079,
                            fourStarReviews: 783,
                            threeStarReviews: 270,
                            twoStarReviews: 124,
                            oneStarReviews: 183,
                            comments: [
                                 { rating: 5, name: "John", body: "test testtesttest testtesttestt esttesttest testtesttesttes ttesttestte sttestte sttesttesttest testtestt esttesttestte sttesttesttest test." },
                                    { rating: 5, name: "John", body: "testtes ttesttesttestt esttesttesttesttestt esttesttesttesttest testtesttest testtesttesttesttestte ttesttesttesttesttes ttesttesttest." }
                            ]
                        },
                        contact: {
                            isAvailable: false,
                        },
                        book: {
                            isAvailable: false,
                        },
                        photos: [
                            "/images/detailPage/event.jpg",
                            "/images/detailPage/event.jpg",
                            "/images/detailPage/event.jpg",
                            "/images/detailPage/event.jpg",
                            "/images/detailPage/event.jpg",
                            "/images/detailPage/event.jpg",
                            "/images/detailPage/event.jpg",
                            "/images/detailPage/event.jpg"
                        ]
                    }
                },
                {
                    id: 3,
                    isSaved: false,
                    name: "Rum Camp",
                    image: "/images/detailPage/event.jpg",
                    details: {
                        section: "events",
                        about: {
                            address: "Wadi Rum",
                            fees: "10 JOD / 15 USD",
                            startDate: "1 MAR",
                            endDate: "10 MAR",
                            startTime: "8:00 AM",
                            endTime: "5:00 PM",
                        },
                        reviews: {
                            rating: 4.5,
                            label: "",
                            reviewsNumber: 4439,
                            fiveStarReviews: 3079,
                            fourStarReviews: 783,
                            threeStarReviews: 270,
                            twoStarReviews: 124,
                            oneStarReviews: 183,
                            comments: [
                                 { rating: 5, name: "John", body: "test testtesttest testtesttestt esttesttest testtesttesttes ttesttestte sttestte sttesttesttest testtestt esttesttestte sttesttesttest test." },
                                    { rating: 5, name: "John", body: "testtes ttesttesttestt esttesttesttesttestt esttesttesttesttest testtesttest testtesttesttesttestte ttesttesttesttesttes ttesttesttest." }
                            ]
                        },
                        contact: {
                            isAvailable: true,
                            phone: "0776108606",
                            whatsapp: "0776108606",
                            facebook: "Facebook@gmail.com",
                            instagram: "User",
                            x: "User"
                        },
                        book: {
                            isAvailable: false,
                        },
                        photos: [
                            "/images/detailPage/event.jpg",
                            "/images/detailPage/event.jpg",
                            "/images/detailPage/event.jpg",
                            "/images/detailPage/event.jpg",
                            "/images/detailPage/event.jpg",
                            "/images/detailPage/event.jpg",
                            "/images/detailPage/event.jpg",
                            "/images/detailPage/event.jpg"
                        ]
                    }
                },
                {
                    id: 4,
                    isSaved: false,
                    name: "Rum Camp",
                    image: "/images/detailPage/event.jpg",
                    details: {
                        section: "events",
                        about: {
                            address: "Wadi Rum",
                            fees: "10 JOD / 15 USD",
                            startDate: "1 MAR",
                            endDate: "10 MAR",
                            startTime: "8:00 AM",
                            endTime: "5:00 PM",
                        },
                        reviews: {
                            rating: 4.5,
                            label: "",
                            reviewsNumber: 4439,
                            fiveStarReviews: 3079,
                            fourStarReviews: 783,
                            threeStarReviews: 270,
                            twoStarReviews: 124,
                            oneStarReviews: 183,
                            comments: [
                                 { rating: 5, name: "John", body: "test testtesttest testtesttestt esttesttest testtesttesttes ttesttestte sttestte sttesttesttest testtestt esttesttestte sttesttesttest test." },
                                    { rating: 5, name: "John", body: "testtes ttesttesttestt esttesttesttesttestt esttesttesttesttest testtesttest testtesttesttesttestte ttesttesttesttesttes ttesttesttest." }
                            ]
                        },
                        contact: {
                            isAvailable: true,
                            phone: "0776108606",
                            whatsapp: "0776108606",
                            facebook: "Facebook@gmail.com",
                            instagram: "User",
                            x: "User"
                        },
                        book: {
                            isAvailable: true,
                            title: "Book",
                            logo: "/images/booking-logo.png",
                            bookingUrl: "https://www.booking.com"
                        },
                        photos: [
                            "/images/detailPage/event.jpg",
                            "/images/detailPage/event.jpg",
                            "/images/detailPage/event.jpg",
                            "/images/detailPage/event.jpg",
                            "/images/detailPage/event.jpg",
                            "/images/detailPage/event.jpg",
                            "/images/detailPage/event.jpg",
                            "/images/detailPage/event.jpg"
                        ]
                    }
                },
                {
                    id: 5,
                    isSaved: false,
                    name: "Rum Camp",
                    image: "/images/detailPage/event.jpg",
                    details: {
                        section: "events",
                        about: {
                            address: "Wadi Rum",
                            fees: "10 JOD / 15 USD",
                            startDate: "1 MAR",
                            endDate: "10 MAR",
                            startTime: "8:00 AM",
                            endTime: "5:00 PM",
                        },
                        reviews: {
                            rating: 4.5,
                            label: "",
                            reviewsNumber: 4439,
                            fiveStarReviews: 3079,
                            fourStarReviews: 783,
                            threeStarReviews: 270,
                            twoStarReviews: 124,
                            oneStarReviews: 183,
                            comments: [
                                 { rating: 5, name: "John", body: "test testtesttest testtesttestt esttesttest testtesttesttes ttesttestte sttestte sttesttesttest testtestt esttesttestte sttesttesttest test." },
                                    { rating: 5, name: "John", body: "testtes ttesttesttestt esttesttesttesttestt esttesttesttesttest testtesttest testtesttesttesttestte ttesttesttesttesttes ttesttesttest." }
                            ]
                        },
                        contact: {
                            isAvailable: false,
                        },
                        book: {
                            isAvailable: true,
                            title: "Book",
                            logo: "/images/booking-logo.png",
                            bookingUrl: "https://www.booking.com"
                        },
                        photos: [
                            "/images/detailPage/event.jpg",
                            "/images/detailPage/event.jpg",
                            "/images/detailPage/event.jpg",
                            "/images/detailPage/event.jpg",
                            "/images/detailPage/event.jpg",
                            "/images/detailPage/event.jpg",
                            "/images/detailPage/event.jpg",
                            "/images/detailPage/event.jpg"
                        ]
                    }
                }
            ]
        },
        book: {
            destinationName: "Wadi Rum",
            pricingSummary: "A typical Wadi Rum experience ranges from 25 — 120 JOD / 35 — 170 USD depending on the type of stay and activities you choose.",
            bookingURL: ""
        },
        
    }
}

export default mockData;