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
 * @param {Array} [topics] - array of topic objects that should stay in the registry
 */
function getTopicsByWildcard(registry, topics) {

  const finalTopics = [];

  topics.forEach((topic) =>  {
    // const names = ).map((el) => el.name);

    registry.forEach((el) => {
      if(_matchRuleShort(el.name, topic.name) && _matchRuleShort(el.type, topic.type) ) finalTopics.push({ name: el.name, type: el.type});
    });

  });

  return finalTopics;
}

//http://stackoverflow.com/questions/26246601/wildcard-string-comparison-in-javascript
function _matchRuleShort(str, rule) {
  const helperRule = rule.split('*').join('.*');

  return new RegExp(`^${rule.split('*').join('.*')}$`).test(str);
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

const misc = {
  trimAdvanced,
  registryShrink,
  checkExtension,
  changeFileName,
  asyncTaskCreator,
  deleteFolderAsync,
  getRegistry,
  getTopicsByWildcard
};

module.exports = misc;
