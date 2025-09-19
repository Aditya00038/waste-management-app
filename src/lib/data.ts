

import { collection, getDocs, addDoc, serverTimestamp, query, orderBy, limit, where, getCountFromServer, Timestamp, writeBatch, doc, updateDoc } from "firebase/firestore";
import { db, storage } from "./firebase";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import type { User, LeaderboardEntry, CollectionVehicle, Facility, EducationArticle, TrainingCourse, BadgeTier, Reward, DonationItem, CommunityEvent, LocalReport, UserReport, Product, TrainingModule, BulkProducerReport } from './types';

export async function getUsers(): Promise<User[]> {
    const usersCol = collection(db, 'users');
    const userSnapshot = await getDocs(usersCol);
    const userList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
    return userList;
}

export async function getLeaderboardData(): Promise<LeaderboardEntry[]> {
    const usersQuery = query(
      collection(db, 'users'), 
      orderBy('points', 'desc'), 
      limit(50)
    );
    const userSnapshot = await getDocs(usersQuery);

    const leaderboard = userSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as User))
        .filter(user => (user.role === 'Citizen' || user.role === 'Green Champion') && user.points && user.points > 0)
        .slice(0, 10) // Take the top 10 after filtering
        .map((user, index) => ({
            rank: index + 1,
            user: user
        }));
    
    return leaderboard;
}


export async function getShopProducts(): Promise<Product[]> {
    const productsCol = collection(db, 'products');
    let snapshot = await getDocs(query(productsCol, orderBy("createdAt", "desc")));
    
    if (snapshot.empty) {
        console.log("No products found, seeding database...");
        const defaultProducts = [
            { name: "Segregation Dustbin Set (2-pack)", price: 50.00, description: "Subsidized color-coded bins for wet and dry waste.", imageUrl: "https://storage.googleapis.com/aifirebase/sc-pwa-images/product-bins.png", rating: 4.6, reviews: 154 },
            { name: "Home Composter Bin (Small)", price: 250.00, description: "Convert kitchen waste into nutrient-rich compost at home.", imageUrl: "https://storage.googleapis.com/aifirebase/sc-pwa-images/product-composter.png", rating: 4.8, reviews: 88 },
            { name: "Biodegradable Garbage Bags (90 bags)", price: 49.00, description: "Govt. approved compostable bags. 3 rolls, 30 bags each.", imageUrl: "https://storage.googleapis.com/aifirebase/sc-pwa-images/product-bags.png", rating: 4.5, reviews: 112 },
            { name: "Reusable Shopping Bag", price: 25.00, description: "Durable jute bag to reduce plastic bag usage.", imageUrl: "https://storage.googleapis.com/aifirebase/sc-pwa-images/product-jute-bag.png", rating: 4.9, reviews: 203 },
        ];
        
        const batch = writeBatch(db);
        defaultProducts.forEach(product => {
            const docRef = doc(collection(db, 'products'));
            batch.set(docRef, { ...product, createdAt: new Date().toISOString() });
        });
        await batch.commit();

        snapshot = await getDocs(query(productsCol, orderBy("createdAt", "desc")));
    }

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
}

export async function getDonationItems(): Promise<DonationItem[]> {
    const donationsCol = query(collection(db, 'donations'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(donationsCol);
    if(snapshot.empty) return Promise.resolve([]);
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return { 
            id: doc.id, 
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString()
        } as DonationItem
    });
}

export async function createDonationItem(item: Omit<DonationItem, 'id' | 'imageUrl' | 'aiHint' | 'createdAt'> & { photoDataUri: string }): Promise<DonationItem> {
    // 1. Upload image
    const storageRef = ref(storage, `donations/${Date.now()}`);
    const uploadTask = await uploadString(storageRef, item.photoDataUri, 'data_url');
    const imageUrl = await getDownloadURL(uploadTask.ref);
    const createdAt = serverTimestamp();

    // 2. Create doc
    const docRef = await addDoc(collection(db, "donations"), {
      ...item,
      imageUrl: imageUrl,
      aiHint: "donation item", // Placeholder
      createdAt: createdAt,
    });
    
    return {
        id: docRef.id,
        ...item,
        imageUrl,
        aiHint: "donation item",
        createdAt: new Date().toISOString()
    } as DonationItem;
}


