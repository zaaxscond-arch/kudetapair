const chalk = require('chalk');
const moment = require('moment');

class Logger {
    static info(msg) {
        console.log(chalk.blue(`[${moment().format('HH:mm:ss')}] [INFO] ${msg}`));
    }

    static warn(msg) {
        console.log(chalk.yellow(`[${moment().format('HH:mm:ss')}] [WARN] ${msg}`));
    }

    static error(msg) {
        console.log(chalk.red(`[${moment().format('HH:mm:ss')}] [ERROR] ${msg}`));
    }

    static success(msg) {
        console.log(chalk.green(`[${moment().format('HH:mm:ss')}] [OK] ${msg}`));
    }

    static cmd(user, cmd, target) {
        console.log(chalk.magenta(`[${moment().format('HH:mm:ss')}] [CMD] ${user} → /${cmd} ${target || ''}`));
    }
}

module.exports = Logger;
