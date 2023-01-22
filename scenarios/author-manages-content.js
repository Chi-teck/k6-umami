import http from 'k6/http';
import { check } from 'k6';
import config from '../config.js';
import { logIn } from '../lib/user.js';
import { checkPageTitle, checkStatusMessage } from '../lib/page-utils.js';

export const options = {
    thresholds: {
        checks: ['rate == 1'],
        http_req_failed: ['rate == 0'],
    },
};

const getPageTitle = r => r.html().find('h1').text().trim();

function manageArticles() {
    let res = http.get(config.baseUrl + '/admin/content');
    checkPageTitle(res, 'Content')
    res = res.clickLink({selector: 'li a[href$="/node/add"]'});
    res = res.clickLink({selector: 'dt a[href$="/node/add/article"]'});

    res = res.submitForm({
        formSelector: '#node-article-form',
        submitSelector: '#edit-submit',
        fields: {
            'title[0][value]': 'Example',
            'body[0][value]': 'Lorem ipsum',
        },
    });
    checkPageTitle(res, 'Example');

    res = res.clickLink({selector: 'li.tab a[href$="/edit"]'});
    res = res.submitForm({
        formSelector: '#node-article-edit-form',
        submitSelector: '#edit-submit',
        fields: {
            'title[0][value]': 'Example (edited)',
            'revision_log[0][value]': 'New revision',
        },
    });
    checkPageTitle(res, 'Example (edited)');

    res = res.clickLink({selector: 'li.tab a[href$="/delete"]'});
    checkPageTitle(res, 'Are you sure you want to delete the content item Example (edited)?');

    res = res.submitForm({
        formSelector: '#node-article-delete-form',
        submitSelector: '#edit-submit',
    });
    checkStatusMessage(res, 'has been deleted');

    check(res, {'Is front page': res.url.endsWith('/en')});
}

function managePages() {
    let res = http.get(config.baseUrl + '/admin/content');
    check(res, getPageTitle(res) === 'Content');

    res = res.clickLink({selector: 'li a[href$="/node/add"]'});
    res = res.clickLink({selector: 'dt a[href$="/node/add/page"]'});

    res = res.submitForm({
        formSelector: '#node-page-form',
        submitSelector: '#edit-submit',
        fields: {
            'title[0][value]': 'Example',
            'body[0][value]': 'Lorem ipsum',
        },
    });
    checkPageTitle(res, 'Example');

    res = res.clickLink({selector: 'li.tab a[href$="/edit"]'});
    res = res.submitForm({
        formSelector: '#node-page-edit-form',
        submitSelector: '#edit-submit',
        fields: {
            'title[0][value]': 'Example (edited)',
            'revision_log[0][value]': 'New revision',
        },
    });
    checkPageTitle(res, 'Example (edited)');

    res = res.clickLink({selector: 'li.tab a[href$="/delete"]'});
    checkPageTitle(res, 'Are you sure you want to delete the content item Example (edited)?');

    res = res.submitForm({
        formSelector: '#node-page-delete-form',
        submitSelector: '#edit-submit',
    });
    checkStatusMessage(res, 'has been deleted');
    check(res, {'Is front page': res.url.endsWith('/en')});
}

function manageRecipes() {
    let res = http.get(config.baseUrl + '/admin/content');
    check(res, getPageTitle(res) === 'Content');

    res = res.clickLink({selector: 'li a[href$="/node/add"]'});
    res.clickLink({selector: 'dt a[href$="/node/add/recipe"]'});

    // @todo Implements this once https://www.drupal.org/project/drupal/issues/3222107 is resolved.
}

export default function () {
    logIn(config.users.author);
    manageArticles();
    managePages();
    manageRecipes();
}
