import config from '../config.js';
import http from 'k6/http';
import { check } from 'k6';

const isOk = r => r.status === 200;

export const isAuthenticated = r => r.body.includes('class="menu-account__link"');

export function logIn(user) {

    const formRes = http.get(config.baseUrl + '/user/login');
    check(formRes, {'Is OK': isOk});

    const submitRes = formRes.submitForm({
        formSelector: '#user-login-form',
        fields: user,
    });
    check(submitRes, {'Is OK': isOk, 'Is authenticated': isAuthenticated});
}
