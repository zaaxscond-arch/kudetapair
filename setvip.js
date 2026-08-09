module.exports = {
    name: 'setvip',
    description: 'Set VIP status to user',
    category: 'owner',
    
    async execute({ sock, sender, senderJid, args, auth, report }) {
        if (!await auth.isOwner(senderJid)) {
            return await sock.sendMessage(sender, { text: '[KUDETA] Owner only command.' });
        }

        const targetNumber = args[0];
        if (!targetNumber) {
            return await sock.sendMessage(sender, { text: '[KUDETA] Usage: /setvip <number>' });
        }

        const targetJid = targetNumber.includes('@') ? targetNumber : `${targetNumber}@s.whatsapp.net`;

        try {
            const success = await auth.setVIP(targetJid, senderJid);
            
            if (success) {
                await sock.sendMessage(sender, { 
                    text: `[KUDETA] ✓ VIP status granted.\n` +
                          `User: ${targetNumber}\n` +
                          `Granted by: ${senderJid}\n` +
                          `Access: FULL`
                });

                await sock.sendMessage(targetJid, { 
                    text: `[KUDETA] 🎖 VIP ACCESS GRANTED\n` +
                          `You now have full access to all commands.\n` +
                          `Welcome to the elite.`
                });

                await report.logCommand('setvip', { target: targetJid, grantedBy: senderJid });
            } else {
                await sock.sendMessage(sender, { text: '[KUDETA] User not found. Pair first.' });
            }

        } catch (err) {
            await sock.sendMessage(sender, { text: `[KUDETA] Failed: ${err.message}` });
        }
    }
};
