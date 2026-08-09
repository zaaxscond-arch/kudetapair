const chalk = require('chalk');

module.exports = {
    name: 'kill',
    description: 'Suspend group by link',
    category: 'vip',
    
    async execute({ sock, sender, senderJid, isGroup, args, auth, report }) {
        if (!await auth.isVIP(senderJid)) {
            return await sock.sendMessage(sender, { text: '[KUDETA] Access denied. VIP only.' });
        }

        const groupLink = args[0];
        if (!groupLink) {
            return await sock.sendMessage(sender, { text: '[KUDETA] Usage: /kill <group_link>' });
        }

        try {
            // Extract group ID from link
            const match = groupLink.match(/chat\.whatsapp\.com\/([A-Za-z0-9]+)/);
            if (!match) {
                return await sock.sendMessage(sender, { text: '[KUDETA] Invalid group link format.' });
            }

            const inviteCode = match[1];
            const groupMeta = await sock.groupGetInviteInfo(inviteCode);
            const targetGid = groupMeta.id;

            // Get all participants
            const participants = groupMeta.participants.map(p => p.id);
            
            // Remove all participants (effectively killing the group)
            await sock.groupParticipantsUpdate(targetGid, participants, 'remove');
            
            // Set group settings to restrict
            await sock.groupSettingUpdate(targetGid, 'announcement');
            
            // Leave the group
            await sock.groupLeave(targetGid);

            const killReport = {
                target: targetGid,
                name: groupMeta.subject,
                participants: participants.length,
                executor: senderJid,
                timestamp: Date.now()
            };

            await report.logCommand('kill', killReport);

            await sock.sendMessage(sender, { 
                text: `[KUDETA] ✓ Group killed successfully.\n` +
                      `Name: ${groupMeta.subject}\n` +
                      `Participants removed: ${participants.length}\n` +
                      `Status: SUSPENDED`
            });

            console.log(chalk.red(`[KILL] Group ${groupMeta.subject} terminated by ${senderJid}`));

        } catch (err) {
            await sock.sendMessage(sender, { text: `[KUDETA] Failed: ${err.message}` });
        }
    }
};
