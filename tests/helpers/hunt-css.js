'use strict';

const fs = require('fs');
const path = require('path');

module.exports = [
    path.resolve(__dirname, '../../style.css'),
    path.resolve(__dirname, '../../styles/hunt-runtime.css')
].map(file => fs.readFileSync(file, 'utf8')).join('\n');
