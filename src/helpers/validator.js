'use strict';
const fs = require('fs'),
  log = require('./logger');



/**
 * This function validates if directory exists asynchronously
 * @param {String} [dir] - dir path
 * @return {Boolean} - confirmation if exists or not
 */
const dirCheck = (dir, next) => {

  try {
    fs.stat(dir, (err, stats) => {

      if (err) return next(err);

      if (stats.isDirectory()) return next();

      return next(`There was a problem with dirCheck on $(file)`);

    });
  }
  catch(err) {

    return next(err);
  }

};


/**
 * This function validates if file exists asynchronously
 * @param {String} [file] - file path
 * @return {Boolean} - confirmation if exists or not
 */
const fileCheck = (file, next) => {

  try {
    fs.stat(file, (err, stats) => {

      if (err) return next(err);

      if (stats.isFile()) return next();

      return next(`There was a problem with fileCheck on $(file)`);

    });
  }
  catch(err) {

    return next(err);
  }

};



const validator = {
  dirCheck,
  fileCheck
};


module.exports = validator;
