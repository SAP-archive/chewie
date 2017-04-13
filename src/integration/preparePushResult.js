'use strict';
const async = require('async'),
  copier = require('../helpers/copier'),
  cloner = require('../helpers/cloner'),
  gulp = require('gulp'),
  del = require('del'),
  path = require('path'),
  validator = require('../helpers/validator'),
  reader = require('../helpers/reader'),
  log = require('../helpers/logger'),
  vfs = require('vinyl-fs'),
  misc = require('../helpers/misc');

/**
 * This function prepares a commit with changes.
 * @param {Object} [opt] - info necessary to determine where to make a proper changes and push them.
 * It should contains different attributes:
 * src - where to collect new things,
 * dest - where you keep clone of the repo where you want to push,
 * branch - from which branch it should clone (default is master),
 * repo - optional, if provided you will first clone this repo and perform operations on it, but if not provided then it is expected that 'dest' dir is a repo dir with .git folder,
 * independent - boolean value, which informs if the independent docu generation was used,
 * tempLocation - location of the tempLocation folder,
 * notClonedRepositoriesFile - name of the file, which stores the information about not cloned repositories,
 * indepenedentDocuRepositoriesFile - name of the file, which stores the information about repositories used during the independent docu generation,
 * apinotebooksOutLocation - directory where API Notebooks are stored in after generation - out folder,
 * message - commit message
 * @param {Function} [next] - callback for asynch operations
 */
function preparePushResult(config, opt, next) {
  const src = opt.src,
    dest = opt.dest,
    branch = opt.branch || 'master',
    repo = opt.repo,
    independent = opt.independent,
    tempLocation = opt.tempLocation,
    notClonedRepositoriesFile = opt.notClonedRepositoriesFile,
    indepenedentDocuRepositoriesFile = opt.indepenedentDocuRepositoriesFile,
    apinotebooksOutLocation = opt.apinotebooksOutLocation,
    message = opt.message;

  async.series([
    clone(repo, branch, dest),
    backupOfNotClonedRepositories(independent, tempLocation, notClonedRepositoriesFile),
    deletePreviouslyClonedResultsRepo(config, dest, independent, tempLocation, indepenedentDocuRepositoriesFile, message),
    copyFilesToLatestResultRepo(src, dest, independent),
    copyApiNotebooksToLatestResultRepos(apinotebooksOutLocation, dest, independent),
    restoreBackupOfNotClonedRepositories(independent, tempLocation, notClonedRepositoriesFile)
  ], next);
}

//clone of given repo
function clone(repo, branch, dest) {
  return (cb) => {
    repo ? cloner.cloneRepo(repo, branch, dest, cb) : cb();
  };
}

//responsible for backup of not cloned repositories
function backupOfNotClonedRepositories(independent, tempLocation, notClonedRepositoriesFile){
  return (cb) => {
    backup(true, false, tempLocation, notClonedRepositoriesFile, true, cb);
  };
}

//delete previously cloned results
function deletePreviouslyClonedResultsRepo(config, dest, independent, tempLocation, indepenedentDocuRepositoriesFile, message) {
  return (cb) => {
    if (independent) {
      eraseRepositoriesFromDest(tempLocation, indepenedentDocuRepositoriesFile, () => {
        eraseOutdatedLandingPagesFromDest(config, message, dest, cb);
      });
    }
    else{
      del([`${dest}/**/*`, `!${dest}/.git`])
        .then(() => cb())
        .catch(cb);
    }
  };
}

//copy documentation files to Latest Result Repo
function copyFilesToLatestResultRepo(src, dest, independent) {
  return (cb) => {
    if (independent) {
      vfs.src(src)
        .pipe(vfs.dest(dest, {overwrite: false}))
        .on('error', (err) => {
          log.error(`Informations about failure: \nsrc: ${src} \ndest: ${dest} \nindependent: ${independent} \nerror: ${err}`);
          cb(err);
        })
        .on('end', cb);
    }
    else {
      copier.copyFiles(src, dest, cb);
    }
  };
}

//copy API Notebooks files to Latest Result Repo
function copyApiNotebooksToLatestResultRepos(apinotebooksOutLocation, dest, independent) {
  return (cb) => {
    if (!independent) return cb();

    vfs.src([`${apinotebooksOutLocation}/**`])
      .pipe(vfs.dest(`${dest}/apinotebooks`, {overwrite: true}))
      .on('error', (err) => {
        log.error(`Informations about failure: \napinotebooksOutLocation: ${apinotebooksOutLocation} \ndest: ${dest} \nerror: ${err}`);
        cb(err);
      })
      .on('end', cb);
  };
}