export async function getCommunityEvents(): Promise<CommunityEvent[]> {
    const eventsCol = query(collection(db, 'events'), orderBy('date', 'desc'));
    const snapshot = await getDocs(eventsCol);
    if(snapshot.empty) return Promise.resolve([]);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CommunityEvent));
}

export async function createCommunityEvent(event: Omit<CommunityEvent, 'id' | 'imageUrl' | 'aiHint'>): Promise<CommunityEvent> {
    const docRef = await addDoc(collection(db, "events"), { ...event, date: new Date(event.date).toISOString() });
    
    // Generate a placeholder image URL for the new event to prevent rendering errors.
    const imageUrl = `https://picsum.photos/seed/${docRef.id}/800/600`;
    
    await updateDoc(docRef, { imageUrl, aiHint: 'community event' });

    return {
        id: docRef.id,
        ...event,
        imageUrl: imageUrl,
        aiHint: 'community event'
    };
}


// TODO: Create the necessary Firestore index for the reports collection:
// https://console.firebase.google.com/v1/r/project/vit-hackthon/firestore/indexes?create_composite=Ckxwcm9qZWN0cy92aXQtaGFja3Rob24vZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL3JlcG9ydHMvaW5kZXhlcy9fEAEaCgoGdXNlcklkEAEaDQoJY3JlYXRlZEF0EAIaDAoIX19uYW1lX18QAg
export async function getUserReports(userId: string): Promise<UserReport[]> {
    // Temporary solution until the composite index is created:
    // Only filter by userId without sorting to avoid the index error
    const reportsQuery = query(
        collection(db, "reports"), 
        where("userId", "==", userId),
        // orderBy("createdAt", "desc"), - removed until index is created
        limit(20) // Fetch more documents since we'll sort them in memory
    );
    const snapshot = await getDocs(reportsQuery);
    if(snapshot.empty) return [];
    
    // Convert and sort the data in memory
    const reports = snapshot.docs.map(doc => {
      const data = doc.data();
      return { 
        id: doc.id, 
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString()
      } as UserReport
    });
    
    // Sort by createdAt in descending order
    reports.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    
    // Return only the first 5 items
    return reports.slice(0, 5);
}


export async function getCollectionVehicles(): Promise<CollectionVehicle[]> {
    const collectionCol = collection(db, 'vehicles');
    const snapshot = await getDocs(collectionCol);
    if(snapshot.empty) return Promise.resolve([]);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CollectionVehicle));
}

export async function getFacilities(): Promise<Facility[]> {
     const facilitiesCol = collection(db, 'facilities');
    let snapshot = await getDocs(facilitiesCol);
    if (snapshot.empty) {
        const defaultFacilities = [
            { name: "Koregaon Park Recycling Hub", type: "recycling_center", address: "Lane 5, Koregaon Park", distance: "2.5 km" },
            { name: "Hadapsar Compost Plant", type: "compost_plant", address: "Industrial Area, Hadapsar", distance: "8.1 km" },
            { name: "Pune Central Landfill", type: "landfill", address: "Outer Ring Road, Pune", distance: "15.3 km" },
            { name: "Main Post Office E-Waste Dropoff", type: "hazardous_waste_collection", address: "Sadhu Vaswani Chowk", distance: "3.0 km" },
            { name: "Pimpri Biomethanization Plant", type: "biomethanization_plant", address: "PCMC Industrial Area", distance: "22 km" },
            { name: "Hinjewadi W-to-E Plant", type: "waste_to_energy_plant", address: "Phase 3, Hinjewadi", distance: "25 km" },
        ];
        const batch = writeBatch(db);
        defaultFacilities.forEach(fac => {
            const docRef = doc(collection(db, 'facilities'));
            batch.set(docRef, fac);
        });
        await batch.commit();
        snapshot = await getDocs(facilitiesCol);
    }
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Facility));
}

