const db = require('./database');
const config = require('../config/settings');

class Auth {
    async isOwner(jid) {
        return jid.includes(config.ownerNumber);
    }

    async isVIP(jid) {
        const users = await db.getUsers();
        return users[jid]?.role === 'vip' || users[jid]?.role === 'owner';
    }

    async isPaired(jid) {
        const users = await db.getUsers();
        return !!users[jid];
    }

    async getRole(jid) {
        const users = await db.getUsers();
        if (jid.includes(config.ownerNumber)) return 'owner';
        return users[jid]?.role || 'guest';
    }

    async pairUser(jid, pairedBy) {
        await db.addUser(jid, { role: 'user', pairedBy, status: 'active' });
    }

    async setVIP(jid, setter) {
        const users = await db.getUsers();
        if (users[jid]) {
            users[jid].role = 'vip';
            users[jid].vipBy = setter;
            users[jid].vipAt = Date.now();
            await db.setUsers(users);
            return true;
        }
        return false;
    }
}

module.exports = new Auth();
