const path = require('path');

/** @type import('webpack').Configuration*/
module.exports = {
    mode:'development',
    entry: './src/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: [
                    {
                        loader: path.join(__dirname, 'loaders/my-loader.js'),
                        options: {
                            foo: 'foo',
                            bar: 'bar',
                        }
                    }
                ]
            }
        ]
    },
    // resolveLoader: {
    //     modules: [
    //         'node_modules',
    //         path.resolve(__dirname, 'loaders')
    //     ]
    // }
};