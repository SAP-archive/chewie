
const copier = require('./../helpers/copier'),
  gulp = require('gulp'),
  fs = require('fs-extra');


function customize(customizationConfig, indexPath, next) {

  if(!customizationConfig) return next();
    
  const customizationTopics = Object.keys(customizationConfig);

  customizationTopics.forEach((c) => {
    
    if(!customizationConfig[c].active) return;

    switch(c) {
    case 'landingPageIndex':
      _customizeLandingPageIndex(customizationConfig[c], indexPath, next);
      break;
    }
  });


  function _customizeLandingPageIndex(config, indexPath, next) {

    const sourceIndexPath = indexPath ? indexPath : config.path;
    const destinationIndexPath = config.landingPageIndexPath;

    fs.copy(sourceIndexPath, destinationIndexPath, {overwrite: true}, next);
  }
}

module.exports = customize;