export async function getWasteData() {
    const reportsCol = collection(db, 'reports');
    const snapshot = await getDocs(reportsCol);
    if(snapshot.empty) return Promise.resolve([]);
    const reports = snapshot.docs.map(doc => doc.data());
    
    // This is a simplified aggregation for demo. A real app would use cloud functions.
    const monthlyData: {[key: string]: any} = {
        'Jan': { Wet: 0, Dry: 0, Hazardous: 0, name: 'Jan'},
        'Feb': { Wet: 0, Dry: 0, Hazardous: 0, name: 'Feb'},
        'Mar': { Wet: 0, Dry: 0, Hazardous: 0, name: 'Mar'},
    };
    
    reports.forEach(report => {
        if (report.createdAt) {
            const date = report.createdAt.toDate(); // Convert timestamp to Date
            const month = date.toLocaleString('default', { month: 'short' });
            if (monthlyData[month]) {
                 if (report.category === 'wet') monthlyData[month].Wet += 100; // Arbitrary weight
                 if (report.category === 'dry') monthlyData[month].Dry += 80;
                 if (report.category === 'hazardous') monthlyData[month].Hazardous += 20;
            }
        }
    });

    return Promise.resolve(Object.values(monthlyData));
}

export async function getEducationArticles(): Promise<EducationArticle[]> {
    const articlesCol = collection(db, 'articles');
    const snapshot = await getDocs(articlesCol);
    if(snapshot.empty) return Promise.resolve([]);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EducationArticle));
}

export async function getTrainingCourse(): Promise<TrainingCourse> {
    try {
        const courseCol = collection(db, 'courses');
        const snapshot = await getDocs(courseCol);
        if (!snapshot.empty) {
            // Assuming single course doc
            const courseDoc = snapshot.docs[0];
            const courseData = courseDoc.data();

            // Fetch modules subcollection
            const modulesCol = collection(db, 'courses', courseDoc.id, 'modules');
            const modulesSnapshot = await getDocs(query(modulesCol, orderBy('title')));
            const modules = modulesSnapshot.docs.map(doc => doc.data() as TrainingModule);

            return { id: courseDoc.id, ...courseData, modules } as TrainingCourse;
        }
    } catch (error) {
        console.warn("Error fetching course from Firestore, returning mock data.", error);
    }

    // Return mock data if collection is empty or an error occurs
    return Promise.resolve({
        id: "default-course",
        title: "Swachh Bharat Citizen Training Program",
        description: "An essential guide for every citizen on effective waste management, segregation, and sustainable practices.",
        modules: [
            {
                id: "module-1",
                title: "Introduction to Waste Management",
                duration: 5,
                content: "This module covers the basics of waste management, its importance, and the impact of improper disposal on the environment and public health. We'll explore the 'Swachh Bharat' mission and your role in it.",
                keyTakeaways: [
                    "Understand the '3 R's: Reduce, Reuse, Recycle.",
                    "Learn about the Swachh Bharat Mission's goals.",
                    "Recognize the health hazards of unmanaged waste."
                ],
                quiz: {
                    question: "What are the '3 R's' of waste management?",
                    options: ["Read, Write, Recite", "Reduce, Reuse, Recycle", "Run, Rest, Repeat"],
                    correctAnswer: "Reduce, Reuse, Recycle"
                }
            },
            {
                id: "module-2",
                title: "Waste Segregation: Wet, Dry & Hazardous",
                duration: 8,
                content: "Learn the crucial skill of segregating waste at its source. This module provides a detailed guide on how to differentiate between wet (biodegradable), dry (non-biodegradable), and hazardous waste.",
                keyTakeaways: [
                    "Identify common examples of wet, dry, and hazardous waste.",
                    "Understand the color-coding for waste bins (Green for wet, Blue for dry).",
                    "Learn safe handling procedures for hazardous materials like batteries and e-waste."
                ],
                quiz: {
                    question: "Which color bin is for wet waste?",
                    options: ["Blue", "Red", "Green"],
                    correctAnswer: "Green"
                }
            },
            {
                id: "module-3",
                title: "Composting at Home",
                duration: 10,
                content: "Turn your kitchen scraps into 'black gold'! This module provides a step-by-step guide to setting up a simple compost system at home, reducing your landfill contribution significantly.",
                keyTakeaways: [
                    "Learn what can and cannot be composted.",
                    "Understand the basics of maintaining a compost pile or bin.",
                    "Discover the benefits of using compost in your garden."
                ],
                quiz: {
                    question: "Which of the following should NOT be composted?",
                    options: ["Vegetable peels", "Meat and dairy products", "Eggshells"],
                    correctAnswer: "Meat and dairy products"
                }
            },
            {
                id: "module-4",
                title: "Your Role as a Swachh Citizen",
                duration: 7,
                content: "This final module empowers you to take action. Learn how to use the Swachh Bharat PWA to report uncollected waste, participate in community events, and track your positive impact on the environment.",
                keyTakeaways: [
                    "How to effectively report waste using the app.",
                    "The importance of community participation.",
                    "How your actions contribute to a cleaner India and earn you rewards."
                ],
                quiz: {
                    question: "What is the primary purpose of the 'Report Waste' feature?",
                    options: ["To complain about neighbors", "To alert authorities about uncollected garbage", "To order new dustbins"],
                    correctAnswer: "To alert authorities about uncollected garbage"
                }
            }
        ]
    });
}

