const path = require('path');

module.exports = {
  root,
  sassResourcesLoader:  {
    loader:'sass-resources-loader',
    options: {
      resources:[
        './src/main/webapp/app/variables.scss'
      ]
    }
  }
};

const _root = path.resolve(__dirname, '..');

function root(args) {
  args = Array.prototype.slice.call(arguments, 0);
  return path.join.apply(path, [_root].concat(args));
}
