const path = require('path');

module.exports = {
    botName: process.env.BOT_NAME || 'KUDETA-WEB',
    ownerNumber: process.env.OWNER_NUMBER,
    prefix: process.env.PREFIX || '/',
    sessionPath: path.join(__dirname, '../../sessions'),
    dbPath: path.join(__dirname, '../../database'),
    spamDelay: 1000,
    maxSpam: 50,
    vipFeatures: ['kill', 'pair', 'setvip', 'otp'],
    groupFeatures: ['groupmode', 'ping'],
    reportInterval: 3600000
};
