'use strict';

const eachRegTopic = require('../helpers/registryIterator'),
  async = require('async'),
  gulp = require('gulp'),
  validator = require('../helpers/validator'),
  creator = require('../helpers/creator'),
  replacer = require('../helpers/replacer'),
  nameCreator = require('../helpers/nameCreator'),
  replace = require('gulp-replace'),
  fs = require('fs'),
  log = require('../helpers/logger');


/**
 * This function is responsible for creating partials out of the RAML files.
 * @param {Array} [registry] - array of full registry
 * @param {Object} [config] - basic integration configuration
 * @param {Function} [next] - callback for asynch operations
 */
const createRAMLPartials = (registry, config, next) => {

  let name, shortName, shortNameInternal, latest, partialsMainLocation, partialsMainLocationInternal, version, topicSrcLocation, topicSrcLocationInternal, partialsRAMLContent, partialsRAMLContentInternal;

  eachRegTopic.async(registry, config, next, (topicDetails, cb) => {

    name = topicDetails.name;
    shortName = topicDetails.shortName;
    shortNameInternal = topicDetails.shortNameInternal;
    latest = topicDetails.latest;
    partialsMainLocation = topicDetails.partialsMainLocation;
    partialsMainLocationInternal = topicDetails.partialsMainLocationInternal;
    version = topicDetails.version;
    topicSrcLocation = topicDetails.topicSrcLocation;
    topicSrcLocationInternal = topicDetails.topicSrcLocationInternal;
    partialsRAMLContent = topicDetails.partialsRAMLContent;
    partialsRAMLContentInternal = topicDetails.partialsRAMLContentInternal;

    if(!topicDetails.isService) return cb();

    async.series([

      //create partials for external
      createPartials(partialsMainLocation, shortName, latest, version, partialsRAMLContent),

      //create partials for internal
      createPartials(partialsMainLocationInternal, shortNameInternal, latest, version, partialsRAMLContentInternal),

      //replace name of a partial for a new name for extenal
      replaceInAllFiles(latest, shortName, version, topicSrcLocation),

      //replace name of a partial for a new name for internal
      replaceInAllFiles(latest, shortNameInternal, version, topicSrcLocationInternal)

    ], cb);

  });
};


/**
 * This function creates partials for services.
 * @param {String} [srcPartials] - path to partial folder
 * @param {String} [name] - name of a service
 * @param {String} [latest] - check if version is latest
 * @param {String} [version] - version of a service
 * @param {String} [partialContent] - content of the partial
 */
function createPartials (srcPartials, name, latest, version, partialContent) {
  return (cb) => {
    validator.dirCheck(srcPartials, (err) => {
      const partialFilename = nameCreator.createPartialName(name, 'raml', version, latest, 'html');

      creator.createFile(`${srcPartials}/${partialFilename}`, partialContent, (err) => {
      });
    });
    return cb();
  };
}


/**
 * This function replaces names of partials in the files.
 * @param {String} [latest] - check if version is latest
 * @param {String} [name] - name of the service
 * @param {String} [version] - version of the service
 * @param {String} [topicSrcLocation] - files to be checked
 */
function replaceInAllFiles (latest, name, version, topicSrcLocation) {
  return (cb) => {
    if (latest) return cb();
    replacer.replaceInFile(`${topicSrcLocation}/*.*`, `@partial("${name}_raml")`, `@partial("${name}_raml_${version}")`, topicSrcLocation, cb);
  };
}

module.exports = createRAMLPartials;
