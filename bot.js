require('dotenv').config();
const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason,
    fetchLatestBaileysVersion 
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');
const config = require('../config/settings');
const db = require('./database');
const auth = require('./auth');
const report = require('./report');

// Import Commands
const killCmd = require('../commands/kill');
const pairCmd = require('../commands/pair');
const groupmodeCmd = require('../commands/groupmode');
const setvipCmd = require('../commands/setvip');
const pingCmd = require('../commands/ping');
const otpCmd = require('../commands/otp');

const commands = {
    kill: killCmd,
    pair: pairCmd,
    groupmode: groupmodeCmd,
    setvip: setvipCmd,
    ping: pingCmd,
    otp: otpCmd
};

const logger = pino({ level: 'silent' });

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState(config.sessionPath);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        logger,
        printQRInTerminal: false,
        auth: state,
        browser: ['KUDETA-WEB', 'Chrome', '1.0.0'],
        generateHighQualityLinkPreview: true
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log(chalk.red('Connection closed. Reconnecting...'), shouldReconnect);
            if (shouldReconnect) startBot();
        } else if (connection === 'open') {
            console.log(chalk.green.bold(`[KUDETA-WEB] Bot Connected!`));
            console.log(chalk.cyan(`Owner: ${config.ownerNumber}`));
        }
    });

    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const body = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
        const sender = msg.key.remoteJid;
        const isGroup = sender.endsWith('@g.us');
        const senderJid = isGroup ? msg.key.participant : sender;

        // Check prefix
        if (!body.startsWith(config.prefix)) return;
        
        const args = body.slice(config.prefix.length).trim().split(' ');
        const cmd = args.shift().toLowerCase();
        const fullArgs = args.join(' ');

        // Auto register group
        if (isGroup) {
            const groups = await db.getGroups();
            if (!groups[sender]) {
                await db.addGroup(sender, { 
                    name: msg.pushName || 'Unknown', 
                    mode: 'active',
                    addedBy: senderJid 
                });
            }
        }

        // Command Router
        if (commands[cmd]) {
            try {
                const ctx = {
                    sock, msg, sender, senderJid, isGroup, args, fullArgs,
                    db, auth, report, config
                };
                
                await commands[cmd].execute(ctx);
                await report.logCommand(cmd, { sender: senderJid, gid: sender, args: fullArgs });
            } catch (err) {
                console.error(chalk.red(`[ERROR] ${cmd}:`), err);
                await sock.sendMessage(sender, { text: `[KUDETA] Error executing /${cmd}: ${err.message}` });
            }
        }
    });

    return sock;
}

// Pairing Mode
if (process.argv.includes('--pairing')) {
    require('./pairing');
} else {
    startBot().catch(console.error);
}
