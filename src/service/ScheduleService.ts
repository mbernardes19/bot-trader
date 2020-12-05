import {schedule, ScheduledTask} from 'node-cron'

export default class ScheduleService {
    private _scheduledTasks: ScheduledTask[] = [];

    getScheduledTasks() {
        return this._scheduledTasks;
    }

    schedule(cronExpression: string, fn: () => void) {
        const task = schedule(cronExpression, fn);
        this._scheduledTasks.push(task);
    }

    startScheduledTasks() {
        this._scheduledTasks.map(task => task.start())
    }
}