class timeHelper {
    constructor() {
        this.dateRaw = new Date();

        this.day = this.dayForhuman();
        this.hour = this.dateRaw.getHours();
        this.minutes = this.minutesForhuman();
        this.year = this.dateRaw.getFullYear();
        this.month = this.dateRaw.getMonth() + 1;

    }

    minutesForhuman() {
        const min = this.dateRaw.getMinutes();
        if (min < 10) return `0${this.dateRaw.getMinutes()}`;
        return min;
    }

    dayForhuman() {
        const min = this.dateRaw.getDate();
        if (min < 10) return `0${this.dateRaw.getDate()}`;
        return min;
    }

    getDate() {
        return `${this.day}-${this.month}-${this.year}`;
    }

    getTime() {
        return `${this.hour}:${this.minutes}`;
    }

    getDateTime() {
        return `${this.getDate()}, ${this.getTime()}`;
    }
}

module.exports = timeHelper;