if (__ENV.K6_DRUPAL_URL === undefined) {
    throw new Error('Base URL is not configured.');
}

let baseUrl = __ENV.K6_DRUPAL_URL;
if (!baseUrl.endsWith('/')) {
    baseUrl += '/';
}

export default {
    baseUrl,
    users: {
        administrator: {
            name: __ENV.K6_ADMIN_LOGIN || 'k6_admin',
            pass: __ENV.K6_ADMIN_PASS || 'k6_admin',
        },
        author: {
            name: __ENV.K6_AUTHOR_LOGIN || 'k6_author',
            pass: __ENV.K6_AUTHOR_PASS || 'k6_author',
        },
    },
}
