const mongoose = require('mongoose');

const donationSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        foodType: {
            type: String,
            required: true,
        },
        quantity: {
            type: String,
            required: true,
        },
        expiryTime: {
            type: Date,
            required: true,
        },
        address: {
            type: String,
            required: true,
        },
        location: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point',
            },
            coordinates: {
                type: [Number], // [longitude, latitude]
                required: true,
            },
        },
        images: {
            type: [String],
            default: [],
        },
        preparationTime: {
            type: String,
        },
        donorId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        claimedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        status: {
            type: String,
            enum: ['Available', 'Claimed', 'Picked Up', 'Completed'],
            default: 'Available',
        },
    },
    {
        timestamps: true,
    }
);

donationSchema.index({ location: '2dsphere' });

const Donation = mongoose.model('Donation', donationSchema);
module.exports = Donation;
