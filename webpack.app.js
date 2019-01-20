require('v8-compile-cache');
const path = require('path');

const webpack = require('webpack');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const HtmlPlugin = require('html-webpack-plugin');
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
// const CleanWebpackPlugin = require('clean-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const { PUBLIC_PATH } = require('./config');

const isDev = process.env.NODE_ENV === 'development';

const vendors = [
  'react',
  'react-dom',
  'monaco-editor',
  'immutable',
  'redux',
  'react-redux',
  'dexie',
  'resize-observer-polyfill',
  'react-json-tree',
];

const config = {
  mode: process.env.NODE_ENV,
  entry: {
    vendors,
    app: './client/main.tsx',
  },
  output: {
    filename: isDev ? '[name].js' : '[name].[chunkhash].js',
    path: path.resolve(__dirname, 'static'),
    publicPath: PUBLIC_PATH,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'awesome-typescript-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.s?css$/,
        use: [isDev ? 'style-loader' : MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
      {
        test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
        loader: 'file-loader',
      },
    ],
  },
  watchOptions: {
    ignored: /(node_modules|src|target)/,
  },
  optimization: {
    minimizer: [],
    splitChunks: {
      cacheGroups: {
        vendor: {
          chunks: 'all',
          name: 'vendors',
          test: /(lodash|vendors)/,
          enforce: true,
        },
        monaco: {
          chunks: 'all',
          name: 'monaco',
          test: 'monaco',
          enforce: true,
        }
      },
    },
  },
  plugins: [
    new webpack.ProgressPlugin(),
    new MonacoWebpackPlugin(),
    new webpack.ContextReplacementPlugin(
      /monaco-editor(\\|\/)esm(\\|\/)vs(\\|\/)editor(\\|\/)common(\\|\/)services/,
      __dirname,
    ),
    new HtmlPlugin({
      template: './client/index.html',
      cache: true,
    }),
    new webpack.NamedChunksPlugin(chunk => {
      if (chunk.name) {
        return chunk.name;
      }
      const regex = /(.+)monaco\-editor\/esm\/(.*)/;
      for (const m of chunk._modules) {
        if (regex.test(m.context)) {
          return m.context.replace(regex, '$2');
        }
      }
      return null;
    }),
    // new CleanWebpackPlugin(['static']),
    // new HardSourceWebpackPlugin(),
    // new BundleAnalyzerPlugin(),
  ],
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    modules: [path.resolve(__dirname, 'client'), 'node_modules'],
  },
  devServer: {
    proxy: {
      '/ws': {
        target: 'ws://127.0.0.1:8086',
        ws: true,
      },
    },
  },
  stats: {
    all: undefined,
    colors: true,
    children: false,
    chunks: false,
  },
  performance: { hints: false },
  // devtool: false,
};

if (!isDev) {
  config.plugins.push(
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css',
    }),
    new webpack.HashedModuleIdsPlugin({
      hashFunction: 'sha256',
      hashDigest: 'hex',
      hashDigestLength: 20,
    }),
  );
  config.optimization.minimizer.push(
    new TerserPlugin({
      terserOptions: {
        ecma: 7,
      },
      extractComments: true,
      parallel: true,
    }),
    new OptimizeCssAssetsPlugin(),
  );
}

module.exports = config;