export async function getWasteWorkerTrainingCourse(): Promise<TrainingCourse> {
    return Promise.resolve({
        id: "ww-course",
        title: "Waste Worker Professional Training",
        description: "An advanced, phase-wise training program covering all aspects of professional waste collection and handling.",
        modules: [
            {
                id: "ww-module-1",
                title: "Advanced Segregation & Handling",
                duration: 15,
                content: "This module goes beyond basic segregation, focusing on identifying different types of plastics, metals, and other recyclables. It also covers the proper techniques for handling large volumes of mixed waste safely and efficiently.",
                keyTakeaways: [
                    "Differentiate between 7 types of plastics.",
                    "Properly handle and separate e-waste components.",
                    "Techniques for minimizing contamination in recyclables."
                ],
                quiz: {
                    question: "What is the primary risk of mixing wet waste with dry recyclables?",
                    options: ["It makes the truck heavier", "It contaminates the recyclables, making them worthless", "It smells bad"],
                    correctAnswer: "It contaminates the recyclables, making them worthless"
                }
            },
            {
                id: "ww-module-2",
                title: "Safety Gear (PPE) Protocols",
                duration: 10,
                content: "Your safety is paramount. This module covers the correct use, maintenance, and disposal of Personal Protective Equipment (PPE), including gloves, masks, boots, and high-visibility vests.",
                keyTakeaways: [
                    "Understand the importance of each piece of PPE.",
                    "Learn how to inspect your gear for damage before each shift.",
                    "Proper doffing (taking off) procedure to avoid self-contamination."
                ],
                quiz: {
                    question: "When should you inspect your gloves for tears or holes?",
                    options: ["Once a week", "At the end of your shift", "Before each use"],
                    correctAnswer: "Before each use"
                }
            },
            {
                id: "ww-module-3",
                title: "Vehicle Operations & Maintenance",
                duration: 12,
                content: "This module covers the pre-trip inspection checklist for your collection vehicle, safe operating procedures in dense urban areas, and how to report maintenance issues effectively using the app.",
                keyTakeaways: [
                    "Perform a 360-degree walk-around inspection.",
                    "Understand safe reversing and parking procedures.",
                    "How to log vehicle-related issues for the maintenance team."
                ],
                quiz: {
                    question: "What is the first step of a pre-trip vehicle inspection?",
                    options: ["Checking the fuel level", "A 360-degree walk-around", "Starting the engine"],
                    correctAnswer: "A 360-degree walk-around"
                }
            },
            {
                id: "ww-module-4",
                title: "Using the Worker App Efficiently",
                duration: 8,
                content: "Learn to master the digital tools at your disposal. This module provides a detailed walkthrough of the Waste Worker dashboard, how to update report statuses, and communicate with the central command.",
                keyTakeaways: [
                    "How to follow your assigned route on the map.",
                    "Update the status of a collection point from 'Pending' to 'Collected'.",
                    "Use the AI Training Assistant for on-the-spot questions."
                ],
                quiz: {
                    question: "What status should you update a report to after collecting the waste?",
                    options: ["Pending", "In Process", "Collected"],
                    correctAnswer: "Collected"
                }
            }
        ]
    });
}


export async function getRewards(): Promise<Reward[]> {
    const rewardsCol = collection(db, 'rewards');
    const snapshot = await getDocs(rewardsCol);
    if(snapshot.empty) return Promise.resolve([]);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || '',
        points: data.points || 0,
        description: data.description || '',
        ...data
      } as Reward;
    });
}

export async function getBadgeTiers(): Promise<BadgeTier[]> {
    const badgesCol = collection(db, 'badgeTiers');
    const snapshot = await getDocs(badgesCol);
    if(snapshot.empty) return Promise.resolve([]);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || '',
        description: data.description || '',
        requiredPoints: data.requiredPoints || 0,
        ...data
      } as BadgeTier;
    });
}

