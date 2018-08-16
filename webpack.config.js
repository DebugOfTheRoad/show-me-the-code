const path = require('path');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
// const MinifyPlugin = require('babel-minify-webpack-plugin');
const { merge } = require('lodash');

const base = {
  output: {
    path: path.resolve(__dirname, './build'),
    filename: '[name].js'
  },
  resolve: {
    extensions: ['.ts', '.scss', '.js', '.vue', '.jsx', '.tsx', '.css', '.vue']
  },
  devtool: '#source-map'
};

const node = merge({}, base, {
  entry: {
    server: './server/main.ts'
  },
  module: {
    loaders: [
      {
        test: /.(j|t)s$/,
        loader: 'babel-loader',
        options: {
          babelrc: false,
          presets: [
            [
              'env',
              {
                targets: {
                  node: '6.10'
                },
                modules: false
              }
            ],
            'stage-0',
            'typescript'
          ]
        }
      }
    ]
  },
  target: 'node',
  node: {
    __dirname: false
  },
  externals: [
    {
      'socket.io': 'commonjs socket.io',
      'any-promise': 'commonjs any-promise',
      fsevents: 'commonjs fsevents',
      lodash: 'commonjs lodash',
      uuid: 'commonjs uuid',
      randomstring: 'commonjs randomstring',
      sequelize: 'commonjs sequelize',
      koa: 'commonjs koa',
      'koa-nunjucks-2': 'commonjs koa-nunjucks-2'
    },
    (context, request, done) => {
      if (/\.\.\/config/.test(request)) {
        done(null, `commonjs ${request}`);
      } else {
        done();
      }
    }
  ],
  plugins: [
    new CopyPlugin([
      {
        from: './server/view/**/*',
        to: './view/[name].[ext]'
      }
    ]),
    new webpack.optimize.ModuleConcatenationPlugin()
  ]
});

const client = merge({}, base, {
  entry: {
    index: './client/index/main.js',
    room: './client/room/main.js',
    run: './client/run/main.js',
    vendor: [
      'vue',
      'iview',
      'socket.io-client',
      'vue-class-component',
      'axios',
      'vue-socket.io',
      'vue-monaco',
      'moment'
    ]
  },
  output: {
    path: path.resolve(__dirname, './static'),
    filename: '[name].js',
    publicPath: process.env.PUBLIC_PATH || '/static/dist'
  },
  module: {
    rules: [
      {
        test: /\.(j|t)s?$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: {
            ts: 'babel-loader',
            scss: ExtractTextPlugin.extract([
              'css-loader',
              'postcss-loader',
              'sass-loader'
            ])
          }
        }
      },
      {
        test: /\.(css|scss)$/,
        use: ExtractTextPlugin.extract([
          'css-loader',
          'postcss-loader',
          'sass-loader'
        ])
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2)(\?\S*)?$/,
        loader: 'file-loader'
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?\S*)?$/,
        loader: 'file-loader',
        query: {
          name: '[name].[ext]?[hash]'
        }
      }
    ]
  },
  resolve: {
    alias: {
      'socket.io-client': 'socket.io-client/dist/socket.io.js'
    }
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: Infinity
    })
  ]
});

if (process.env.NODE_ENV === 'production') {
  client.output.path = path.resolve(__dirname, './dist');
  client.output.filename = '[name]_[chunkhash].js';
  client.plugins.push(
    new webpack.optimize.UglifyJsPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new ExtractTextPlugin({
      filename: '[name]_[contenthash].css',
      allChunks: true
    }),
    new webpack.optimize.ModuleConcatenationPlugin()
  );
  client.devtool = false;

  node.plugins.push(
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    })
  );
} else {
  client.plugins.push(
    // new CopyPlugin([
    //   {
    //     from: 'node_modules/monaco-editor/min/vs',
    //     to: 'vs'
    //   },
    //   {
    //     from: 'node_modules/babel.min.js',
    //     to: '.'
    //   }
    // ]),
    new ExtractTextPlugin({
      filename: '[name].css',
      allChunks: true
    })
  );
}

module.exports = [node, client];
