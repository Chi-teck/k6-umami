import config from '../config.js';
import { publicPages } from '../lib/public-pages.js';
import http from 'k6/http';
import { check } from 'k6';

export const options = {
    thresholds: {
        checks: ['rate == 1'],
        http_req_failed: ['rate == 0'],
    },
};

const isOk = res => res.status === 200;

const baseUrl = buildBaseUrl(config.baseUrl);

function visitPage(url) {
    const res = http.get(config.baseUrl + url);
    const html = res.html();
    const urls = [];

    html.find('link').each(function(index, link) {
        const rel = link.getAttribute('rel');
        if (rel === 'stylesheet' && rel ===' icon') {
            urls.push(link.getAttribute('href'));
        }
    });

    html.find('script').each(function(index, script) {
        if (script.hasAttribute('src')) {
            urls.push(script.getAttribute('src'));
        }
    });

    html.find('img').each(function(index, img)  {
        urls.push(img.getAttribute('src'));
    });

    // Make the URLs absolute.
    urls.forEach(function (url, index) {
        if (!url.startsWith('http')) {
            urls[index] = baseUrl + url;
        }
    });

    http.batch(urls).forEach(function (res) {
        check(res, {'Is Ok': isOk(res)})
    })
}

/**
 * @see https://stackoverflow.com/a/21553982/272927
 */
function buildBaseUrl(url) {
    const match = url.match(/^(https?\:)\/\/(([^:\/?#]*)(?:\:([0-9]+))?)([\/]{0,1}[^?#]*)(\?[^#]*|)(#.*|)$/);
    return match && match[1] + '//' + match[2];
}

export default function () {
    publicPages.forEach(visitPage)
}
