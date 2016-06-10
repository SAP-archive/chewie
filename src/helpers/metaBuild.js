'use strict';
const creator = require('../helpers/creator'),
  _ = require('underscore');

/**
 * This function generates a content of the meta-inf file
 * @param {Object} [topicDetails] - docu topic details
 * @return {String} - content of meta-inf file
 */
function build(topicDetails) {

  let meta = '---\n';

  _.mapObject(topicDetails, (val, key) => {
    meta += `${key}: ${val}\n`;
  });

  meta += '---';

  return meta;

}

const metaBuild = {
  build
};


module.exports = metaBuild;
