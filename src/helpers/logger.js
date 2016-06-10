'use strict';
const util = require('gulp-util');

function error(msg) {
  util.log(util.colors.red(msg));
}

function warning(msg) {
  util.log(util.colors.yellow(msg));
}

function info(msg) {
  util.log(util.colors.green(msg));
}

const logger = {
  error,
  warning,
  info
};

module.exports = logger;
