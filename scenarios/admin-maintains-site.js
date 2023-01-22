// NOTE: This scenario does not support concurrence due some Drupal core bugs.

import http from 'k6/http';
import { check } from 'k6';
import { logIn } from '../lib/user.js';
import config from '../config.js';
import exec from 'k6/execution';
import { checkPageTitle, checkStatusMessage } from '../lib/page-utils.js';

export const options = {
    thresholds: {
        checks: ['rate == 1'],
        http_req_failed: ['rate == 0'],
    },
};

const isModuleInstalled = (res, module) =>
    res.html().find(`input[name="modules[${module}][enable]"]:checked`).size() === 1;

const isModuleUninstalled = (res, module) =>
    res.html().find(`input[name="modules[${module}][enable]"]:not(:checked)`).size() === 1;

function updateSiteConfiguration() {
    let res = http.get(config.baseUrl + '/admin/config/system/site-information');
    checkPageTitle(res, 'Basic site settings');
    res = res.submitForm({
        formSelector: '#system-site-information-settings',
        submitSelector: '#edit-submit',
        fields: {'site_slogan': 'An example food magazine website.'},
    });
    checkStatusMessage(res, 'The configuration options have been saved.');
}

function deleteRecentLogMessages() {
    let res = http.get(config.baseUrl + '/admin/reports/dblog');
    checkPageTitle(res, 'Recent log messages');

    res = res.clickLink({selector: 'li.tabs__tab a[href$="/admin/reports/dblog/confirm"]'});
    checkPageTitle(res, 'Are you sure you want to delete the recent logs?');

    res = res.submitForm({
        formSelector: '#dblog-confirm',
        submitSelector: '#edit-submit',
    });
    checkStatusMessage(res, 'Database log cleared.');
}

function createContentType() {
    let res = http.get(config.baseUrl + '/admin/structure');
    checkPageTitle(res, 'Structure');

    res = res.clickLink({selector: 'dt.admin-item__title a[href$="/admin/structure/types"]'});
    checkPageTitle(res, 'Content types');

    res = res.clickLink({selector: 'ul.local-actions [href$="/admin/structure/types/add"]'});
    checkPageTitle(res, 'Add content type');

    const typeName = `example_${exec.scenario.iterationInTest}`;
    res = res.submitForm({
        formSelector: '#node-type-add-form',
        submitSelector: '#edit-submit',
        fields: {'name': 'Example', 'type': typeName},
    });
    checkStatusMessage(res, 'has been added');

    res = res.clickLink({selector: `ul.local-actions [href$="/admin/structure/types/manage/${typeName}/fields/add-field"]`});
    checkPageTitle(res, 'Add field');

    const fieldName = `email_${exec.scenario.iterationInTest}`;
    res = res.submitForm({
        formSelector: '#field-ui-field-storage-add-form',
        submitSelector: '#edit-submit',
        fields: {'new_storage_type': 'email', 'label': 'Email', 'field_name': fieldName},
    });
    checkPageTitle(res, 'Email');

    res = res.submitForm({
        formSelector: '#field-storage-config-edit-form',
        submitSelector: '#edit-submit',
        fields: {'cardinality_number': '5'},
    });
    checkStatusMessage(res, 'Updated field');

    res = res.submitForm({
        formSelector: '#field-config-edit-form',
        submitSelector: '#edit-submit',
        fields: {'required': '1'},
    });
    checkStatusMessage(res, 'Saved');

    res = http.get(config.baseUrl + '/admin/structure/types');

    res = res.clickLink({selector: `li.dropbutton__item a[href*="/admin/structure/types/manage/${typeName}/delete"]`});
    checkPageTitle(res, 'Are you sure you want to delete the content type Example?');

    res = res.submitForm({
        formSelector: '#node-type-delete-form',
        submitSelector: '#edit-submit',
    });
    checkStatusMessage(res, 'has been deleted.');
}

function createUserRole() {
    let res = http.get(config.baseUrl + '/admin/people/roles');
    checkPageTitle(res, 'Roles');

    res = res.clickLink({selector: 'ul.local-actions [href$="/admin/people/roles/add"]'});
    checkPageTitle(res, 'Add role');

    res = res.submitForm({
        formSelector: '#user-role-form',
        submitSelector: '#edit-submit',
        fields: {'label': 'Test', 'id': 'test'},
    });
    checkStatusMessage(res, 'has been added');

    res = res.clickLink({selector: `li.dropbutton__item a[href*="/admin/people/roles/manage/test"]`});
    checkPageTitle(res, 'Edit role');
    res = res.submitForm({
        formSelector: '#user-role-form',
        submitSelector: '#edit-submit',
        fields: {'label': 'Test (updated)'},
    });
    checkPageTitle(res, 'Roles');

    res = res.clickLink({selector: `li.dropbutton__item a[href*="/admin/people/roles/manage/test/delete"]`});
    checkPageTitle(res, 'Are you sure you want to delete the role Test (updated)?');

    res = res.submitForm({
        formSelector: '#user-role-delete-form',
        submitSelector: '#edit-submit',
    });
    checkPageTitle(res, 'Roles');
}

function installModules() {
    let res = http.get(config.baseUrl + '/admin/modules');
    checkPageTitle(res, 'Extend');

    res.submitForm({
        formSelector: '#system-modules',
        submitSelector: '#edit-submit',
        fields: {
            'modules[action][enable]': '1',
            'modules[ban][enable]': '1',
            'modules[comment][enable]': '1',
            'modules[syslog][enable]': '1',
            'modules[telephone][enable]': '1',
        },
    });

    res = http.get(config.baseUrl + '/admin/modules');
    check(res, {
        'Action module is installed': isModuleInstalled(res, 'action'),
        'Ban module is installed': isModuleInstalled(res, 'ban'),
        'Comment module is installed': isModuleInstalled(res, 'comment'),
        'Syslog module is installed': isModuleInstalled(res, 'syslog'),
        'Telephone module is installed': isModuleInstalled(res, 'telephone'),
    });

    res = http.get(config.baseUrl + '/admin/modules/uninstall');
    checkPageTitle(res, 'Uninstall');

    res = res.submitForm({
        formSelector: '#system-modules-uninstall',
        submitSelector: '#edit-submit',
        fields: {
            'uninstall[action]': '1',
            'uninstall[ban]': '1',
            'uninstall[comment]': '1',
            'uninstall[syslog]': '1',
            'uninstall[telephone]': '1',
        },
    });
    checkPageTitle(res, 'Confirm uninstall');

    res = res.submitForm({
        formSelector: '#system-modules-uninstall-confirm-form',
        submitSelector: '#edit-submit',
    });
    checkPageTitle(res, 'Uninstall');
    checkStatusMessage(res, 'The selected modules have been uninstalled.');

    res = http.get(config.baseUrl + '/admin/modules');
    checkPageTitle(res, 'Extend');
    check(res, {
        'Action module is uninstalled': isModuleUninstalled(res, 'action'),
        'Ban module is uninstalled': isModuleUninstalled(res, 'ban'),
        'Comment module is uninstalled': isModuleUninstalled(res, 'comment'),
        'Syslog module is uninstalled': isModuleUninstalled(res, 'syslog'),
        'Telephone module is uninstalled': isModuleUninstalled(res, 'telephone'),
    });
}

export default function () {
    logIn(config.users.administrator);
    updateSiteConfiguration();
    deleteRecentLogMessages();
    createContentType();
    createUserRole();
    installModules()
}
