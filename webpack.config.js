'use strict';

const path = require('path');
const fs = require('fs');
const webpack = require('webpack');

module.exports = {
    entry: {
        index: './web/pages/index.js',
        mockconfig: './web/pages/mockconfig.js',
        qrcode: './web/pages/qrcode.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/dist/',
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
        }, {
            test: /\.css$/,
            use: [
                'style-loader',
                {
                    loader: 'css-loader',
                    options: {
                        importLoaders: 1
                    }
                }
            ]
        }, {
            test: /\.(png|jpg|jpeg|gif|eot|ttf|woff|woff2|svg|svgz)(\?.+)?$/,
            use: [{
                loader: 'url-loader',
                options: {
                    limit: 5000
                }
            }]
        }]
    },
    plugins: [
        new webpack.DefinePlugin({
            GIT_HEAD: getGitHead()
        })
    ],
    resolve: {
        alias: {
            'vue$': 'vue/dist/vue.common.js'
        },
        extensions: ['.vue', '.less', '.js']
    }
};

function getGitHead() {
    let gitHead = '';
    try {
        gitHead = fs.readFileSync('.git/refs/heads/master').toString().substring(0, 7);
    } catch (e) {
        gitHead = e.message;
    }
    return JSON.stringify(gitHead);
}
