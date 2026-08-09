module.exports = {
    name: 'groupmode',
    description: 'Toggle group access mode',
    category: 'admin',
    
    async execute({ sock, sender, senderJid, isGroup, args, db, auth, report }) {
        if (!isGroup) {
            return await sock.sendMessage(sender, { text: '[KUDETA] This command only works in groups.' });
        }

        if (!await auth.isVIP(senderJid)) {
            return await sock.sendMessage(sender, { text: '[KUDETA] Access denied.' });
        }

        const mode = args[0]?.toLowerCase();
        if (!['on', 'off', 'active', 'banned'].includes(mode)) {
            return await sock.sendMessage(sender, { 
                text: '[KUDETA] Usage: /groupmode <on/off/active/banned>' 
            });
        }

        const groups = await db.getGroups();
        const normalizedMode = mode === 'on' || mode === 'active' ? 'active' : 'banned';
        
        groups[sender] = { 
            ...groups[sender], 
            mode: normalizedMode,
            updatedBy: senderJid,
            updatedAt: Date.now()
        };
        
        await db.setGroups(groups);

        const status = normalizedMode === 'active' ? '✓ ENABLED' : '✗ DISABLED';
        
        await sock.sendMessage(sender, { 
            text: `[KUDETA] Group mode updated.\n` +
                  `Mode: ${normalizedMode.toUpperCase()}\n` +
                  `Status: ${status}\n` +
                  `Updated by: ${senderJid}`
        });

        await report.logCommand('groupmode', { gid: sender, mode: normalizedMode, by: senderJid });
    }
};
