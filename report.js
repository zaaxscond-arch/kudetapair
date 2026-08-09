const db = require('./database');
const moment = require('moment');

class Report {
    async generateGroupReport(gid) {
        const groups = await db.getGroups();
        const users = await db.getUsers();
        const reports = await db.getReports();
        
        const group = groups[gid] || {};
        const groupReports = Object.values(reports).filter(r => r.data.gid === gid);
        
        return {
            groupInfo: group,
            totalCommands: groupReports.length,
            lastActivity: groupReports.length > 0 
                ? moment(Math.max(...groupReports.map(r => r.timestamp))).format('DD/MM/YY HH:mm')
                : 'No activity',
            activeUsers: Object.keys(users).filter(u => users[u].lastGroup === gid).length,
            vipCount: Object.values(users).filter(u => u.role === 'vip').length
        };
    }

    async generateGlobalReport() {
        const users = await db.getUsers();
        const groups = await db.getGroups();
        const reports = await db.getReports();
        
        return {
            totalUsers: Object.keys(users).length,
            totalGroups: Object.keys(groups).length,
            totalCommands: Object.keys(reports).length,
            vipUsers: Object.values(users).filter(u => u.role === 'vip').length,
            activeGroups: Object.values(groups).filter(g => g.mode === 'active').length,
            bannedGroups: Object.values(groups).filter(g => g.mode === 'banned').length,
            topCommand: this.getTopCommand(reports)
        };
    }

    getTopCommand(reports) {
        const counts = {};
        Object.values(reports).forEach(r => {
            counts[r.type] = (counts[r.type] || 0) + 1;
        });
        return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';
    }

    async logCommand(type, data) {
        return await db.addReport(type, data);
    }
}

module.exports = new Report();
