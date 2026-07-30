'use strict';

const assert = require('assert');
const { compact } = require('../scripts/import-world-monster-reference');

const rows = compact([{
    id: 1, type: 'small', species: 'herbivore', name: 'Aptonoth',
    elements: [], ailments: [{ name: 'Paralysis' }],
    locations: [{ name: 'Ancient Forest' }]
}]);
assert.deepStrictEqual(rows[0], {
    sourceId: '1', nameEN: 'Aptonoth', kind: 'small', species: 'herbivore',
    elements: [], ailments: ['Paralysis'], locations: ['Ancient Forest'],
    sourceUrl: 'https://mhw-db.com/monsters/1', evidence: 'mhw-db-game-reference'
});
console.log('world monster reference importer tests passed');
