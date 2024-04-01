const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URL);

const User = mongoose.model('User', {
    userID: String,
    balance: Number,
    
    vpsLimit: Number,
    isBanned: Boolean,
    banReason: String,
    
    plan: String // free
});

const VPS = mongoose.model('VPS', {
    userID: String,
    ip: String,
    
    proxID: Number,
    
    name: String,
    
    ram: Number,
    cpu: Number,
    disk: Number,
    
    hasUsed: Boolean,
    usedCode: Number,
    
    expiry: Number, // Time to expire after lastRenew
    password: String,
    
    cost: Number,
    lastCost: Number,
    state: String, // queued / created
    node: String
});

module.exports = {
    User,
    VPS
};