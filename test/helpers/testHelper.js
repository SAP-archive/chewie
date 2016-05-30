'use strict';
const gulp = require('gulp'),
  log = require('../../src/helpers/logger'),
  fs = require('fs'),
  chai = require('chai'),
  path = require('path'),
  expect = chai.expect;

/**
 * This function validates version of partials in the files
 * @param {String} [srcLocation] - location of the files to be validate
 * @param {String} [stringToCheck] - string to be found in the files
 * @param {String} [stringToValidate] - string to be validated
 * @param {Bool} [expectedValue] - true or false in expect
*/

const validateObjVersion = (srcLocation, stringToCheck, stringToValidate, expectedValue) => {

  const readDir = fs.readdirSync(srcLocation, 'utf-8');
  const dirLength = readDir.length;

  for (let i = 0; i < dirLength; i++) {
    const nextElement = readDir[i];
    const path = `${srcLocation}/${nextElement}`;

    try{
      const readPartial = fs.readFileSync(path, 'utf-8');
      const fileContent = (readPartial.indexOf(stringToCheck) >= 0);
      if (fileContent) {
        checkAndExpect(path, stringToValidate, expectedValue);
      }
      else {
        log.warning(`The following file does not contain desirable partial: ${path}`);
      }
    }
    catch(err){
      expect(err.code).to.equal('EISDIR');
    }
  }
};

const checkAndExpect = (partial, content, expectedValue) => {
  const readPartial = fs.readFileSync(partial, 'utf-8');
  const fileContent = (readPartial.indexOf(content) >= 0);
  expect(fileContent).to.equal(expectedValue);
};

/**
 * This function validates if file exists in synchronous manner
 * @param {String} [path] - Path to file
 */

const fileCheckSync = (path) => {
  let stats;

  try {
    return fs.statSync(path).isFile();
  }
  catch(err) {
    return false;
  }
};

/**
 * This function checks if content of the file is the same as content variable.
 * @param {String} [path] - Path to file
 * @return {String} - Content to compare
 */
const checkFileContentSync = (path, content) => {

  try {
    const fileContent = fs.readFileSync(path, 'utf-8');
    return fileContent === content;
  }
   catch(err) {
     log.error(err);
     return false;
   }
};

/**
 * This function validates if directory exists
 * @param {String} [dir] - dir path
 * @return {Boolean} - confirmation if exists or not
 */
const dirCheckSync = (dir) => {

  let stats;

  try {
    return fs.statSync(dir).isDirectory();
  }
  catch(err) {
    return false;
  }

};

function makeRegistryLocal() {
  process.env.REGISTRY_PATH = path.resolve(__dirname, './samples/registry');
  process.env.REGISTRY_LOCATION = 'local';
}

function makeRegistryRemote() {
  process.env.REGISTRY_PATH = 'git@github.com:hybris/chewie-sample-data.git';
  process.env.REGISTRY_LOCATION = 'remote';
}

const testHelper = {
  validateObjVersion,
  checkAndExpect,
  fileCheckSync,
  checkFileContentSync,
  dirCheckSync,
  makeRegistryLocal,
  makeRegistryRemote
};

module.exports = testHelper;
