'use strict';
const gulp = require('gulp'),
  log = require('./logger'),
  git = require('gulp-git'),
  copier = require('./copier'),
  validator = require('./validator'),
  path = require('path'),
  fs = require('fs');

/**
 * This function clones any given repository and logouts a generic info about successfull clone
 * @param {String} [repoLocation] - repo that needs to be cloned. Must be ssh link
 * @param {String} [branchTag] - what branch or tag to use to clone it
 * @param {String} [expectedCloneLocation] - where to clone it to the file system
 * @param {Function} [cb] - callback for asynchronous operation
 */
function cloneRepo(repoLocation, branchTag, expectedCloneLocation, cb) {

  const locationRegEx = /((git|ssh|http(s)?)|(git@[\w\.]+))(:(\/\/)?)([\w\.@\:\/\-~]+)(\.git)(\/)?/;

  if(!repoLocation.match(locationRegEx)){

    validator.dirCheck(repoLocation, (err) => {

      if(err) {
        log.error(`${repoLocation} wasn't successfully cloned because there is no documentation in path: ${path.resolve(__dirname, repoLocation)}`);
        return cb(err);
      }

      return copier.copyFiles(`${origPath}/**`, destPath, (err, data) => {
        if (err) {
          log.error(`${repoLocation} wasn't successfully cloned from local directory`, err);
        }
        else {
          log.info(`${repoLocation} was successfully cloned using local directory`);
        }
        cb();
      });

    });

  }

  git.clone(repoLocation, {args: `${expectedCloneLocation} --depth 1 -b ${branchTag}`}, cb);
}

/**
 * This function is a helper for parallel operations. Reuses copyFiles function
 * @param {String} [repoLocation] - repo that needs to be cloned. Must be ssh link
 * @param {String} [branchTag] - what branch or tag to use to clone it
 * @param {String} [expectedCloneLocation] - where to clone it to the file system
 * @return {Function} anonymous function that triggers cloning and accepts a callback
 */
function cloneRepoAsync(repoLocation, branchTag, expectedCloneLocation, name) {

  return (cb) => {

    cloneRepo(repoLocation, branchTag, expectedCloneLocation, (err) => {

      cb(err, name);

    });
  };
}

const cloners = {
  cloneRepo,
  cloneRepoAsync
};

module.exports = cloners;
