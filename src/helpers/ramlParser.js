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
  _ = require('underscore');


  /**
   * This function parses RAML files
   * @param {string} [source] - src directory
   * @param {string} [dest] - dest directory
   * @param {string} [baseUri] - baseUri to be replaced
   */
const parse = (source, dest, baseUri, listTraits, next) => {
  gulp.src(source)
      .pipe(tap((file) => {
        let retries = 0;
        async.whilst(
          () => retries < 3,
          (cb) => {
            retries++;
            _parseRAML(file, source, dest, baseUri, listTraits, cb);
          },
          (err) => {
            if(retries === 3) {
              logger.error(`Couldn't download traits for RAML because server isn't responding`);
              return process.exit(1);
            }
            next();
          }
        );
      })
    )
    .on('error', next);
};

const ramlParser = {
  parse
};

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

function _parseRAML(file, source, dest, baseUri, listTraits, cb) {
  raml.loadFile(`./${path.relative(process.cwd(), file.path)}`).then((data) => {

    const givenTrait = data.traits;

    // traits avoid duplications
    data.traits = _avoidDuplications(givenTrait);

    // traits cleanup - not used
    data.traits && data.traits.forEach((trait) => {
      if (!listTraits) return;

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
    data.resources.forEach((trait) => {
      trait.is = _avoidRepetitiousTraits(trait.is);
    });

    // object to RAML
    const result = toRAML(data);

    creator.createFilesSync(dest, result, 'utf-8');

    cb('Generation went fine');
  }, (err) => {

    if(err && err.message && err.message.indexOf('ECONNREFUSED') !== -1) {
      logger.warning(`Couldn't download traits, retrying...`);
      return cb();
    }

    cb('Other error, move on');
  });
}

module.exports = ramlParser;