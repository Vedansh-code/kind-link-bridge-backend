const mongoose = require("mongoose");

const childSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        age: {
            type: Number,
            required: true
        },
        interests: {
            type: String,
            trim: true,
            default: ""
        },
        primaryNeeds: {
            type: String,
            trim: true,
            default: ""
        }
    },
    { _id: false }
);

const ngoSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        tagline: {
            type: String,
            default: ""
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        verificationDocument: {
            fileUrl: {
                type: String,
                default: ""
            },
            uploadedAt: {
                type: Date
            },
            documentType: {
                type: String,
                default: ""
            }
        },
        city: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            required: true,
            trim: true
        },
        childrenInCare: {
            type: [childSchema],
            default: []
        },
        category: {
            type: String,
            required: true,
            trim: true
        },
        operatingLocations: {
            type: [
                {
                    type: String,
                    trim: true
                }
            ],
            default: []
        },
        foundedDate: {
            type: Date,
            required: true
        },
        impactMetrics: {
            childrenConnected: {
                type: Number,
                default: 0
            },
            schoolsConnected: {
                type: Number,
                default: 0
            },
            hoursProvided: {
                type: Number,
                default: 0
            }
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Ngo", ngoSchema);
