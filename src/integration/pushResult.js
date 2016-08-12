'use strict';
const git = require('gulp-git'),
  gulp = require('gulp'),
  log = require('./../helpers/logger'),
  async = require('async');

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
    pull(branch, dest),
    push(branch, dest)
  ], next);
}

//add and commit changes
function addCommit(src, msg){
  return (cb) => {
    gulp.src([`${src}/`])
      .pipe(git.add({cwd: src, args:'-f', maxBuffer: Infinity}))
      .pipe(git.commit(msg, {cwd: src, maxBuffer: Infinity}))
      .on('error', (err) => {
        log.warning(err);
        cb('There are no changes that can be commit or you are performing operations not on a local repo but normal folder.');
      })
      .pipe(gulp.dest(src))
      .on('end', cb);
  };
}

//pulling from remote repo
function pull(branch, src){
  return (cb) => {
    git.pull('origin', branch, {cwd: src, maxBuffer: Infinity, args: '--depth=1'}, cb);
  };
}

//pushing to remote repo
function push(branch, src){
  return (cb) => {
    git.push('origin', branch, {cwd: src, maxBuffer: Infinity}, cb);
  };
}

module.exports = pushResult;
