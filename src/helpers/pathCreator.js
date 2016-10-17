'use strict';

function globalizationDestination(outDestination, topic, regionCode){
  return function(version, isInternal){
    const internalPath = isInternal ? '/internal' : '';
    const regionPath = regionCode ? `/${regionCode}` : '';
    const shortName = (isInternal && topic.shortNameInternal) ? topic.shortNameInternal : topic.shortName;
    return `${outDestination}${internalPath}/${topic.type}${regionPath}/${shortName}/${version}`;
  };
}

const pathCreator = {
  globalizationDestination
};

module.exports = pathCreator;