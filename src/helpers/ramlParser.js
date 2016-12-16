'use strict';
const gulp = require('gulp'),
  raml = require('raml-parser'),
  tap = require('gulp-tap'),
  fs = require('fs'),
  async = require('async'),
  logger = require('./logger'),
  path = require('path'),
  toRAML = require('raml-object-to-raml'),
  creator = require('./creator'),
  validator = require('./validator'),
  _ = require('underscore'),
  vinylPaths = require('vinyl-paths'),
  ramlExtender = require('./ramlExtender');

/**
 * This function parses RAML files
 * @param {string} [source] - src directory
 * @param {string} [dest] - dest directory
 * @param {string} [baseUri] - baseUri to be replaced
 * @param {string} [listTraits] - string with traits
 * @param {Function} [next] - callback for operation
 */

function parse(source, dest, baseUri, listTraits, next) {
  const vp = vinylPaths();

  gulp.src(source)
    .pipe(vp)
    .pipe(gulp.dest('./tmp'))
    .on('error', next)
    .on('end', () => {
      if(!vp.paths.length) return next();

      const path = vp.paths[0];

      _processRamlFile(path, dest, baseUri, listTraits, next);
    });

}

function _avoidRepetitiousTraits (listOfTraits) {
  if (!listOfTraits) return;

  return _.uniq(listOfTraits);
}

function _avoidDuplications (listOfTraits) {
  if (!listOfTraits) return;

  const result = _.uniq(listOfTraits, (item) => {
    return _.first( _.keys(item));
  });

  return result;
}

function _parseRAML(filePath, dest, baseUri, listTraits, cb) {
  raml.loadFile(filePath).then((data) => {
    const givenTrait = data.traits;

    // traits avoid duplications
    data.traits = _avoidDuplications(givenTrait);

    // traits cleanup - not used
    data.traits && data.traits.length && data.traits.forEach((trait) => {

      if(!listTraits) return;

      const listOfTraits = listTraits.split(' ');

      /**
       * We are awaiting even number of traits. This part of code is responsible for cleaning
       * unused traits. That is why we are taking the first, third, fifth... etc. trait because
       * we know that these traits were replaced by second, fourth, sixth etc.
      */
      for (let i=0; i<listOfTraits.length; i+=2){
        if (!trait[listOfTraits[i]]) continue;
        delete trait[listOfTraits[i]];
      }
    });

    // replacing baseUri
    data.baseUri = baseUri;

    // avoiding repetitions in is: [trait, trait2]
    data.resources && data.resources.length && data.resources.forEach((trait) => {
      trait.is = _avoidRepetitiousTraits(trait.is);
    });

    // extend RAML, dereferencing $refs from JSON schemas
    try {
      ramlExtender.extend(data);
    }
    catch(err){
      logger.error(`Error while extends RAML: ${filePath}`);
      logger.error(err);
    }

    // object to RAML
    const result = toRAML(data);

    creator.createFilesSync(dest, result, 'utf-8');
    return cb('Generation went fine');
  }, (err) => {
    if(err && err.message && err.message.indexOf('ECONNREFUSED') !== -1) {
      logger.warning('Could not download traits.');
      return cb();
    }

    logger.error(`Failed rewriting for service with base uri: ${baseUri}`);
    logger.error(err);
    return cb();
  });
}

function _processRamlFile(source, dest, baseUri, listTraits, next) {
  validator.fileCheck(source, (err) => {
    if(err) return next(err);

    let retries = 0;
    async.whilst(
      () => retries < 3,
      (cb) => {
        retries++;
        _parseRAML(source, dest, baseUri, listTraits, cb);
      },
      (err) => {
        if(retries === 3) {
          logger.error('Couldn\'t download traits for RAML because server isn\'t responding');
          return process.exit(1);
        }

        return next();
      }
    );

  });
}



const ramlParser = {
  parse
};

module.exports = ramlParser;
