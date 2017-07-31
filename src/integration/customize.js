
const copier = require('./../helpers/copier'),
  gulp = require('gulp'),
  fs = require('fs-extra'),
  log = require('../helpers/logger');


function customize(customizationConfig, next) {

  if(!customizationConfig || !customizationConfig.dirPath) {
    log.warning('Customization config is missing. Use \'customizationDirPath\' environment variable to provide path for customization folder. ');
    return next();
  }
  
  _customizeLandingPageIndex(customizationConfig, next);

}

function _customizeLandingPageIndex(customizationConfig, next) {
    
  const sourceIndexPath = `${customizationConfig.dirPath}/index.html.eco`;
  const destinationIndexPath = customizationConfig.landingPageIndexPath;

  fs.pathExists(sourceIndexPath, (err, exists) => {

    if(!exists) {
      log.error(`Path provided for customization of Landing Page doesnt exist! (path: ${sourceIndexPath})`);
      return next();
    }

    if(err) {
      log.error(`Error occured during reading path: ${sourceIndexPath}. ${err}`);
      return next();
    }

    fs.copy(sourceIndexPath, destinationIndexPath, {overwrite: true}, next);
  });

}

module.exports = customize;