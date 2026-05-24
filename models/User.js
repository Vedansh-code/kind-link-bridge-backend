const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            unique: true,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        fieldsOfInterest: [
            {
                type: String,
                trim: true
            }
        ],
        donationType: {
            type: String,
            trim: true
        },
        location: {
            type: String,
            trim: true
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
