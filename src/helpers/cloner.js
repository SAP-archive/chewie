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
