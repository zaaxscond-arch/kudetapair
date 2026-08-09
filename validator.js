module.exports = {
    isValidPhone(number) {
        return /^[0-9]{10,15}$/.test(number.replace(/[^0-9]/g, ''));
    },

    isValidGroupLink(link) {
        return /chat\.whatsapp\.com\/[A-Za-z0-9]+/.test(link);
    },

    isValidJid(jid) {
        return jid.endsWith('@s.whatsapp.net') || jid.endsWith('@g.us');
    },

    sanitizeInput(input) {
        return input.replace(/[<>\"']/g, '');
    }
};
