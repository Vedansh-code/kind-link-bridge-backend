const express = require('express');
const nodemailer = require('nodemailer');
const User = require('../models/User'); // Mongoose User model

const router = express.Router();

// Configure the email sender
// Note for Yanish: Replace this with your actual SMTP credentials (like Gmail or Ethereal)
const transporter = nodemailer.createTransport({
    service: 'gmail', 
       auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS
    }
});

// The hidden endpoint that Python triggers at 3:00 AM
router.post('/trigger-emails', async (req, res) => {
    try {
        const { at_risk_users } = req.body;
        
        if (!at_risk_users || at_risk_users.length === 0) {
            return res.status(400).json({ message: "No at-risk users provided." });
        }

        // 1. Look up all users from the database whose IDs match the array from Python
        const users = await User.find({ _id: { $in: at_risk_users } });
        
        // 2. Loop through each user and send an email
        for (let user of users) {
            if (user.email) {
                await transporter.sendMail({
                    from: '"Kind-Link Team" <kind.link.team@gmail.com>',
                    to: user.email,
                    subject: `Haven't see you in a while at kind-link, ${user.username}!`,
                    html: `
                        <div style="font-family: Arial, sans-serif; padding: 20px;">
                            <h2>Hi ${user.username},</h2>
                            <p>It's been a while since you last checked out Kind-Link! 
                            There are so many new NGOs looking for amazing volunteers like you.</p>
                            <a href="https://kind-link-bridge-iota.vercel.app/" style="padding: 10px 15px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Discover New Causes</a>
                        </div>
                    `
                });
                console.log(`Sent retention email to: ${user.email}`);
            }
        }

        res.status(200).json({ message: `Successfully emailed ${users.length} users.` });
        
    } catch (error) {
        console.error("Error triggering emails:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;