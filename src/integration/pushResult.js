'use strict';
const git = require('gulp-git'),
  gulp = require('gulp'),
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
      .pipe(git.add({cwd: src, args:'-f'}))
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
    git.push('origin', branch, {cwd: src}, cb);
  };
}

function pull(branch, src){

  return (cb) => {
    git.pull('origin', branch, {cwd: src, args: '--depth=1'}, cb);
  };
}

module.exports = pushResult;
