'use strict';

const assert = require('assert');
const HuntEngine = require('../js/effects/hunt/HuntEngine.js');

assert.strictEqual(HuntEngine.CART_CAMP_TICKS, 300,
    'a carted hunter must have a configurable 30-second base camp absence');

console.log('[test] Hunter cart base camp absence is 30 seconds.');
