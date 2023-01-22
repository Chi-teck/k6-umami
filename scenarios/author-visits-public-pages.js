import { logIn, isAuthenticated } from '../lib/user.js';
import { checkPublicPages } from '../lib/public-pages.js';
import config from '../config.js';

export const options = {
    thresholds: {
        checks: ['rate == 1'],
        http_req_failed: ['rate == 0'],
    },
};

export default function () {
    logIn(config.users.author);
    checkPublicPages({'Is authenticated': isAuthenticated});
}
