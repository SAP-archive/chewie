'use strict';
const git = require('gulp-git'),
  copier = require('../helpers/copier'),
  cloner = require('../helpers/cloner'),
  gulp = require('gulp'),
  del = require('del'),
  async = require('async'),
  log = require('../helpers/logger');


/**
 * This function prepares a commit with changes and then pushes it to repository.
 * @param {Object} [opt] - info necessary to determine where to make a proper changes and push them.
 * It should contain 5 different attributes:
 * src - where to collect new things,
 * dest - where you keep clone of the repo where you want to push,
 * branch - to which branch push (default is master),
 * message - what is the commit message (default is 'Robot commit')
 * repo - optional, if provided you will first clone this repo
 * and perform operations on it, but if not provided then it is expected that 'dest' dir is a repo dir with .git folder
 * @param {Function} [next] - callback for asynch operations
 */
const pushResult = (opt, next) => {

  const src = opt.src,
    dest = opt.dest,
    branch = opt.branch || 'master',
    message = opt.message || 'Robot commit',
    repo = opt.repo,
    independent = opt.independent,
    notUsedFiles = opt.notUsedFiles;

  async.series([
    clone(repo, branch, dest),
    deleteNotNeeded(independent, notUsedFiles),
    copier.copyFilesAsync(src, dest),
    addCommit(dest, message),
    push(branch, dest)
  ], next);
};

//clone of given repo
function clone(repo, branch, dest) {
  return (cb) => {
    repo ? cloner.cloneRepo(repo, branch, dest, cb) : cb();
  };
}

//delete previous cloned results
function deleteNotNeeded(independent, notUsedFiles){
  return (cb) => {
    if (!independent) return cb();

    del(notUsedFiles).then(cb);
  };
}

//add and commit changes
function addCommit(src, msg){
  return (cb) => {
    gulp.src([`${src}/`])
      .pipe(git.add({args: '-f', cwd: src}))
      .pipe(git.commit(msg, {cwd: src}))
      .on('error', (err) => {

        cb(`There are no changes that can be commit or you are performing operations not on a local repo but normal folder.`);
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
