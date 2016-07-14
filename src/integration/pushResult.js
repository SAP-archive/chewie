'use strict';
const git = require('gulp-git'),
  copier = require('../helpers/copier'),
  cloner = require('../helpers/cloner'),
  gulp = require('gulp'),
  del = require('del'),
  async = require('async'),
  path = require('path'),
  log = require('../helpers/logger'),
  reader = require('../helpers/reader');

/**
 * This function pushes changes to repository.
 * @param {Object} [opt] - info necessary to determine where to make a proper changes and push them.
 * It should contain 3 different attributes:
 * dest - where you keep clone of the repo where you want to push,
 * branch - to which branch push (default is master),
 * message - what is the commit message (default is 'Robot commit')
 * @param {Function} [next] - callback for asynch operations
 */

function pushResult(opt, next) {
  const dest = opt.dest,
    branch = opt.branch || 'master',
    message = opt.message || 'Robot commit';

  async.series([
    addCommit(dest, message),
    push(branch, dest)
  ], next);
}

//add and commit changes
function addCommit(src, msg){
  return (cb) => {
    gulp.src([`${src}/`])
      .pipe(git.add({args: '-f', cwd: src}))
      .pipe(git.commit(msg, {cwd: src}))
      .on('error', (err) => {
        cb('There are no changes that can be commit or you are performing operations not on a local repo but normal folder.');
      })
      .pipe(gulp.dest(src))
      .on('end', cb);
  };
}

//pushing to remote repo
function push(branch, src){
  return (cb) => {
    git.push('origin', branch, {cwd: src}, (err) => {
      cb(err);
    });
  };
}

module.exports = pushResult;
