'use strict';
const git = require('gulp-git'),
  copier = require('../helpers/copier'),
  cloner = require('../helpers/cloner'),
  gulp = require('gulp'),
  del = require('del'),
  async = require('async'),
  fs = require('fs'),
  path = require('path'),
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

function pushResult(opt, next) {

  const src = opt.src,
    dest = opt.dest,
    branch = opt.branch || 'master',
    message = opt.message || 'Robot commit',
    repo = opt.repo,
    independent = opt.independent,
    notUsedFiles = opt.notUsedFiles;

  async.series([

    // that does not work - clone(repo, branch, dest),
    backupOfNotClonedRepositories(dest, independent),
    deleteNotNeeded(independent, notUsedFiles),
    deleteAll(independent, dest),
    copier.copyFilesAsync(src, dest),
    restoreBackup(dest, independent),
    addCommit(dest, message),
    push(branch, dest)
  ], next);
}

//clone of given repo
function clone(repo, branch, dest) {
  return (cb) => {
    repo ? cloner.cloneRepo(repo, branch, dest, cb) : cb();
  };
}

//delete previous cloned results
function backupOfNotClonedRepositories(dest, independent){
  return (cb) => {
    if (independent) return cb();

    fs.readFile('./tmp/notClonedRepositories.json', (err, data) => {
      const array = data.toString().split(',');
      array.forEach((item) => {
        copier.copyFiles(`${item}/*`, `./tmp/backup/${path.normalize(item)}/`, () => {
        });
      });
    });
  };
}

//delete previous cloned results
function deleteNotNeeded(independent, notUsedFiles){
  return (cb) => {
    if (!independent) return cb();

    del(notUsedFiles).then(cb);
  };
}

//delete previous cloned results
function deleteAll(independent, dest){
  return (cb) => {
    if (independent) return cb();

    del(`${dest}/*`).then(cb);
  };
}

function restoreBackup(dest, independent){
  return (cb) => {
    if (independent) return cb();

    fs.readFile('./tmp/notClonedRepositories.json', (err, data) => {
      const array = data.toString().split(',');
      array.forEach((item) => {
        copier.copyFiles(`./tmp/backup/${path.normalize(item)}/*`, `${item}/`, () => {
        });
      });
    });
  };
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
