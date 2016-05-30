'use strict';
const config = require('../chewieConfigTest'),
  cloneDocuSources = require('../../src/integration/cloneDocuSources'),
  createRAMLPartials = require('../../src/integration/createRAMLPartials'),
  prepareRegistry = require('../../src/integration/prepareRegistry'),
  topicPropsBuilder = require('../../src/helpers/topicPropsBuilder'),
  nameCreator = require('../../src/helpers/nameCreator.js'),
  testHelper = require('../helpers/testHelper'),
  fs = require('fs'),
  rimraf = require('rimraf'),
  chai = require('chai'),
  expect = chai.expect,
  async = require('async'),
  misc = require('../../src/helpers/misc'),
  eachRegTopic = require('../../src/helpers/registryIterator');

//use local config
testHelper.makeRegistryLocal();

describe('Run createRAMLPartials task', () => {

  let registry;

  before((done) => {
    prepareRegistry(null, config, () => {
      registry = require(`${config.registry.testRegistryPath}`);

      async.series([
        misc.asyncTaskCreator(cloneDocuSources, [registry, config]),
        misc.asyncTaskCreator(createRAMLPartials, [registry, config])
      ], done);
    });
  });


  it ('should create raml files for all external and internal services and put proper content inside', (done) => {
    let topicDetails;

    eachRegTopic.async(registry, config, done, (topicDetails, cb) => {

      if(!topicDetails.isService) return cb();

      const partialsFilename = nameCreator.createPartialName(topicDetails.shortName, 'raml', topicDetails.version, topicDetails.latest, 'html');
      const partialsInternalFilename = nameCreator.createPartialName(topicDetails.shortNameInternal, 'raml', topicDetails.version, topicDetails.latest, 'html');

      // external
      testHelper.checkAndExpect(`${topicDetails.partialsMainLocation}/${partialsFilename}`, topicDetails.partialsRAMLContent, true);

      // internal
      if(topicDetails.isInternalNameExists){
        testHelper.checkAndExpect(`${topicDetails.partialsMainLocationInternal}/${partialsInternalFilename}`, topicDetails.partialsRAMLContentInternal, true);
      }
      cb();

    });
  });

  it ('should replace if version !latest', (done) => {
    let topicDetails;

    eachRegTopic.async(registry, config, done, (topicDetails, cb) => {

      if(!topicDetails.isService) return cb();

      if (!topicDetails.latest) {
        testHelper.validateObjVersion(topicDetails.topicSrcLocation, `@partial("${topicDetails.shortName}_raml`, `@partial("${topicDetails.shortName}_raml")`, false);

        if (testHelper.dirCheckSync(topicDetails.topicSrcLocationInternal)){
          testHelper.validateObjVersion(topicDetails.topicSrcLocationInternal, `@partial("${topicDetails.shortName}_raml`, `@partial("${topicDetails.shortName}_raml")`, false);
        }
      }
      else {
        testHelper.validateObjVersion(topicDetails.topicSrcLocation, `@partial("${topicDetails.shortName}_raml`, `@partial("${topicDetails.shortName}_raml")`, true);

        if (testHelper.dirCheckSync(topicDetails.topicSrcLocationInternal)){
          testHelper.validateObjVersion(topicDetails.topicSrcLocationInternal, `@partial("${topicDetails.shortName}_raml`, `@partial("${topicDetails.shortName}_raml")`, true);
        }
      }
      cb();

    });
  });

  after((done) => {
    rimraf(`${config.tempLocation}`, done);
  });

});
