var path = require('path');
var entry = require(path.resolve('.', 'webpack.entry.js'));
require('./lib/index.js').runServer(entry, {
  devPort: 3000
});