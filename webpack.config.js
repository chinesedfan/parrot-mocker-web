'use strict';

const path = require('path');
const fs = require('fs');
const webpack = require('webpack');

const localServer = 'http://localhost:8442'; // proxy other requests to our local server
const plugins = [
    new webpack.DefinePlugin({
        GIT_HEAD: getGitHead()
    })
];
if (process.env.NODE_ENV === 'dev') {
    plugins.push(new webpack.HotModuleReplacementPlugin());
}

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
    devServer: {
        contentBase: path.resolve(__dirname, 'dist'),
        publicPath: '/dist/',
        port: 9074,
        hot: true,
        inline: true,
        disableHostCheck: true,
        proxy: {
            '!/{dist,sockjs-node}/**': localServer,
            '/dist/jsoneditor.webapp/**': localServer
        }
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
    plugins,
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
