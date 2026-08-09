const os = require('os');

module.exports = {
    name: 'ping',
    description: 'Check bot status',
    category: 'public',
    
    async execute({ sock, sender, senderJid, db, auth }) {
        const start = Date.now();
        const users = await db.getUsers();
        const groups = await db.getGroups();
        const role = await auth.getRole(senderJid);

        const memory = process.memoryUsage();
        const uptime = process.uptime();

        const ping = Date.now() - start;

        const status = `
╔═══「 KUDETA-WEB STATUS 」═══╗
║ 🤖 Bot: ONLINE
║ ⚡ Ping: ${ping}ms
║ 🎭 Role: ${role.toUpperCase()}
║ 👥 Users: ${Object.keys(users).length}
║ 👥 Groups: ${Object.keys(groups).length}
║ 💾 RAM: ${(memory.heapUsed / 1024 / 1024).toFixed(2)} MB
║ ⏱ Uptime: ${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m
║ 🖥 Platform: ${os.platform()}
╚══════════════════════════════╝
        `.trim();

        await sock.sendMessage(sender, { text: status });
    }
};
