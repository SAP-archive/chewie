'use strict';

const eachRegTopic = require('../helpers/registryIterator'),
  async = require('async'),
  gulp = require('gulp'),
  validator = require('../helpers/validator'),
  creator = require('../helpers/creator'),
  ziper = require('../helpers/ziper'),
  ramlParser = require('../helpers/ramlParser'),
  tap = require('gulp-tap'),
  replacer = require('../helpers/replacer'),
  path = require('path'),
  fs = require('fs'),
  logger = require('../helpers/logger'),
  deref = require('json-schema-deref-sync');


/**
 * This function prepares RAML files to be used in API Console.
 * @param {Array} [registry] - array of full registry
 * @param {Object} [config] - basic integration configuration
 */

function rewriteRAML(registry, config, traits, next) {

  let baseUri, baseUriInternal, sourcesCloneLoc, raml, ramlInternal, dest, destInternal;

  eachRegTopic.async(registry, config, next, (topicDetails, cb) => {
    if(topicDetails.type !== 'services') return cb();

    baseUri = topicDetails.baseUri;
    baseUriInternal = topicDetails.baseUriInternal;
    sourcesCloneLoc = topicDetails.basicLocation;
    raml = topicDetails.raml;
    ramlInternal = topicDetails.ramlInternal;
    dest = topicDetails.topicSrcLocation;
    destInternal = topicDetails.topicSrcLocationInternal;

    async.series([
      _traitReplacer(traits, sourcesCloneLoc),
      _jsonRefSolver(sourcesCloneLoc),
      _parse(sourcesCloneLoc, dest, raml, baseUri, traits),
      _parse(sourcesCloneLoc, destInternal, ramlInternal, baseUriInternal, traits)
    ], cb);
  });
}

module.exports = rewriteRAML;


/**
 * This function replaces traits in the RAML files.
 * @param {Array} [traits] - traits to be replaced
 * @param {Object} [config] - basic integration configuration
 */
function _traitReplacer (traits, source) {
  return (cb) => {
    if (!traits) return cb();

    const listOfTraits = traits.split(' ').map(String);

    if (!listOfTraits.length %2) {
      logger.warn('You have specified uneven number of traits.');
      return cb();
    }

    gulp.src([`${source}**/*.raml`, `${source}/**/*.yaml`, `${source}/**/*.yml`])
      .pipe(tap((file) => {
        for (let i=0; i<listOfTraits.length; i+=2){
          _replaceInFile(file.path, listOfTraits[i], listOfTraits[i+1]);
        }
      })
      .on('end', cb)
    );
  };
}


/**
 * This function dereferences JSON pointers in a JSON schemas with their true resolved values.
 * @param {Object} [config] - basic integration configuration
 */
function _jsonRefSolver (source) {
  return (cb) => {

    gulp.src(`${source}**/*.json`)
      .pipe(tap((file) => {
        try {
          const path = require(file.path);
          const fullSchema = deref(path);

          creator.createFile(file.path, JSON.stringify(fullSchema, null, 4), (err) => {
            if (err) logger.warning(err);
          });
        }
        catch (err) {
          logger.warning(err);
        }
      })
      .on('end', cb)
    );

  };
}


/**
 * This function parses RAML files
 * @param {string} [source] - source directory
 * @param {string} [docuDir] - documentation directory
 * @param {string} [raml] - raml localization give by the user in the registry
 * @param {string} [baseUri] - base Uri to be replaced
 */
function _parse (source, docuDir, raml, baseUri, traits) {
  return (cb) => {
    validator.dirCheck(docuDir, (err) => {

      if (err) return cb(null, docuDir);

      if (raml) {
        ramlParser.parse(`${source}/${raml}`, `${docuDir}/api.raml`, baseUri, traits, cb);
      }
      else {
        ramlParser.parse(`${source}/**/*.raml`, `${docuDir}/api.raml`, baseUri, traits, cb);
      }
    });
  };
}


/**
 * This function replaces given string in a file
 * @param {string} [file] - file in which replacement will be done
 * @param {string} [from] - old string that will be replaced
 * @param {string} [to] - new string to replace the old one
 */
function _replaceInFile(file, from, to) {
  const data = fs.readFileSync(file, 'utf-8');

  const regexExp = new RegExp(`${from}(?!:)`, 'g');
  const replace = data.replace(regexExp, to);

  creator.createFilesSync(file, replace, 'utf-8');
}
