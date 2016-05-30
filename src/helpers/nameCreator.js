'use strict';
const misc = require('./misc');


/**
 * Function creates file name for url partials.
 * @param {String} [name] -  name of service
 * @param {String} [version] - version of service
 * @param {Boolean} [latest] - determine if processing version is latest
 * @param {String} [ext] - defines file extension for created filename

 */
const createPartialName = (name, type, version, latest, ext) => {

  const processedName = name;
  const processedType = type;
  const processedVersion = latest ? '' : `_${version}`;
  const extension = ext ? `.${ext}` : '';

  return `${processedName}_${type}${processedVersion}${extension}`;
};


const nameCreator = {
  createPartialName
};

module.exports = nameCreator;
