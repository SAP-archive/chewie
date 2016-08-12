'use strict';
const config = require('../chewieConfigTest'),
  cloneDocuSources = require('../../src/integration/cloneDocuSources'),
  rewriteRAML = require('../../src/integration/rewriteRAML'),
  prepareApiReferences = require('../../src/integration/prepareApiReferences'),
  prepareRegistry = require('../../src/integration/prepareRegistry'),
  fs = require('fs'),
  rimraf = require('rimraf'),
  chai = require('chai'),
  expect = chai.expect,
  misc = require('../../src/helpers/misc'),
  eachRegTopic = require('../../src/helpers/registryIterator'),
  testHelper = require('../helpers/testHelper'),
  async = require('async');

describe('Run prepareApiReferences task', () => {

  let registry;

  before((done) => {
    prepareRegistry(null, config, () => {
      registry = testHelper.getRegistry(config.registry.registryPath);

      async.series([
        misc.asyncTaskCreator(cloneDocuSources, [registry, config, null]),
        misc.asyncTaskCreator(rewriteRAML, [registry, config, false]),
        misc.asyncTaskCreator(prepareApiReferences, [registry, config])
      ], done);

    });
  });


  it ('should create api.raml files in /files or /internal/files directories', (done) => {
    checkApiRamlFile('api.raml', done);
  });

  it ('should set proper baseURI in the api.raml file', (done) => {

    let topicDetails;

    eachRegTopic.async(registry, config, done, (topicDetails, cb) => {

      if (topicDetails.isService) {

        if (testHelper.dirCheckSync(topicDetails.topicSrcLocation)){
          const ramlFile = fs.readFileSync(`${topicDetails.topicSrcLocation}/api.raml`, 'utf-8');
          const baseUriIsCorrect = (ramlFile.indexOf(`baseUri: ${topicDetails.baseUri}`) >= 0);

          expect(baseUriIsCorrect).to.equal(true);
        }

        if (testHelper.dirCheckSync(topicDetails.topicSrcLocationInternal)){
          const ramlFileInternal = fs.readFileSync(`${topicDetails.topicSrcLocationInternal}/api.raml`, 'utf-8');
          const baseUriInternalIsCorrect = (ramlFileInternal.indexOf(`baseUri: ${topicDetails.baseUriInternal}`) >= 0);

          expect(baseUriInternalIsCorrect).to.equal(true);
        }

      }
      cb();
    });
  });

  it ('should generate html files out of the raml files for /files and /internal/files directories', (done) => {
    checkApiRamlFile('apireferenceTempContent.html', done);
  });

  it ('should create main API reference file for /files and /internal/files directories', (done) => {
    checkApiRamlFile('apireference.html', done);
  });

  it ('should set proper values in the API reference file', (done) => {

    let topicDetails;

    eachRegTopic.async(registry, config, done, (topicDetails, cb) => {

      if (topicDetails.isService){

        if (testHelper.dirCheckSync(topicDetails.topicSrcLocation)){
          const apiRefFile = fs.readFileSync(`${topicDetails.topicSrcLocation}/apireference.html`, 'utf-8');
          const metadataIsCorrect = (apiRefFile.indexOf(`service: ${topicDetails.name}`) >= 0);
          expect(metadataIsCorrect).to.equal(true);
        }

        if (testHelper.dirCheckSync(topicDetails.filesInternal)){
          const apiRefFileInternal = fs.readFileSync(`${topicDetails.topicSrcLocationInternal}/apireference.html`, 'utf-8');
          const metadataInternamIsCorrect = (apiRefFileInternal.indexOf(`service: ${topicDetails.topicSrcLocationInternal}`) >= 0);
          expect(metadataInternamIsCorrect).to.equal(true);
        }
      }
      cb();
    });
  });

  it ('should create JS Client out of the RAML files for /files and /internal/files directories', (done) => {
    checkApiRamlFile('client/index.js', done);
  });

  it ('should zip JS Client to client.zip archive for /files and /internal/files directories', (done) => {
    checkApiRamlFile('client.zip', done);
  });

  after((done) => {
    rimraf(`${config.tempLocation}`, done);
  });



  function checkApiRamlFile (file, done) {
    let topicDetails;

    eachRegTopic.async(registry, config, done, (topicDetails, cb) => {

      if (topicDetails.isService){
        if (testHelper.dirCheckSync(topicDetails.topicSrcLocation)){
          const apiRamlFile = fs.statSync(`${topicDetails.topicSrcLocation}/${file}`);
          expect(apiRamlFile.isFile()).to.equal(true);
        }

        if (testHelper.dirCheckSync(topicDetails.topicSrcLocationInternal)){
          const apiRamlFileInternal = fs.statSync(`${topicDetails.topicSrcLocationInternal}/${file}`);
          expect(apiRamlFileInternal.isFile()).to.equal(true);
        }
      }
      cb();
    });
  }
});