//responsible for restoring of not cloned repositories
function restoreBackupOfNotClonedRepositories(independent, tempLocation, notClonedRepositoriesFile){
  return (cb) => {
    backup(false, true, tempLocation, notClonedRepositoriesFile, false, cb);
  };
}

module.exports = preparePushResult;

/**
 * Function resposible for moving files between two directories in order to backup them or restore them
 * @param {Boolean} [from] - responsible for choosing the src folder: `${item}/*` or `./tmp/backup/${path.normalize(item)}/*`
 * @param {Boolean} [to] - responsible for choosing the destination folder: `${item}/` or `./tmp/backup/${path.normalize(item)}/`
 * @param {String} [tempLocation] - indicates folder with cloned repositories
 * @param {String} [notClonedRepositoriesFile] -  name of the file with the information about not cloned repositories
 * @param {Boolean} [backupOperationInfo] - indicates that the backup operation is being performed
 * @param {Function} [cb] - callback for asynchronous operation
*/

function backup(from, to, tempLocation, notClonedRepositoriesFile, backupOperationInfo, cb){
  const notClonedRepoPath = `./${tempLocation}/${notClonedRepositoriesFile}`;

  reader.readFile(notClonedRepoPath, (err, notClonedRepositoresMatrix) => {
    const notClonedRepositores = JSON.parse(notClonedRepositoresMatrix);
    if (err || !notClonedRepositores.length) return cb();

    if (backupOperationInfo) log.info('Backup operation has been performed. Some repositories will be restored with their previous version. To find out more, please check logs.');

    const arrOfTasks = notClonedRepositores
      .filter((repo) => repo && repo.path)
      .map( (repo) => _backupSection(from, to, tempLocation, repo.path) );

    async.series(arrOfTasks, cb);
  });
}


/**
 * _backupSection is a helper that is meant for creating proper paths to backup files and initiate copyFilesAsync function
 * @param  {String} from           directory from where you want to copy
 * @param  {String} to             destination directory
 * @param  {String} tempLocation   temp location path from config
 * @param  {String} item           backup topic
 * @return {Function}              async function that is passed to async.series later
 */
function _backupSection(from, to, tempLocation, item) {

  const src = from ? `${item}/*` : `./${tempLocation}/backup/${path.normalize(item)}/*`;
  const dest = to ? `${item}/` : `./${tempLocation}/backup/${path.normalize(item)}/`;

  return copier.copyFilesAsync(src, dest, 'Backup operation');
}

/**
 * Function resposible for erasing files in order to enable independent docu generation
 * @param {String} [tempLocation] - indicates folder with cloned repositories
 * @param {String} [indepenedentDocuRepositoriesFile] - name of the file with the information about repositories used during the independent docu generation
 * @param {Function} [cb] - callback for asynchronous operation
*/
function eraseRepositoriesFromDest(tempLocation, indepenedentDocuRepositoriesFile, cb){
  const repoPath = `./${tempLocation}/${indepenedentDocuRepositoriesFile}`;

  reader.readFile(repoPath, (err, repoMatrix) => {
    const repoRawArray= JSON.parse(repoMatrix);
    if (err || !repoRawArray.length) return cb();

    const repoArray = repoRawArray
      .filter((repo) => repo && repo.path)
      .map((repo) => repo.path);

    const globalizedArray = _prepareGlobalizedPaths(repoArray);

    del(globalizedArray)
    .then(() => cb())
    .catch(cb);
  });
}

/** Function resposible for erasing index.html pages during independent generation
* @param {String} [message] - argv.topics string
* @param {Function} [cb] - callback for asynchronous operation
*/
function eraseOutdatedLandingPagesFromDest(config, message, dest, cb){
  let pathsToBeErased = [];

  misc.uniqTopicTypes(config, message).map((el) => {
    const paths = misc.prepareOutdatedPaths(dest, el);
    pathsToBeErased.push(paths.index, paths.indexInternal);
  });

  if(Array.isArray(config.independentPaths)) {
    const paths = config.independentPaths.map((singlePath) => `${dest}/${singlePath}`);
    pathsToBeErased = pathsToBeErased.concat(paths);
  }

  del(pathsToBeErased)
  .then(() => cb())
  .catch(cb);
}

/**
 * Function responsible for changing paths to enable globalization, for example /services/order/ to /services/**\/order/ so it catches subdirectories
 * @param  {String} [arrayOfRepositories] - string with paths that should be globalized, split by ,
 * @return {Array} [arrayOfGlobalizedPaths] - Array with globalized paths
 */
function _prepareGlobalizedPaths(arrayOfRepositories) {
  return arrayOfRepositories.map((el) => el.replace('/services/', '/services/**/'));
}
