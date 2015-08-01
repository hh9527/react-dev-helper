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

  var dev = !!options.devPort || !!options.devHost;

  e.common = [
    dev && ('webpack-dev-server/client?http://' + (options.devHost || 'localhost') + ':' + (options.devPort || 3000)),
    dev && 'webpack/hot/only-dev-server',
  ].filter(isValid).concat(e.common || []);

  var format = options.useHash ? "[name].bundle.js" : "[name].bundle.[chunkhash].js";

  return {
    entry: e,
    output: {
      filename: format,
      chunkFilename: format,
      path: path.resolve('.', 'build', 'assets'),
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
      options.minify && new webpack.optimize.OccurenceOrderPlugin(true),
      options.minify && new webpack.optimize.DedupePlugin(),
      options.minify && new webpack.optimize.UglifyJsPlugin({
        warning: false,
      }),
      new AssetsPlugin({
        path: path.resolve('.', 'build'),
        filename: 'assets.json',
      }),
    ],
    resolve: {
      extensions: ['', '.js', '.jsx'],
    },
    module: {
      loaders: [
        { test: /\.jsx$/, loaders: [dev && 'react-hot', 'babel'].filter(isValid), exclude: /node_modules/ },
        { test: /\.js$/, loaders: ['babel'] },
        { test: /\.css)$/, loaders: ['style', 'css'] },
        { test: /\.less)$/, loaders: ['style', 'css', 'less'] },
        { test: /\.(woff2?|ttf|eot|svg|png|gif|jpe?g)$/, loaders: ['url?limit=10240'] },
      ]
    }
  }
}

function run(entry, options) {
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
exports.run = run;
