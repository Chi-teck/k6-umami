import config from '../config.js';
import http from 'k6/http';
import { check } from 'k6';

const defaultChecks = {
    'Status code': r => r.status === 200,
    'Body size': r => r.body.length > 10000,
    'Body content': r => r.body.includes('Umami Food Magazine'),
};

export const publicPages = [
    // Global.
    '/',
    '/articles',
    '/recipes',
    '/about-umami',
    '/user/password',
    // Search.
    '/search/node?keys=chocolate',
    '/search/node?keys=pasta',
    '/search/node?keys=soup',
    '/search/node?keys=sauce',
    '/search/node?keys=herbs',
    // Articles.
    '/articles/give-it-a-go-and-grow-your-own-herbs',
    '/articles/dairy-free-and-delicious-milk-chocolate',
    '/articles/the-real-deal-for-supermarket-savvy-shopping',
    '/articles/the-umami-guide-to-our-favourite-mushrooms',
    '/articles/lets-hear-it-for-carrots',
    '/articles/baking-mishaps-our-troubleshooting-tips',
    '/articles/skip-the-spirits-with-delicious-mocktails',
    '/articles/give-your-oatmeal-the-ultimate-makeover',
    // Recipes.
    '/recipes/deep-mediterranean-quiche',
    '/recipes/vegan-chocolate-and-nut-brownies',
    '/recipes/super-easy-vegetarian-pasta-bake',
    '/recipes/watercress-soup',
    '/recipes/victoria-sponge-cake',
    '/recipes/gluten-free-pizza',
    '/recipes/thai-green-curry',
    '/recipes/crema-catalana',
    '/recipes/fiery-chili-sauce',
    '/recipes/borscht-with-pork-ribs',
    // Tags.
    '/tags/alcohol-free',
    '/tags/baked',
    '/tags/baking',
    '/tags/breakfast',
    '/tags/cake',
    '/tags/carrots',
    '/tags/chocolate',
    '/tags/cocktail-party',
    '/tags/dairy-free',
    '/tags/dessert',
    '/tags/dinner-party',
    '/tags/drinks',
    '/tags/egg',
    '/tags/grow-your-own',
    '/tags/healthy',
    '/tags/herbs',
    // Spanish pages.
    '/es',
    '/es/articles',
    '/es/recipes',
    '/es/user/login',
    '/es/acerca-de-umami',
];

export const checkPublicPages = function (extraCheks = {}) {
    // k6 does not support object spread yet.
    const checks = Object.assign(defaultChecks, extraCheks);
    publicPages.forEach(function(route) {
        check(http.get(config.baseUrl + route), checks);
    });
}
