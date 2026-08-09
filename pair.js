module.exports = {
    name: 'pair',
    description: 'Add access to user',
    category: 'vip',
    
    async execute({ sock, sender, senderJid, args, auth, report }) {
        if (!await auth.isVIP(senderJid)) {
            return await sock.sendMessage(sender, { text: '[KUDETA] Access denied. VIP only.' });
        }

        const targetNumber = args[0];
        if (!targetNumber) {
            return await sock.sendMessage(sender, { text: '[KUDETA] Usage: /pair <number>' });
        }

        const targetJid = targetNumber.includes('@') ? targetNumber : `${targetNumber}@s.whatsapp.net`;

        try {
            await auth.pairUser(targetJid, senderJid);
            
            await sock.sendMessage(sender, { 
                text: `[KUDETA] ✓ User paired successfully.\n` +
                      `Number: ${targetNumber}\n` +
                      `Paired by: ${senderJid}\n` +
                      `Status: ACTIVE`
            });

            // Notify target
            await sock.sendMessage(targetJid, { 
                text: `[KUDETA] You have been granted access to KUDETA-WEB Bot.\n` +
                      `Type /x to see available commands.`
            });

            await report.logCommand('pair', { target: targetJid, pairedBy: senderJid });

        } catch (err) {
            await sock.sendMessage(sender, { text: `[KUDETA] Failed: ${err.message}` });
        }
    }
};
