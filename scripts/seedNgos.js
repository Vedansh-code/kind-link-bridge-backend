require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Ngo = require("../models/Ngo");

const seedNgos = async () => {
    // 1. Connection check and setup
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/hopeconnect";
    console.log(`Connecting to database: ${mongoUri}`);

    try {
        await mongoose.connect(mongoUri);
        console.log("✅ Successfully connected to MongoDB database.");

        // 2. Clear out existing NGO records
        console.log("Cleaning existing NGO records...");
        const deleteResult = await Ngo.deleteMany({});
        console.log(`🗑️  Cleared ${deleteResult.deletedCount} NGO record(s) from collection.`);

        // 3. Prepare passwords
        console.log("Generating secure hashed passwords for mock NGOs...");
        const securePassword = await bcrypt.hash("HopeConnectPass123!", 10);

        // 4. Define the 2 distinct mock NGO profiles
        const mockNgos = [
            {
                email: "hopeacademy@example.com",
                password: securePassword,
                name: "Hope Academy Foundation",
                tagline: "Empowering young minds through comprehensive learning resources.",
                isVerified: true,
                verificationDocument: {
                    fileUrl: "https://hopeconnect-verification-docs.s3.amazonaws.com/hope_academy_tax_exempt.pdf",
                    uploadedAt: new Date("2026-02-10T09:30:00.000Z"),
                    documentType: "80G_Tax_Exemption"
                },
                city: "Delhi",
                description: "Hope Academy Foundation focuses on providing quality education, learning kits, and structured school uniforms to children in under-resourced urban clusters in Delhi.",
                childrenInCare: [
                    {
                        name: "Aarav Sharma",
                        age: 11,
                        interests: "Drawing, Football, and Mathematics",
                        primaryNeeds: "books"
                    },
                    {
                        name: "Diya Kumari",
                        age: 9,
                        interests: "Singing, Science Experiments, and Puzzle Solving",
                        primaryNeeds: "uniforms"
                    }
                ],
                category: "Education",
                operatingLocations: ["South Delhi", "West Delhi"],
                foundedDate: new Date("2017-05-15T00:00:00.000Z"),
                impactMetrics: {
                    childrenConnected: 145,
                    schoolsConnected: 4,
                    hoursProvided: 960
                }
            },
            {
                email: "delhihealth@example.com",
                password: securePassword,
                name: "Delhi Healthcare Initiative",
                tagline: "Bridging the primary healthcare gap for vulnerable pediatric groups.",
                isVerified: false,
                verificationDocument: {
                    fileUrl: "",
                    uploadedAt: null,
                    documentType: ""
                },
                city: "Delhi",
                description: "Delhi Healthcare Initiative organizes mobile pediatric health camps, regular checkups, and nutritional supplement distribution for young orphans and underprivileged children.",
                childrenInCare: [
                    {
                        name: "Rohan Varma",
                        age: 8,
                        interests: "Cricket and Storybooks",
                        primaryNeeds: "pediatric vitamins and regular healthcare checkups"
                    }
                ],
                category: "Healthcare",
                operatingLocations: ["East Delhi"],
                foundedDate: new Date("2021-08-20T00:00:00.000Z"),
                impactMetrics: {
                    childrenConnected: 60,
                    schoolsConnected: 0,
                    hoursProvided: 320
                }
            }
        ];

        // 5. Insert mock data
        console.log("Seeding NGO database records...");
        const insertedNgos = await Ngo.insertMany(mockNgos);
        console.log(`🎉 Successfully seeded ${insertedNgos.length} NGOs into the database!`);

        insertedNgos.forEach((ngo, index) => {
            console.log(`\nNGO #${index + 1}:`);
            console.log(` - Name: ${ngo.name}`);
            console.log(` - Email: ${ngo.email}`);
            console.log(` - Category: ${ngo.category}`);
            console.log(` - Verified: ${ngo.isVerified}`);
            console.log(` - Children in Care Count: ${ngo.childrenInCare.length}`);
        });

    } catch (err) {
        console.error("❌ Seeding execution failed:", err);
        process.exit(1);
    } finally {
        // 6. Graceful database connection disconnect
        await mongoose.disconnect();
        console.log("\n🔌 Disconnected from MongoDB. Seeding process complete.");
        process.exit(0);
    }
};

seedNgos();
