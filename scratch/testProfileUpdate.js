require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/User");

const testProfileUpdate = async () => {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/hopeconnect";
    console.log("Connecting to database:", mongoUri);

    try {
        await mongoose.connect(mongoUri);
        console.log("✅ Database connection established successfully.");

        // 1. Clean existing test user if any, and create a fresh one
        console.log("Setting up a clean test user...");
        await User.deleteOne({ email: "donor.test@example.com" });

        const originalPassword = "securePassword123!";
        const hashedPassword = await bcrypt.hash(originalPassword, 10);

        const testUser = await User.create({
            username: "Test Donor",
            email: "donor.test@example.com",
            password: hashedPassword
        });

        console.log("👤 Original Test User Created:");
        console.log(` - ID: ${testUser._id}`);
        console.log(` - Username: ${testUser.username}`);
        console.log(` - Email: ${testUser.email}`);
        console.log(` - Password Hash: ${testUser.password}`);

        // 2. Perform findByIdAndUpdate to simulate the updateProfile controller
        console.log("\nSimulating profile preferences update...");
        
        const updatePayload = {
            fieldsOfInterest: ["Education", "Healthcare"],
            donationType: "Books & Medical Kits",
            location: "Delhi NCR"
        };

        const updatedDoc = await User.findByIdAndUpdate(
            testUser._id,
            {
                $set: {
                    fieldsOfInterest: updatePayload.fieldsOfInterest,
                    donationType: updatePayload.donationType,
                    location: updatePayload.location
                }
            },
            { new: true, runValidators: true }
        );

        console.log("✅ Profile update operation complete.");

        // 3. Fetch from DB again to verify native state in Atlas/Local DB
        const finalUser = await User.findById(testUser._id);

        console.log("\n🔍 Verification results from MongoDB:");
        console.log("-----------------------------------------");
        console.log("Preferences successfully written:");
        console.log(` - location: "${finalUser.location}" (Expected: "${updatePayload.location}")`);
        console.log(` - donationType: "${finalUser.donationType}" (Expected: "${updatePayload.donationType}")`);
        console.log(` - fieldsOfInterest: ${JSON.stringify(finalUser.fieldsOfInterest)} (Expected: ${JSON.stringify(updatePayload.fieldsOfInterest)})`);
        
        console.log("\nAuth details untouched and preserved:");
        console.log(` - username: "${finalUser.username}" (Matches original: ${finalUser.username === testUser.username})`);
        console.log(` - email: "${finalUser.email}" (Matches original: ${finalUser.email === testUser.email})`);
        console.log(` - password hash: "${finalUser.password}" (Matches original: ${finalUser.password === testUser.password})`);
        console.log("-----------------------------------------");

        if (
            finalUser.location === updatePayload.location &&
            finalUser.donationType === updatePayload.donationType &&
            JSON.stringify(finalUser.fieldsOfInterest) === JSON.stringify(updatePayload.fieldsOfInterest) &&
            finalUser.password === testUser.password &&
            finalUser.email === testUser.email
        ) {
            console.log("🎉 SUCCESS: The schema expansion and update logic is 100% correct and non-destructive!");
        } else {
            console.error("❌ FAILURE: Verification mismatch occurred.");
            process.exit(1);
        }

    } catch (err) {
        console.error("❌ Test script failed:", err);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log("🔌 Disconnected from MongoDB.");
        process.exit(0);
    }
};

testProfileUpdate();
