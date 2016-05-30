'use strict';

const eachRegTopic = require('../helpers/registryIterator'),
  async = require('async'),
  gulp = require('gulp'),
  validator = require('../helpers/validator'),
  creator = require('../helpers/creator'),
  ziper = require('../helpers/ziper'),
  ramlParser = require('../helpers/ramlParser'),
  tap = require('gulp-tap'),
  replacer = require('../helpers/replacer'),
  path = require('path'),
  fs = require('fs'),
  logger = require('../helpers/logger'),
  raml2html = require('raml2html'),
  filendir = require('filendir'),
  raml2obj = require('raml2obj'),
  jsGenerator = require('raml-javascript-generator');

/**
 * This function prepares RAML files to be used in API Console, generates HTML file and javascript client out of the previously prepared RAML files.
 * @param {Array} [registry] - array of full registry
 * @param {Object} [config] - basic integration configuration
 * @param {Function} [next] - callback for asynch operations
 */
const prepareApiReferences = (registry, config, next) => {
  let name, nameInternal, externalFiles, internalFiles, apiReferenceContent, apiReferenceContentInternal, apiReferenceSource, apiReferenceSourceInternal, apiReferenceNewFile, apiReferenceNewFileInternal, raml2client, raml2clientInternal, clientFolder, clientFolderInternal, dest, destInternal;

  eachRegTopic.async(registry, config, next, (topicDetails, cb) => {
    name = topicDetails.name;
    nameInternal  = topicDetails.nameInternal;
    externalFiles = topicDetails.topicSrcLocation;
    internalFiles = topicDetails.topicSrcLocationInternal;
    apiReferenceContent = topicDetails.apiReferenceContent;
    apiReferenceContentInternal = topicDetails.apiReferenceContentInternal;
    apiReferenceSource = topicDetails.apiReferenceSource;
    apiReferenceSourceInternal = topicDetails.apiReferenceSourceInternal;
    apiReferenceNewFile = topicDetails.apiReferenceNewFile;
    apiReferenceNewFileInternal = topicDetails.apiReferenceNewFileInternal;
    clientFolder = topicDetails.clientFolder;
    clientFolderInternal = topicDetails.clientFolderInternal;

    if (topicDetails.isService) {
      async.series([

        // generate html files out of the raml files
        ramlToHtml(externalFiles, name),
        ramlToHtml(internalFiles, nameInternal),

        // create API reference file
        createApiReferenceMainFile(apiReferenceSource, apiReferenceNewFile, apiReferenceContent, name),
        createApiReferenceMainFile(apiReferenceSourceInternal, apiReferenceNewFileInternal, apiReferenceContentInternal, nameInternal),

        // create JS Client out of the RAML files
        ramlToClient(externalFiles, name),
        ramlToClient(internalFiles, nameInternal),

        // zip JS Client to client.zip archive
        ziper.zipFolderAsync(clientFolder, externalFiles, 'client', name),
        ziper.zipFolderAsync(clientFolderInternal, internalFiles, 'client', nameInternal)

      ], cb);
    }
    else {
      cb();
    }
  });
};


function ramlToHtml(files, name){

  const config = raml2html.getDefaultConfig(path.resolve(__dirname, '../raml2htmlTemplates/template.nunjucks'), path.resolve(__dirname, '../raml2htmlTemplates'));

  return (cb) => {
    validator.dirCheck(files, (err) => {

      if (err) return cb(null, name);

      raml2html.render(`${files}/api.raml`, config)
        .then((result) => {
          fs.writeFile(`${files}/apireferenceTempContent.html`, result, 'utf-8', cb);
        }, cb)
        .catch(cb);
    });
  };
}

function ramlToClient(dirPath, name){

  return (cb) => {
    validator.dirCheck(dirPath, (err) => {

      if (err) return cb(null, name);

      fs.readFile(`${dirPath}/api.raml`, 'utf-8', (err, data) => {

        if (err) return cb(null, name);

        raml2obj.parse(data).then((ramlObject) => {
          const parsedClient = jsGenerator(ramlObject);

          const files = parsedClient.files;

          files && Object.keys(files).forEach((file) => {
            filendir.writeFileSync(`${dirPath}/client/${file}`, files[file], 'utf-8');
          });

          cb();
        })
        .catch(cb);
      });
    });
  };
}


/**
 * This function creates API Reference files.
 * @param {Array} [fileToCheck] - array of paths to validate
 * @param {Array} [fileToCreate] - array of paths to be created
 * @param {string} [content] - content of a file that will be created
 * @param {string} [name] - name of the service
 */
function createApiReferenceMainFile(fileToCheck, fileToCreate, content, name){

  return (cb) => {
    validator.fileCheck(fileToCheck, (err) => {

      if (err) return cb(null, name);
      creator.createFile(fileToCreate, content, (err) => {

        return cb(err, name);

      });
    });
  };
}


module.exports = prepareApiReferences;
