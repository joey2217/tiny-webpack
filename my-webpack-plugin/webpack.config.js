const path = require('path');
const HelloWorldPlugin = require('./plugins/HelloWorldPlugin');

/** @type import('webpack').Configuration*/
module.exports = {
    mode: 'development',
    entry: './src/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: []
    },
    plugins: [
        new HelloWorldPlugin({
            foo: 'foo',
            bar: 'bar',
        })
    ]
};