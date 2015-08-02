var webpack = require('webpack');
var path = require('path');
var AssetsPlugin = require('assets-webpack-plugin');

function isValid(x) {
  return !!x;
}

function make(entry, options) {
  var e = {};
  for (var n in entry) {
    var item = entry[n];
    if (item)
      e[n] = (item instanceof Array) ? item.filter(isValid) : item;
  }

  options = options || {};
  var buildPath = options.buildPath || path.resolve('.', 'build');
  var dev = !!options.devPort || !!options.devHost;

  e.common = [
    dev && ('webpack-dev-server/client?http://' + (options.devHost || 'localhost') + ':' + (options.devPort || 3000)),
    dev && 'webpack/hot/only-dev-server',
  ].filter(isValid).concat(e.common || []);

  var format = options.useHash ? "[name].bundle.[chunkhash].js" : "[name].bundle.js";

  return {
    entry: e,
    devtool: dev ? 'eval-source-map' : 'source-map',
    output: {
      filename: format,
      chunkFilename: format,
      path: path.resolve(buildPath, 'assets'),
      publicPath: options.publicPath || '/assets/',
    },
    plugins: [
      dev && new webpack.HotModuleReplacementPlugin(),
      dev && new webpack.NoErrorsPlugin(),
      new webpack.optimize.CommonsChunkPlugin({
        name: 'common',
        minChunks: Infinity,
      }),
      options.minify && new webpack.optimize.MinChunkSizePlugin({
        minChunkSize: 102400,
      }),
      options.minify && new webpack.DefinePlugin({
        'process.env': {
          'NODE_ENV': JSON.stringify('production')
        }
      }),
      options.minify && new webpack.optimize.OccurenceOrderPlugin(true),
      options.minify && new webpack.optimize.DedupePlugin(),
      options.minify && new webpack.optimize.UglifyJsPlugin({
        warning: false,
      }),
      new AssetsPlugin({
        path: buildPath,
        filename: 'assets.json',
      }),
    ].filter(isValid),
    resolve: {
      extensions: ['', '.js', '.jsx'],
    },
    module: {
      loaders: [
        { test: /\.jsx?$/, loaders: [dev && 'react-hot', 'babel'].filter(isValid), exclude: /node_modules/ },
        { test: /\.css$/, loaders: ['style', 'css'] },
        { test: /\.less$/, loaders: ['style', 'css', 'less'] },
        { test: /\.(ttf|eot)$/, loaders: ['file'] },
        { test: /\.(woff2?|svg|png|gif|jpe?g)$/, loaders: ['url?limit=10240'] },
      ]
    }
  }
}

function runServer(entry, options) {
  var WebpackDevServer = require('webpack-dev-server');
  options.devPort = options.devPort || 3000;
  options.devHost = options.devHost || 'localhost';
  var config = make(entry, options);
  new WebpackDevServer(webpack(config), {
    publicPath: config.output.publicPath,
    hot: true,
    historyApiFallback: true
  }).listen(options.devPort, options.devHost, function (err, result) {
    if (err) throw err;
    console.log('Listening at ' + options.devHost + ':' + options.devPort);
  });
}

exports.make = make;
exports.runServer = runServer;
