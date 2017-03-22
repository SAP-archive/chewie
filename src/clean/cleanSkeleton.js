'use strict';

const del = require('del'),
  async = require('async'),
  fs = require('fs'),
  eachRegTopic = require('../helpers/registryIterator'),
  reader = require('../helpers/reader'),
  path = require('path'),
  log = require('../helpers/logger');



/**
 * clean function removes given section of portal and any partials and rn it created
 * @param {Array}     [registry] - full registry of all topics
 * @param {Object}    [config] - basic integration configuration
 * @param  {String}   [name]  - section of portal to be deleted e.g. services/gettingstarted - can be empty to clean all
 * @param  {Function} [next]  -  callback when all functions are finished
 */
function clean(registry, config, name, next) {
  const isAll = !name;

  log.info(`Started cleaning ${isAll ? 'all sections' : name}`);

  eachRegTopic.sync(registry, config, _deleteSection(config, name, next), (topicDetails, cb) => {
    if(!isAll && topicDetails.type !== name) return cb();

    reader.getFilesFromLocations([topicDetails.partialsMainLocation, topicDetails.partialsMainLocationInternal], (err, files) => {
      if(!files) files = [];

      files = files.map((file) => `${topicDetails.partialsDestLocation}/${file}`);

      files = files.concat(deleteFiles(topicDetails, isAll));

      del(files).then(() => {
        cb();
      })
      .catch(cb);
    });
  });
}

function _deleteSection(config, name, cb) {
  const isAll = !name;

  return () => {
    const deleteFolder = !name ? config.tempLocation : `${config.docu.clonedRepoFolderPath}/${name}`;
    del(deleteFolder).then(() => {
      log.info(`Cleaned ${isAll ? 'all sections' : name}`);
      cb();
    })
    .catch(cb);
  };
}

//inner function
function deleteFiles(topicDetails, isAll) {
  const deleteArray = [`${topicDetails.destLocationWithoutVersion}`, `${topicDetails.destLocationInternalWithoutVersion}`, `${topicDetails.destLocation}`, `${topicDetails.destLocationInternal}`, `${topicDetails.rnDestLocationWithoutVersion}`, `${topicDetails.rnDestLocationInternalWithoutVersion}`, `${topicDetails.rnDestLocation}`, `${topicDetails.rnDestLocationInternal}`];
  if(isAll){
    deleteArray.push(`${topicDetails.tutorialsDest}`);
    deleteArray.push(`${topicDetails.matrixFileLocation}`);
  }

  return deleteArray;
}

module.exports = {
  clean
};
