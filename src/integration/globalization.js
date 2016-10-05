'use strict';
const eachRegTopic = require('../helpers/registryIterator'),
  replacer = require('../helpers/replacer'),
  async = require('async');

function globalization(registry, config, mapMarketsToRegions, next) {
  eachRegTopic.async(registry, config, next, (topicDetails, cb) => {
    if(topicDetails.type !== 'services') return cb();
    const regions = mapMarketsToRegions(topicDetails.markets);
    _globalizeTopic(topicDetails, regions, config);
    cb();
  });
}

function _globalizeTopic(topic, regions, config){
  const sourcePathPattern = `${topic.genDocuLocation}/**/*`;
  regions.forEach((region) => {
    const destinationPath = `${config.skeletonOutDestination}/${topic.type}/${region.code}/${topic.shortName}/${topic.version}`;
    replacer.replaceInFile(sourcePathPattern, config.defaultBaseUriDomain, region.domain, destinationPath, _replaceUrl(destinationPath, region.code, topic.type));
  });
}

function _replaceUrl(destinationPath, regionCode, topicType){
  return () => {
    const destinationPathPattern = `${destinationPath}/**/*`;
    replacer.replaceInFile(destinationPathPattern, `/${topicType}/`, `/${topicType}/${regionCode}/`, destinationPath, () => {});
  };
}

module.exports = globalization;
