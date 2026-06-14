const imagePath = "/destinations/";

const baseDestinations = [
  {
    id: 1,
    name: "Ajloun Castle",
    location: "Ajloun",
    description:
      "A spectacular 12th-century Muslim fortress built by Saladins general in 1184. It features an intricate network of towers, galleries, and drawbridges designed to secure trade routes and defend against Crusaders.",
    image: imagePath + "Ajloun Castle.jpg",
    rating: 4.7,
    likes: 892,
  },
  {
    id: 2,
    name: "Ramtha Amphitheater",
    location: "Ramtha",
    description:
      "A vital cultural and historical open-air site located in northern Jordan. It proudly hosts traditional festivals, poetry nights, and community gatherings, reflecting rich agricultural heritage.",
    image: imagePath + "Ramtha Amphitheater.jpg",
    rating: 4.3,
    likes: 456,
  },
  {
    id: 3,
    name: "Petra",
    location: "Ma'an",
    description:
      "A world-famous archaeological treasure carved directly into vibrant red-rose sandstone cliffs by the Nabataeans over 2,000 years ago. It features stunning monuments like the Treasury and Monastery.",
    image: imagePath + "Petra.jpg",
    rating: 4.9,
    likes: 3420,
  },
  {
    id: 4,
    name: "Jerash",
    location: "Jerash",
    description:
      "An extraordinary ancient city representing one of the largest and best-preserved Roman provincial cities in the world, boasting highlights such as Hadrians Arch, the Oval Forum, and the Cardo Maximus.",
    image: imagePath + "Jerash.jpg",
    rating: 4.8,
    likes: 2156,
  },
  {
    id: 5,
    name: "Wadi Rum",
    location: "Aqaba Governorate",
    description:
      "A breathtaking desert wilderness also known as the Valley of the Moon. Famous for dramatic red sand dunes, massive natural sandstone arches, ancient rock inscriptions, and majestic deep canyons.",
    image: imagePath + "Wadi Rum.jpg",
    rating: 4.9,
    likes: 2890,
  },
  {
    id: 6,
    name: "Dead Sea",
    location: "Jordan Valley",
    description:
      "The lowest point on Earth, sitting roughly 430 meters below sea level. It is globally renowned for its hyper-saline waters allowing effortless floating and mineral-rich dark therapeutic mud.",
    image: imagePath + "Dead Sea.jpg",
    rating: 4.8,
    likes: 3102,
  },
  {
    id: 7,
    name: "Amman Citadel",
    location: "Amman",
    description:
      "A historic site located on a hill in downtown Amman. It features ancient ruins spanning the Roman, Byzantine, and Umayyad periods, including the famous Pillars of the Temple of Hercules.",
    image: imagePath + "Amman Citadel.jpg",
    rating: 4.5,
    likes: 1234,
  },
  {
    id: 8,
    name: "Roman Theater",
    location: "Amman",
    description:
      "A 6,000-seat, 2nd-century architectural marvel carved directly into a downtown hillside. It faces north to shield spectators from the sun and is still used today for cultural events.",
    image: imagePath + "Roman Theater.jpg",
    rating: 4.6,
    likes: 1567,
  },
  {
    id: 9,
    name: "Aqaba Coastal City",
    location: "Aqaba",
    description:
      "Jordans only coastal gateway, located on the Red Sea. It is a major hub for luxury beach resorts and marine tourism, world-renowned for crystal-clear snorkeling and scuba diving reefs.",
    image: imagePath + "Aqaba Coastal City.webp",
    rating: 4.7,
    likes: 1876,
  },
  {
    id: 10,
    name: "Mount Nebo",
    location: "Madaba Governorate",
    description:
      "An important holy mountain overlooking the Jordan Valley. According to traditions, it is where Moses was granted a view of the Promised Land, featuring a church with Byzantine mosaic floors.",
    image: imagePath + "Mount Nebo.jpg",
    rating: 4.6,
    likes: 987,
  },
  {
    id: 11,
    name: "Madaba City",
    location: "Madaba",
    description:
      "A historic town celebrated as the City of Mosaics. Its crown jewel is the 6th-century Byzantine mosaic map of Jerusalem and the Holy Land laid out meticulously across a church floor.",
    image: imagePath + "Madaba City.jpg",
    rating: 4.4,
    likes: 723,
  },
  {
    id: 12,
    name: "Dana Biosphere Reserve",
    location: "Tafilah Governorate",
    description:
      "Jordans largest nature reserve, cutting through majestic sandstone cliffs and mountain ridges. It offers rugged hiking trails, birdwatching, and traditional stone-village stays.",
    image: imagePath + "Dana Biosphere Reserve.jpg",
    rating: 4.7,
    likes: 645,
  },
  {
    id: 13,
    name: "Umm Qais",
    location: "Irbid Governorate",
    description:
      "An archaeological site in northwest Jordan featuring the ancient Greco-Roman city of Gadara, built out of distinctive black basalt stone overlooking the Sea of Galilee.",
    image: imagePath + "Umm Qais.jpg",
    rating: 4.5,
    likes: 534,
  },
  {
    id: 14,
    name: "Al-Maghtas Baptism Site",
    location: "Jordan River Valley",
    description:
      "A UNESCO World Heritage site verified as the official biblical location of the Baptism of Jesus by John the Baptist, featuring ancient Roman and Byzantine pools.",
    image: imagePath + "Al-Maghtas Baptism Site.jpg",
    rating: 4.8,
    likes: 1123,
  },
  {
    id: 15,
    name: "Kerak Castle",
    location: "Kerak",
    description:
      "A massive, dark Crusader fortress located in the southern city of Kerak, featuring an extensive maze of underground stone vaulted halls, kitchens, living quarters, and towers.",
    image: imagePath + "Kerak Castle.JPG",
    rating: 4.6,
    likes: 876,
  },
  {
    id: 16,
    name: "Shobak Castle",
    location: "Ma'an Governorate",
    description:
      "An isolated Crusader fortress built in 1115 by King Baldwin I, perched on a conical mountain featuring rugged walls, secret water escape tunnels, and ancient carvings.",
    image: imagePath + "Shobak Castle.jpg",
    rating: 4.4,
    likes: 432,
  },
  {
    id: 17,
    name: "Wadi Mujib Canyon",
    location: "Dead Sea Region",
    description:
      "A dramatic, deep desert canyon that feeds into the Dead Sea. It features the famous Siq water trail where visitors hike, climb, and swim through towering sandstone cliffs.",
    image: imagePath + "Wadi Mujib Canyon.jpg",
    rating: 4.7,
    likes: 987,
  },
  {
    id: 18,
    name: "Quseir Amra",
    location: "Zarqa Governorate",
    description:
      "An 8th-century Umayyad desert castle and a UNESCO site. Its interior walls are covered in colorful, detailed frescoes depicting hunters, early Islamic court life, and zodiac signs.",
    image: imagePath + "Quseir Amra.jpg",
    rating: 4.5,
    likes: 567,
  },
  {
    id: 19,
    name: "Qasr Al-Azraq",
    location: "Azraq",
    description:
      "A historic desert castle built out of black basalt stone. It served as a military fortress for the Romans and later as the desert headquarters for Lawrence of Arabia.",
    image: imagePath + "Qasr Al-Azraq.jpg",
    rating: 4.3,
    likes: 345,
  },
  {
    id: 20,
    name: "Ma'in Hot Springs",
    location: "Madaba Governorate",
    description:
      "A natural therapeutic oasis hidden deep within a desert valley near the Dead Sea, featuring dramatic thermal waterfalls heated by underground volcanic fissures.",
    image: imagePath + "Ma'in Hot Springs.jpg",
    rating: 4.6,
    likes: 789,
  },
  {
    id: 21,
    name: "Pella Ancient Site",
    location: "Jordan Valley",
    description:
      "An ancient archaeological site containing rich ruins spanning over 6,000 years, including Bronze Age temples, Greco-Roman structures, and Byzantine churches set against green hills.",
    image: imagePath + "Pella Ancient Site.jpg",
    rating: 4.5,
    likes: 612,
  },
  {
    id: 22,
    name: "The Jordan Museum",
    location: "Amman",
    description:
      "The countries national repository for history and culture, housing Jordans most valuable artifacts, including the famous copper Dead Sea Scrolls and Ain Ghazal plaster statues.",
    image: imagePath + "The Jordan Museum.jpg",
    rating: 4.8,
    likes: 1456,
  },
  {
    id: 23,
    name: "Royal Automobile Museum",
    location: "Amman",
    description:
      "A unique museum showcasing the private collection of classic cars and motorcycles belonging to the late King Hussein, charting modern political history through rare vehicles.",
    image: imagePath + "Royal Automobile Museum.jpg",
    rating: 4.6,
    likes: 923,
  },
  {
    id: 24,
    name: "Dibbeen Forest Reserve",
    location: "Jerash Governorate",
    description:
      "A protected pine-oak forest located in northern Jordan. Spanning rolling green hills, it represents a favorite local spot for nature walks and scenic family picnics.",
    image: imagePath + "Dibbeen Forest Reserve.jpg",
    rating: 4.4,
    likes: 478,
  },
  {
    id: 25,
    name: "Azraq Wetland Reserve",
    location: "Azraq Oasis",
    description:
      "A unique desert oasis featuring natural freshwater pools and mudflats that serve as a crucial migration stopover for thousands of migratory bird species traveling between continents.",
    image: imagePath + "Azraq Wetland Reserve.JPG",
    rating: 4.5,
    likes: 356,
  },
  {
    id: 26,
    name: "Ajloun Forest Reserve",
    location: "Ajloun",
    description:
      "Features open woodlands of evergreen oak, carob, and wild pistachio trees in northern Jordan, offering eco-cabins, organic food trails, and beautiful guided nature hikes.",
    image: imagePath + "Ajloun Forest Reserve.jpg",
    rating: 4.6,
    likes: 534,
  },
  {
    id: 27,
    name: "Mukawir Hilltop",
    location: "Madaba Governorate",
    description:
      "A fortified hilltop archaeological site holding deep historic significance as the location of Herods palace, where ancient records state John the Baptist was imprisoned.",
    image: imagePath + "Mukawir Hilltop.jpg",
    rating: 4.3,
    likes: 289,
  },
  {
    id: 28,
    name: "Cave of Seven Sleepers",
    location: "Amman",
    description:
      "A religious heritage site tied to a famous story in both Christian and Islamic traditions, featuring ancient rock-cut tombs believed to belong to young men fleeing persecution.",
    image: imagePath + "Cave of Seven Sleepers.webp",
    rating: 4.4,
    likes: 412,
  },
  {
    id: 29,
    name: "Qasr Al-Kharana",
    location: "Eastern Desert Plains",
    description:
      "One of the best-preserved Umayyad desert castles, standing isolated in the eastern plains. Built in the early 8th century, it features a stark square architecture with arrow slits.",
    image: imagePath + "Qasr Al-Kharana.jpg",
    rating: 4.3,
    likes: 267,
  },
  {
    id: 30,
    name: "Rainbow Street",
    location: "Amman",
    description:
      "A historic, vibrant cobblestone street located in Ammans old Jabal Amman district, famous for its lively cafes, local art galleries, street food stalls, and scenic viewpoints.",
    image: imagePath + "Rainbow Street.jpg",
    rating: 4.7,
    likes: 1678,
  },
];


export const destinations = [
  ...baseDestinations,
  ...baseDestinations.slice(0, 25),
].map((dest, index) => ({
  ...dest,
  id: index + 1,
  likes: Math.floor(dest.likes * (0.8 + Math.random() * 0.4)),
}));
