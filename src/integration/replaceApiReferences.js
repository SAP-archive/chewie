'use strict';

const eachRegTopic = require('../helpers/registryIterator'),
  async = require('async'),
  gulp = require('gulp'),
  validator = require('../helpers/validator'),
  replacer = require('../helpers/replacer'),
  fs = require('fs'),
  log = require('../helpers/logger');


/**
 * This function performs operations after generation of /out folder. All functions operates on /out folder. Function is triggered on build time by docpad.
 * @param {Array} [registry] - array of full registry
 * @param {Object} [config] - basic integration configuration
 * @param {Function} [next] - callback for asynch operations
 */
function replaceApiReferences(registry, config, next) {
  let name, nameInternal, genDocuLocation, genDocuLocationInternal, apiReferenceSource, apiReferenceSourceInternal, contentOfNav, genBasicDocuLocation, genBasicDocuLocationInternal;

  eachRegTopic.sync(registry, config, next, (topicDetails, cb) => {
    name = topicDetails.name;
    nameInternal = topicDetails.nameInternal;
    genDocuLocation = topicDetails.genDocuLocation;
    genDocuLocationInternal = topicDetails.genDocuLocationInternal;
    genBasicDocuLocation = topicDetails.genBasicDocuLocation;
    genBasicDocuLocationInternal = topicDetails.genBasicDocuLocationInternal;
    apiReferenceSource = topicDetails.apiReferenceSource;
    apiReferenceSourceInternal = topicDetails.apiReferenceSourceInternal;
    contentOfNav = '<li><a href="index.html#ApiReference" id="parent_api_ref_nav"> <span class="left-nav__icon hyicon hyicon-chevron u-hide-permanently"></span>API Reference</a></li>';

    if (!topicDetails.isService) return cb();


    async.series([

      //These tasks are responsible for copying content from apireferenceTempContent to apireference and modifying index.html (for docu). All changes are made on out folder.

      //External - index.html - rightReferencePlaceholder -> contentOfNav
      replaceContent(apiReferenceSource, `${genDocuLocation}/index.*`, 'rightReferencePlaceholder', contentOfNav, genDocuLocation, name),
      replaceContent(apiReferenceSource, `${genBasicDocuLocation}/latest/index.*`, 'rightReferencePlaceholder', contentOfNav, `${genBasicDocuLocation}/latest`, name),

      //External - index.html - mainReferencePlaceholder -> contentOfIndex
      replaceContent(apiReferenceSource, `${genDocuLocation}/index.*`, 'mainReferencePlaceholder', '', genDocuLocation, name),
      replaceContent(apiReferenceSource, `${genBasicDocuLocation}/latest/index.*`, 'mainReferencePlaceholder', '', `${genBasicDocuLocation}/latest`, name),

      //Internal - index.html - rightReferencePlaceholder -> contentOfNav
      replaceContent(apiReferenceSourceInternal, `${genDocuLocationInternal}/index.*`, 'rightReferencePlaceholder', contentOfNav, genDocuLocationInternal, nameInternal),
      replaceContent(apiReferenceSourceInternal, `${genBasicDocuLocationInternal}/latest/index.*`, 'rightReferencePlaceholder', contentOfNav, `${genBasicDocuLocationInternal}/latest`, nameInternal),

      //Internal - index.html - mainReferencePlaceholder -> contentOfIndex
      replaceContent(apiReferenceSourceInternal, `${genDocuLocationInternal}/index.*`, 'mainReferencePlaceholder', '', genDocuLocationInternal, nameInternal),
      replaceContent(apiReferenceSourceInternal, `${genBasicDocuLocationInternal}/latest/index.*`, 'mainReferencePlaceholder', '', `${genBasicDocuLocationInternal}/latest`, nameInternal),

      //External - apiconsole.html - rightReferencePlaceholder -> contentOfNav
      replaceContent(apiReferenceSource, `${genDocuLocation}/apiconsole.html`, 'rightReferencePlaceholder', contentOfNav, genDocuLocation, name),
      replaceContent(apiReferenceSource, `${genBasicDocuLocation}/latest/apiconsole.html`, 'rightReferencePlaceholder', contentOfNav, `${genBasicDocuLocation}/latest`, name),

      //Internal - apiconsole.html - rightReferencePlaceholder -> contentOfNav
      replaceContent(apiReferenceSourceInternal, `${genDocuLocationInternal}/apiconsole.html`, 'rightReferencePlaceholder', contentOfNav, genDocuLocationInternal, nameInternal),
      replaceContent(apiReferenceSourceInternal, `${genBasicDocuLocationInternal}/latest/apiconsole.html`, 'rightReferencePlaceholder', contentOfNav, `${genBasicDocuLocationInternal}/latest`, nameInternal)

    ], cb);
  });
}

/**
 * This function is responsible for replacing content of apireferenceTempContent.html file.
 * @param {Object} [file] - apireferenceTempContent.html file's validation
 * @param {Object} [src] - file to perform operations on
 * @param {Object} [oldContent] - content to be found in the src
 * @param {Object} [newContent] - new content to be replaced in src
 * @param {Object} [dest] - destination of a file after replacing
 */
function replaceContent (apiRefSource, src, oldContent, newContent, dest, name) {

  return (cb) => {

    return fs.readFile(apiRefSource, 'utf8', (err, data) => {
      if (err){
        return replacer.replaceInFile(src, oldContent, '', dest, cb);
      }

      const generatedContent = newContent || _createContent(data);
      replacer.replaceInFile(src, oldContent, generatedContent, dest, cb);

    });
  };
}


function _createContent(data) {
  return `<section id="ApiReference" class="group">\n<h2>API Reference</h2>\n<p>\n${data}\n</p>\n</section>\n<hr>`;
}

module.exports = replaceApiReferences;
