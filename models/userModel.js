const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    googleId: {
        type: String,
        sparse: true
    },
    picture: String,
    authProvider: {
        type: String,
        required: true,
        default: 'google'
    },
    watchlist: [{
        symbol: String,
        companyName: String,
        currentPrice: Number,
        profitLoss: Number,
        addedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);