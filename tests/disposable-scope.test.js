const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const sourcePath = path.resolve(__dirname, '../js/runtime/DisposableScope.js');
const context = vm.createContext({ console });
const source = `${fs.readFileSync(sourcePath, 'utf8')}\nglobalThis.DisposableScope = DisposableScope;`;
vm.runInContext(source, context, { filename: sourcePath });

const order = [];
const scope = new context.DisposableScope();
scope.add(() => order.push('first'));
scope.add({ dispose: () => order.push('second') });
scope.add({ abort: () => order.push('third') });
scope.dispose();
scope.dispose();

assert.deepStrictEqual(order, ['third', 'second', 'first']);
scope.add(() => order.push('late'));
assert.deepStrictEqual(order, ['third', 'second', 'first', 'late']);

console.log('[test] DisposableScope cleanup contract passed.');
