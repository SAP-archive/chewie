'use strict';

const config = require('../chewieConfigTest'),
  cloneDocuSources = require('../../src/integration/cloneDocuSources'),
  prepareRegistry = require('../../src/integration/prepareRegistry'),
  createUrlPartials = require('../../src/integration/createUrlPartials'),
  copyContent = require('../../src/integration/copyContent'),
  topicPropsBuilder = require('../../src/helpers/topicPropsBuilder'),
  nameCreator = require('../../src/helpers/nameCreator'),
  testHelper = require('../helpers/testHelper'),
  eachRegTopic = require('../../src/helpers/registryIterator'),
  fs = require('fs'),
  rimraf = require('rimraf'),
  chai = require('chai'),
  expect = chai.expect,
  async = require('async'),
  misc = require('../../src/helpers/misc');

describe('Create Url Partials', () => {

  let registry;
  const matrixFileLocation = config.constantLocations.apinotebooksTestMatrixFile;

  before((done) => {

    prepareRegistry(null, config, () => {
      registry = testHelper.getRegistry(config.registry.registryPath);

      async.series([
        misc.asyncTaskCreator(cloneDocuSources, [registry, config, null]),
        misc.asyncTaskCreator(createUrlPartials, [registry, config])
      ], done);

    });
  });



  it('should create partials with services url', (done) => {
    let topicDetails;

    eachRegTopic.async(registry, config, done, (topicDetails, cb) => {

      if(!topicDetails.isService) return cb();

      //external section
      checkPartials(topicDetails.partialsMainLocation, topicDetails.shortName, topicDetails.version, topicDetails.baseUri, topicDetails.latest);

      //internal if its needed
      if(topicDetails.isInternalNameExists)
        checkPartials(topicDetails.partialsMainLocationInternal, topicDetails.shortNameInternal, topicDetails.version, topicDetails.baseUriInternal, topicDetails.latest);

      cb();
    });
  });


  it('should replace not latest versions with proper url', (done) => {
    let topicDetails;

    eachRegTopic.async(registry, config, done, (topicDetails, cb) => {

      if (topicDetails.isService) {
        if (!topicDetails.latest) {
          testHelper.validateObjVersion(topicDetails.topicSrcLocation, `@partial("${topicDetails.shortName}_url`, `@partial("${topicDetails.shortName}_url")`, false);

          if (testHelper.dirCheckSync(topicDetails.topicSrcLocationInternal)){
            testHelper.validateObjVersion(topicDetails.topicSrcLocationInternal, `@partial("${topicDetails.shortName}_url`, `@partial("${topicDetails.shortName}_url")`, false);
          }
        }
        else {
          testHelper.validateObjVersion(topicDetails.topicSrcLocation, `@partial("${topicDetails.shortName}_url`, `@partial("${topicDetails.shortName}_url")`, true);

          if (testHelper.dirCheckSync(topicDetails.topicSrcLocationInternal)){
            testHelper.validateObjVersion(topicDetails.topicSrcLocationInternal, `@partial("${topicDetails.shortName}_url`, `@partial("${topicDetails.shortName}_url")`, true);
          }
        }
      }
      cb();
    });
  });

  after((done) => {
    rimraf(`${config.tempLocation}`, done);
  });
});

function checkPartials(partialLocation, shortName, version, baseUri, latest) {

  const fileName = nameCreator.createPartialName(shortName, 'url', version, latest, 'html');
  const filePath = `${fileName}`;
  const path = `${partialLocation}/${filePath}`;

  const isExists = testHelper.fileCheckSync(path);
  const isContentValid = testHelper.checkFileContentSync(path, baseUri);

  expect(isExists).to.equal(true);
  expect(isContentValid).to.equal(true);
}
