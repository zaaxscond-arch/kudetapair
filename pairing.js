const { 
    default: makeWASocket, 
    useMultiFileAuthState,
    fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const readline = require('readline');
const config = require('../config/settings');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

const logger = pino({ level: 'silent' });

async function startPairing() {
    const { state, saveCreds } = await useMultiFileAuthState(config.sessionPath);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        logger,
        printQRInTerminal: false,
        auth: state,
        browser: ['KUDETA-WEB', 'Chrome', '1.0.0']
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'open') {
            console.log('[KUDETA] Connected! Generating pairing code...');
            
            const phoneNumber = await question('Enter WhatsApp Number (62xxx): ');
            const code = await sock.requestPairingCode(phoneNumber);
            
            console.log(`\n[PAIRING CODE]: ${code}`);
            console.log('Open WhatsApp > Linked Devices > Link with Phone Number');
            console.log(`Enter: ${code}\n`);
        }

        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== 401;
            if (shouldReconnect) startPairing();
        }
    });
}

startPairing();
