/**
 * MAL API has an unknown rate limit. From testing, it doesn't seem consistent either.
 * It's necessary to make a wrapper to work around the API limit.
 */

const DELAY_INTERVAL = 1.25;

class MalHandler {
    constructor() {
        /**
         * There's no way to know from Mal's 403 request how long the user needs to wait.
         * Keep attempting to send requests with exponential sleeps in between
         */
        this.sleepNow = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
    }
    async _handleRateLimit(uri, headers = {}, method = 'GET', _delay = 1000){
        /**
         * Keep sending requests to the route until the expected behavior happens instead of 403
         */
        console.log(`Rate limited: Sleeping for ${_delay} ms`);
        await this.sleepNow(_delay);

        _delay*=DELAY_INTERVAL;

        let res = await fetch(uri, {headers: headers, method: method});
        switch (res.status) {
            case 403:
                return await this._handleRateLimit(uri, headers, method, _delay);
            default:
                return res;
        }
    }
    async request(uri, headers = {}, method = 'GET') {
        let res = await fetch(uri, {headers: headers, method: method});
        if (res.status === 403) {
            return await this._handleRateLimit(uri, headers, method);
        }
        return res;
    }
}

export const MAL_HANDLER = new MalHandler;
