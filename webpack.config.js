const path = require('path');
const webpack = require('webpack');
const {merge} = require('webpack-merge');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CopyWebpackPlugin  = require('copy-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const NODE_ENV = JSON.stringify(process.env.NODE_ENV);
const fs = require('fs');

const PATHS = {
  dist: path.resolve(__dirname, 'build'),
  src: path.resolve(__dirname, 'src'),
  scripts: 'scripts',
  styles: 'styles',
  sep: path.sep,
  assets: ['img', 'fonts', 'favicon', 'libs', 'data']
};

const base = {

  mode: 'production',

  context: PATHS.src,

  entry: {
    main: `./${PATHS.scripts}/index.js`,
  },

  output: {
    path: PATHS.dist,
    filename: `${PATHS.scripts}/[name].js`,
    sourceMapFilename: `${PATHS.scripts}/[name].js.map`,
    publicPath: '',
    // library: 'webpackVariable'
  },

  // devtool:"source-map",
  
  plugins: [
    new webpack.DefinePlugin({
      NODE_ENV: NODE_ENV
    }),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      jquery: 'jquery',
    }),
    new HtmlWebpackPlugin({
      hash: false,
      // template: path.join( PATHS.src, 'index.html' ),
      template: path.join( PATHS.src + '/pug', 'index.pug' ),
      filename: `.${PATHS.sep}index.html`
    }),
  ],
  
  module: {
    rules: [

      {
        test: /\.(png|jpg|ttf|eot|woff|woff2)$/,
        use: [{
          loader: 'file-loader',
          options: {name: '[path][name].[ext]'}
        }]
      },

      {
        test: /\.svg$/,
        loader: 'svg-inline-loader'
      },

      {
        test: /\.pug$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'pug-loader'
        }
      },

      {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            sourceMaps: true
          }
        }
      },
      
      {
        test: /\.(js|jsx)$/,
        use: ["source-map-loader"],
        enforce: "pre"
     },

      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          
          {loader: 'style-loader'},

          {loader: 'css-loader',
            options: {'url': false,}
          },

          {loader: 'postcss-loader',
            options: {sourceMap: true}
          },

          {loader: 'sass-loader'},

          // {loader: 'stylefmt-loader',
          //   options: {}
          // },
        ]
      },
    ],
  },

  optimization: {
    splitChunks: {
      chunks: "all"
    },
  },

};

const dev = {

  mode: 'development',

  devServer: {
    port: 8080,
    overlay: {
      warning: true,
      errors: true
    },
    hot: true,
    contentBase: path.normalize(PATHS.dist),
  },

  watchOptions: {
    aggregateTimeout: 100
  },
  
  // devtool: 'inline-source-map',
  devtool: 'eval',
  
  plugins: [
    new webpack.SourceMapDevToolPlugin({
      filename: '[file].map',
    })
  ]
  
};

const build = {

  mode: 'production',

  module: {
    rules: [
      {
        test: /\.(sa|sc|c)ss$/,
        use: [

          {loader: MiniCssExtractPlugin.loader, options: {publicPath: `..${PATHS.sep}`}},

          {loader: 'css-loader',
            options: {'url': false,}
          },

          {loader: 'postcss-loader',
            options: {sourceMap: true}
          },

          {loader: 'sass-loader'},
        ]
      }
    ]
  },

  plugins: [

    function (paths) {
      let absPaths = paths.map( asset => {
        return { from: path.join( PATHS.src, asset ), to: path.join( PATHS.dist, asset ) }
      });

      let accessiblePath = absPaths.filter( path => {
        const empty = fs.readdirSync( path.from );
        console.log(empty);
        return empty.length;
      })

      if (accessiblePath.length) {
        return new CopyWebpackPlugin({
          patterns: accessiblePath
        })
      }
    }(PATHS.assets),

    new MiniCssExtractPlugin({
      filename: `${PATHS.styles}/[name].css`,
    }),

    // new BundleAnalyzerPlugin()

  ],

  // optimization: {

  //   nodeEnv: 'production',
  //   minimize: true,

  //   minimizer: [
  //     new TerserPlugin()
  //   ],

  //   splitChunks: {
  //     chunks: 'async',
  //     minSize: 20000,
  //     minRemainingSize: 0,
  //     maxSize: 0,
  //     minChunks: 1,
  //     maxAsyncRequests: 30,
  //     maxInitialRequests: 30,
  //     automaticNameDelimiter: '~',
  //     enforceSizeThreshold: 50000,
  //     cacheGroups: {
  //       defaultVendors: {
  //         test: /[\\/]node_modules[\\/]/,
  //         priority: -10
  //       },
  //       default: {
  //         minChunks: 2,
  //         priority: -20,
  //         reuseExistingChunk: true
  //       }
  //     }
  //   }
  // }
};

module.exports = function(env, argv) {
  console.log('mode', argv.mode);
  switch (argv.mode) {
    case 'development':
      console.log('development');
      return merge(base, dev);
    case 'production':
      console.log('production');
      return merge(base, build);
    case 'none':
    default:
      console.log('base');
      return base;
  }
}