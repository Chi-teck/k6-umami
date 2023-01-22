export const options = {
    thresholds: {
        checks: ['rate == 1'],
        http_req_failed: ['rate == 0'],
    },
};

export { checkPublicPages as default } from '../lib/public-pages.js';
