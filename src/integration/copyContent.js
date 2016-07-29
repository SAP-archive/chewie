'use strict';
const eachRegTopic = require('../helpers/registryIterator'),
  copier = require('../helpers/copier'),
  modifyGlossary = require('../helpers/modifyGlossary'),
  async = require('async');


/**
 * This function copies files from src to dest location. Documentation, release notes and partials
 * @param {Array} [registry] - array of full registry
 * @param {Object} [config] - basic integration configuration
 * @param {Function} [next] - callback for async operations
 */

function copyContent(registry, config, next) {

  let src, dest, type, srcInt, destInt, srcPartial, destPartial, srcIntPartial, destIntPartial, srcRN, destRN, srcIntRN, destIntRN;

  eachRegTopic.async(registry, config, next, (topicDetails, cb) => {

    //DOCUMENTATION
    src = topicDetails.srcLocation;
    dest = (topicDetails.type === 'services' && topicDetails.latest) ? topicDetails.destLocation : topicDetails.destLocationWithoutVersion;
    srcInt = topicDetails.srcLocationInternal;
    destInt = (topicDetails.type === 'services' && topicDetails.latest) ? topicDetails.destLocationInternal : topicDetails.destLocationInternalWithoutVersion;

    //PARTIALS
    srcPartial = topicDetails.partialsSrcLocation;
    destPartial = topicDetails.partialsDestLocation;
    srcIntPartial = topicDetails.partialsSrcLocationInternal;

    //RELEASE NOTES only for latest
    if (topicDetails.latest) {
      srcRN = topicDetails.rnSrcLocation;
      destRN = (topicDetails.type === 'services') ? topicDetails.rnDestLocation : topicDetails.rnDestLocationWithoutVersion;
      srcIntRN = topicDetails.rnSrcLocationInternal;
      destIntRN = (topicDetails.type === 'services') ? topicDetails.rnDestLocationInternal : topicDetails.rnDestLocationInternalWithoutVersion;
    }

    async.series([

      copier.copyFilesAsync(src, dest, 'external docu'),
      copier.copyFilesAsync(srcInt, destInt, 'internal docu'),
      copier.copyFilesTapAsync(srcPartial, destPartial, modifyGlossary, 'external partials'),
      copier.copyFilesTapAsync(srcIntPartial, destPartial, modifyGlossary, 'internal partials'), //even though it is internal section every partial is copied to same location
      copier.copyFilesAsync(srcRN, destRN, 'external rn'),
      copier.copyFilesAsync(srcIntRN, destIntRN, 'internal rn')
    ], cb);
  });
}

module.exports = copyContent;
