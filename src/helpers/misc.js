'use strict';
const log = require('./logger'),
  fs = require('fs'),
  rimraf = require('rimraf'),
  _ = require('underscore'),
  systemPath = require('path');

/**
 * This function removes all the white spaces and other special signs and changes provided string into one word, all lowercase.
 * @param {String} [name] - string that has to be cleaned up
 * @return {String} - provided string after changes
 */
function trimAdvanced(name) {

  return name.toLowerCase().replace(/([^\w-])/g, '');
}

/**
 * This function takes a registry array and removes from it all entries that are not listed in a list of selected topics.
 * @param {Array} [registry] - array with all registry elements
 * @param {Array} [topics] - array of strings, names of topics that should stay in the registry
 * @return {Array} - registry array only with topics specified in topics array
 */
function registryShrink(registry, topics) {

  const shrinkedRegistry = [];
  const notExistingTopics = [];
  const existingTopics = [];
  let presentTopic;

  topics.forEach((topic) => {
    registry.forEach((regEntry) => {
      if ((trimAdvanced(topic.name) === trimAdvanced(regEntry.name)) && (topic.type === regEntry.type)){
        shrinkedRegistry.push(regEntry);
      }
    });
    presentTopic = _.where(shrinkedRegistry, topic);

    !presentTopic.length > 0 ? notExistingTopics.push(topic.name) : existingTopics.push(topic.name);
  });

  if (notExistingTopics.length > 0) log.error(`The following topic does not exist in the registry: ${notExistingTopics}`);

  log.warning(`Registry is shrinked and only the following topics will get cloned: ${existingTopics}`);

  return shrinkedRegistry;
}


function checkExtension(path, str) {
  return (path.indexOf(str, path.length - str.length) !== -1);
}

function changeFileName(path, newFileName) {

  const splitted = path.split(systemPath.sep);
  splitted.pop();
  const length = splitted.length;
  splitted[length] = newFileName;
  const newPath = splitted.join(systemPath.sep);

  return newPath;
}

function deleteFolderAsync(path) {

  return (cb) => {
    rimraf(path, (err) => {
      cb(err);
    });
  };
}

/**
 * Its helper method for creating async method for gulp task.
 * @param {Function} [func] - function you want to pack into async
 * @param {Array} [params] - array of strings, names of arguments passed into function
 */
const asyncTaskCreator = (func, params) => {
  return (cb) => {
    params.push(cb);
    func.apply(this, params);
  };
};

/**
 * This function reads the registry - it a fix for require issues.
 * @param {String} [path] - path to registry
 */
const getRegistry = (path) => {
  try {
    return JSON.parse(fs.readFileSync(path, 'utf8'));
  }
  catch(err) {
    log.error(`Registry was not loaded: ${err}. \nGeneration will be stopped.`);
    process.exit(1);
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

/**
 * Function returns table that consists of unique topics types. Values taken from argv.topics
 * -t 'services:serviceOne,tools:toolOne,services:serviceTwo' will return: [ 'services', 'tools' ]
 * @param  {String} [message] - argv.topics string
 * @return {Array} - Array with unique topic types
 */
function uniqTopicTypes(message) {
  if (!message) return [];

  return _.uniq(message.split(',').map((el) => el.split(':')[0]));
}


/**
 * Function returns an object that contains paths to files that will be erased during independent generation
 * @param {String} [dest] - where you keep clone of the repo where you want to push,
 * @param  {String} [service] - name of the service
 * @return {Object} - Object with paths to be erased
 */
function prepareOutdatedPaths(dest, service){
  if (!dest || !service) return {};

  const index = `${dest}/${service}/index.html`;
  const indexInternal = `${dest}/internal/${service}/index.html`;
  return {
    index: index,
    indexInternal: indexInternal
  };
}

const misc = {
  trimAdvanced,
  registryShrink,
  checkExtension,
  changeFileName,
  asyncTaskCreator,
  deleteFolderAsync,
  getRegistry,
  dirCheckSync,
  uniqTopicTypes,
  prepareOutdatedPaths
};

module.exports = misc;
