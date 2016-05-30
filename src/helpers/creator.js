'use strict';
const log = require('./logger'),
  mkdirp = require('mkdirp'),
  filendir = require('filendir');


/**
 * This function writes a file in provided location with provided content
 * @param {String} [file] - name of the file that has to be created. Can be provided with path.
 * @param {Array} [content] - content that must be written to the file
 * @param {Function} [next] - callback for async operations
 */
const createFile = (file, content, next) => {

  filendir.writeFile(file, content, (err) => {

    if(err) {
      log.error(err);
      next();
      return;
    }
    next();
  });
};


/**
 * This function creates directory. Creates it even if sub directories are not present. Synchronously
 * @param {String} [dir] - directory path
 */
const createDir = (dir) => {

  mkdirp.sync(dir);

};

/**
 * This function creates file., its suited for async library operations. Creates it even if sub directories are not present.
 * @param {String} [file] - name of the file that has to be created. Can be provided with path.
 * @param {Array} [content] - content that must be written to the file
 * @param {String} [name] - helper variable to indentify operation
 */
const createFilesAsync = (file, content, name) => {

  return (cb) => {
    createFile(file, content, cb);
  };
};

/**
 * This function creates file. It is suited for sync library operations. Creates it even if sub directories are not present.
 * @param {String} [file] - name of the file that has to be created. Can be provided with path.
 * @param {Array} [content] - content that must be written to the file
 * @param {String} [name] - helper variable to indentify operation
 */
const createFilesSync = (file, content, options) => {
  filendir.writeFileSync(file, content, options);
};


const creator = {
  createFile,
  createDir,
  createFilesAsync,
  createFilesSync
};

module.exports = creator;
