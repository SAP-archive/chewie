'use strict';
const util = require('gulp-util');

const error = (msg) => {
  util.log(util.colors.red(msg));
};

const warning = (msg) => {
  util.log(util.colors.yellow(msg));
};

const info = (msg) => {
  util.log(util.colors.green(msg));
};

const logger = {
  error,
  warning,
  info
};

module.exports = logger;