export async function getLocalReports(): Promise<LocalReport[]> {
    const reportsCol = query(collection(db, 'reports'), limit(5));
    const snapshot = await getDocs(reportsCol);
     if(snapshot.empty) return Promise.resolve([]);
    return snapshot.docs.map(doc => ({ 
        id: doc.id,
        location: doc.data().location,
        category: doc.data().category,
        status: "Pending" // Simplified for this view
    } as LocalReport));
}

export async function getAdminDashboardStats() {
    const now = Timestamp.now();
    const oneWeekAgo = Timestamp.fromMillis(now.toMillis() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = Timestamp.fromMillis(now.toMillis() - 14 * 24 * 60 * 60 * 1000);

    const reportsCol = collection(db, 'reports');
    const ordersCol = collection(db, 'orders');
    const donationsCol = collection(db, 'donations');

    // These are simplified mock numbers for kit distribution for demo purposes
    const kitStats = {
        dustbins: { distributed: 7812, total: 10000 },
        compostKits: { distributed: 4520, total: 10000 },
    };

    try {
        const [
            reportsTotalSnap,
            ordersTotalSnap,
            donationsTotalSnap,
            reportsLastWeekSnap,
            ordersLastWeekSnap,
            donationsLastWeekSnap,
            reportsPrevWeekSnap,
            ordersPrevWeekSnap,
        ] = await Promise.all([
            getCountFromServer(reportsCol),
            getCountFromServer(ordersCol),
            getCountFromServer(donationsCol),
            getCountFromServer(query(reportsCol, where('createdAt', '>=', oneWeekAgo))),
            getCountFromServer(query(ordersCol, where('createdAt', '>=', oneWeekAgo))),
            getCountFromServer(query(donationsCol, where('createdAt', '>=', oneWeekAgo))),
            getCountFromServer(query(reportsCol, where('createdAt', '>=', twoWeeksAgo), where('createdAt', '<', oneWeekAgo))),
            getCountFromServer(query(ordersCol, where('createdAt', '>=', twoWeeksAgo), where('createdAt', '<', oneWeekAgo))),
        ]);

        const reportsTotal = reportsTotalSnap.data().count;
        const ordersTotal = ordersTotalSnap.data().count;
        const donationsTotal = donationsTotalSnap.data().count;

        const reportsLastWeek = reportsLastWeekSnap.data().count;
        const ordersLastWeek = ordersLastWeekSnap.data().count;
        const donationsLastWeek = donationsLastWeekSnap.data().count;

        const reportsPrevWeek = reportsPrevWeekSnap.data().count;
        const ordersPrevWeek = ordersPrevWeekSnap.data().count;

        const calcChange = (current: number, previous: number) => {
            if (previous > 0) return ((current - previous) / previous) * 100;
            if (current > 0) return 100;
            return 0;
        };

        return {
            reports: {
                total: reportsTotal,
                change: calcChange(reportsLastWeek, reportsPrevWeek)
            },
            orders: {
                total: ordersTotal,
                change: calcChange(ordersLastWeek, ordersPrevWeek)
            },
            donations: {
                total: donationsTotal,
                change: donationsLastWeek
            },
            ...kitStats,
        };
    } catch (error) {
        console.error("Error fetching admin stats, returning mock data:", error);
        return {
            reports: { total: 125, change: 15.2 },
            orders: { total: 42, change: -5.5 },
            donations: { total: 18, change: 3 },
            ...kitStats,
        };
    }
}


export async function getCitizenDashboardData(userId: string) {
    const [localReports, leaderboardData, userReports] = await Promise.all([
        getLocalReports(),
        getLeaderboardData(),
        getUserReports(userId),
    ]);

    return { localReports, leaderboard: leaderboardData, userReports };
}

export async function getBulkProducerReports(): Promise<BulkProducerReport[]> {
    // In a real app, this would fetch reports for bulk producers in a specific Green Champion's zone.
    // For this demo, we return mock data.
    return Promise.resolve([
        { id: 'bpr-01', producerName: 'The Grand Hotel', issue: 'Mixed waste in dry waste bin', status: 'Pending' },
        { id: 'bpr-02', producerName: 'City Mall Food Court', issue: 'No segregation of wet waste', status: 'Pending' },
        { id: 'bpr-03', producerName: 'Mega Hospital', issue: 'Bio-medical waste not separated', status: 'Flagged' },
    ]);
}
    
