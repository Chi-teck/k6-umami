import { check } from 'k6';

export const getPageTitle = r => r.html().find('h1').text().trim();

export function checkPageTitle (res, pageTitle) {
    check(res, {'Page title': getPageTitle(res) === pageTitle});
}

export function checkStatusMessage (res, message) {
    check(res, {'Status message': res.body.includes(message)});
}
