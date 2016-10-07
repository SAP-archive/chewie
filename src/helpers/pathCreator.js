'use strict';

function globalizationDestination(outDestination, topic, regionCode){
  return function(version, isInternal){
    const internalPath = isInternal ? '/internal' : '';
    return `${outDestination}${internalPath}/${topic.type}/${regionCode}/${topic.shortName}/${version}`;
  };
}

const pathCreator = {
  globalizationDestination
};

module.exports = pathCreator;