'use strict';
const gulp = require('gulp'),
  log = require('./logger'),
  async = require('async'),
  topicPropsBuilder = require('../helpers/topicPropsBuilder');


/**
 * This function clones a given topic's repository to a given location and logouts proper custom info
 * @param {Array} [registry] - full registry of all topics
 * @param {Object} [config] - basic integration configuration
 * @param {Function} [next] - callback fired at the end of the iterator
 * @param {Function} [worker] - function that performs operation on the registry.
 * Function receives following parameters: topicDetails that is an object containing all topic details; cb that is a callback required inside your function for async operations
 */
function eachRegTopic(registry, config, next, worker) {

  let topicDetails;

  async.map(registry, ((regEntry, callback) => {
    async.map(regEntry.source, ((sourceEntry, cb) => {

      //get all the properties out from the registry into one object
      topicDetails = topicPropsBuilder(regEntry, sourceEntry, config);

      worker(topicDetails, cb);

    }), () => {
      callback();
    });
  }), () => {
    next();
  });

}

function eachRegTopicSync(registry, config, next, worker) {

  let topicDetails;

  async.mapSeries(registry, ((regEntry, callback) => {
    async.mapSeries(regEntry.source, ((sourceEntry, cb) => {

      //get all the properties out from the registry into one object
      topicDetails = topicPropsBuilder(regEntry, sourceEntry, config);

      worker(topicDetails, cb);

    }), () => {
      callback();
    });
  }), () => {
    next();
  });

}

module.exports.async = eachRegTopic;
module.exports.sync = eachRegTopicSync;
