'use strict';
const async = require('async'),
  copier = require('../helpers/copier'),
  cloner = require('../helpers/cloner'),
  gulp = require('gulp'),
  del = require('del'),
  path = require('path'),
  validator = require('../helpers/validator'),
  reader = require('../helpers/reader');

/**
 * This function prepares a commit with changes.
 * @param {Object} [opt] - info necessary to determine where to make a proper changes and push them.
 * It should contain 5 different attributes:
 * src - where to collect new things,
 * dest - where you keep clone of the repo where you want to push,
 * branch - from which branch it should clone (default is master),
 * repo - optional, if provided you will first clone this repo
 * and perform operations on it, but if not provided then it is expected that 'dest' dir is a repo dir with .git folder
 * @param {Function} [next] - callback for asynch operations
 */
function preparePushResult(opt, next) {
  const src = opt.src,
    dest = opt.dest,
    branch = opt.branch || 'master',
    repo = opt.repo,
    independent = opt.independent,
    tempLocation = opt.tempLocation;

  async.series([
    clone(repo, branch, dest),
    backupOfNotClonedRepositories(independent, tempLocation),
    deletePreviouslyClonedResultsRepo(dest, independent, tempLocation),
    copier.copyFilesAsync(src, dest),
    restoreBackupOfNotClonedRepositories(independent, tempLocation)
  ], next);
}

//clone of given repo
function clone(repo, branch, dest) {
  return (cb) => {
    repo ? cloner.cloneRepo(repo, branch, dest, cb) : cb();
  };
}

//responsible for backup of not cloned repositories
function backupOfNotClonedRepositories(independent, tempLocation){
  return (cb) => {
    backup(true, false, tempLocation, cb);
  };
}

//delete previously cloned results
function deletePreviouslyClonedResultsRepo(dest, independent, tempLocation) {
  return (cb) => {
    if (independent) {
      eraseRepositoriesFromDest(tempLocation, cb);
    }
    else{
      del([`${dest}/**/*`, `!${dest}/.git`]).then(() => cb());
    }
  };
}

//responsible for restoring of not cloned repositories
function restoreBackupOfNotClonedRepositories(independent, tempLocation){
  return (cb) => {
    backup(false, true, tempLocation, cb);
  };
}

module.exports = preparePushResult;

/**
 * Function resposible for moving files between two directories in order to backup them or restore them
 * @param {Boolean} [from] - responsible for choosing the src folder: `${item}/*` or `./tmp/backup/${path.normalize(item)}/*`
 * @param {Boolean} [to] - responsible for choosing the destination folder: `${item}/` or `./tmp/backup/${path.normalize(item)}/`
 * @param {String} [tempLocation] - indicates folder with cloned repositories
 * @param {Function} [cb] - callback for asynchronous operation
*/

function backup(from, to, tempLocation, cb){
  const notClonedRepoPath = `./${tempLocation}/notClonedRepositories.json`;

  reader.readFile(notClonedRepoPath, (err, notClonedRepositoresMatrix) => {
    if (err) return cb();

    const arrayOfNotClonedRepositories = notClonedRepositoresMatrix.toString().split(',');
    const arrOfTasks = [];

    arrayOfNotClonedRepositories.forEach((item) => {
      const src = from ? `${item}/*` : `./${tempLocation}/backup/${path.normalize(item)}/*`;
      const dest = to ? `${item}/` : `./${tempLocation}/backup/${path.normalize(item)}/`;

      arrOfTasks.push(copier.copyFilesAsync(src, dest, 'Backup operation'));
    });

    async.series(arrOfTasks, cb);
  });
}

/**
 * Function resposible for erasing files in order to enable independent docu generation
 * @param {String} [tempLocation] - indicates folder with cloned repositories
 * @param {Function} [cb] - callback for asynchronous operation
*/
function eraseRepositoriesFromDest(tempLocation, cb){
  const repoPath = `./${tempLocation}/indepenedentDocuRepositories.json`;

  reader.readFile(repoPath, (err, repoMatrix) => {
    if (err) return cb();

    const arrayOfRepositories = repoMatrix.toString().split(',');

    arrayOfRepositories.forEach((item) => del(item));

    return cb();
  });
}
