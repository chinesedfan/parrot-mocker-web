'use strict';

const path = require('path');

module.exports = {
    entry: {
        index: './web/pages/index.js',
        mockconfig: './web/pages/mockconfig.js',
        qrcode: './web/pages/qrcode.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js'
    },
    module: {
        rules: [{
            test: /\.js$/,
            loader: 'babel-loader',
            exclude: /node_modules/
        }, {
            test: /\.vue$/,
            loader: 'vue-loader'
        }, {
            test: /\.less$/,
            use: [
                'style-loader',
                {
                    loader: 'css-loader',
                    options: {
                        importLoaders: 1
                    }
                },
                'less-loader'
            ]
        }]
    },
    resolve: {
        alias: {
            'vue$': 'vue/dist/vue.common.js'
        },
        extensions: ['.vue', '.less', '.js']
    }
};
