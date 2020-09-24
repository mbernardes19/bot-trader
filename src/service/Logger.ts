export default class Logger {
    private static log(message: string, prefix: string, extra?: any) {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth()+1;
        const day = now.getDay();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        const milliseconds = now.getMilliseconds();
        console.log(`[${day}-${month}-${year} ${hours}:${minutes}:${seconds}::${milliseconds}] [${prefix}] ${message} ${extra}`);
    }

    static info(message: string) {
        this.log(message, 'INFO');
    }

    static error(message: string, error: any) {
        this.log(message, 'ERROR', error);
    }

    static warning(message: string) {
        this.log(message, 'WARNING');
    }
}