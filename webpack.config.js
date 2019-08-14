const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = env => {

    console.log("> set to: ", (env.prod===false) ? 'production' : 'development') // why this has to be a double negative idunno 

    return {
        entry: './src/index.js',
        output: {
            filename: 'bundle.js',
            path: path.resolve(__dirname, 'docs')
        },
        devtool: (!env.prod) ? 'none' : 'source-map',
        mode: (!env.prod) ? 'production' : 'development',
        devServer: {
            contentBase: './src',
            port: 8000
        },
        module: {
            rules: [{
                test: /\.css$/,
                use: [
                    'style-loader',
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            publicPath: './docs/'
                        },
                    },
                    'css-loader'
                ]
            }]
        },
        plugins: [
            new CleanWebpackPlugin(),
            new HtmlWebpackPlugin({
                title: 'DataShapes',
                filename: 'index.html',
                template: './src/index.html'
            }),
            new MiniCssExtractPlugin({
                filename: 'style.css',
            })
        ]
    }
};