export default class Logger {
    private static log(message: any, prefix: string, extra?: any) {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth()+1;
        const day = now.getDate();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        const milliseconds = now.getMilliseconds();
        if (extra) {
            console.log(`[${day}-${month}-${year} ${hours}:${minutes}:${seconds}::${milliseconds}] [${prefix}]`, message, extra);
        } else {
            console.log(`[${day}-${month}-${year} ${hours}:${minutes}:${seconds}::${milliseconds}] [${prefix}]`, message);
        }
    }

    static info(message: any, extra?: any) {
        this.log(message, 'INFO', extra);
    }

    static error(message: any, error: any) {
        this.log(message, 'ERROR', error);
    }

    static warning(message: any, extra?: any) {
        this.log(message, 'WARNING', extra);
    }
}