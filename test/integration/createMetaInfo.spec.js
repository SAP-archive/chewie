'use strict';
const config = require('../chewieConfigTest'),
  cloneDocuSources = require('../../src/integration/cloneDocuSources'),
  prepareRegistry = require('../../src/integration/prepareRegistry'),
  createMetaInfo = require('../../src/integration/createMetaInfo'),
  metaBuild = require('../../src/helpers/metaBuild'),
  fs = require('fs'),
  rimraf = require('rimraf'),
  chai = require('chai'),
  expect = chai.expect,
  async = require('async'),
  misc = require('../../src/helpers/misc'),
  testHelper = require('../helpers/testHelper'),
  eachRegTopic = require('../../src/helpers/registryIterator');

//use local config
testHelper.makeRegistryLocal();

describe('Create meta inf files for whole registry', () => {

  let registry;

  before((done) => {

    prepareRegistry(null, config, () => {
      registry = require(`${config.registry.testRegistryPath}`);

      async.series([
        misc.asyncTaskCreator(cloneDocuSources, [registry, config]),
        misc.asyncTaskCreator(createMetaInfo, [registry, null, config])
      ], done);
    });
  });

  it('should have generate meta-inf files with proper content for topics that are present in the prevous out repo', (done) => {

    checkMetaFiles(registry, done);
  });

  after((done) => {
    rimraf(`${config.tempLocation}`, done);
  });

});

describe('Create meta inf files for topics and registry', () => {

  let registry;

  before((done) => {

    prepareRegistry([{'type':'overview', 'name':'Tupac Ipsum'}, {'type':'services', 'name':'Samuel L Ipsum'}], config, () => {
      registry = require(`${config.registry.testRegistryPath}`);

      async.series([
        misc.asyncTaskCreator(cloneDocuSources, [registry, config]),
        misc.asyncTaskCreator(createMetaInfo, [registry, [{'type':'overview', 'name':'Tupac Ipsum'}, {'type':'services', 'name':'Samuel L Ipsum'}], config])
      ], done);

    });
  });

  it('should have generate meta-inf files with proper content for topics that are present in the prevous out repo and also specified topics', (done) => {

    checkMetaFiles(registry, done);

  });

  after((done) => {
    rimraf(`${config.tempLocation}`, done);
  });

});

//check if meta files are present if out location existed
function checkMetaFiles(registry, done) {

  let stats,
    metaFileName,
    metaFileContentPresent,
    metaFileContentPresentInternal,
    metaFileContentExpected,
    lastDest,
    lastDestInternal,
    topicDetails;

  eachRegTopic.async(registry, config, done, (topicDetails, cb) => {

    metaFileName = config.docu.metaFileName;
    metaFileContentExpected = metaBuild.build(topicDetails);
    lastDest = topicDetails.clonedGenDestLocation;
    lastDestInternal = topicDetails.clonedGenDestLocationInternal;

    if (testHelper.dirCheckSync(lastDest)){
      const isExternalExpectedContent = testHelper.checkFileContentSync(`${topicDetails.topicSrcLocation}/${metaFileName}`, metaFileContentExpected);

      expect(isExternalExpectedContent).to.equal(true);
    }

    if (testHelper.dirCheckSync(lastDestInternal)){
      const isInternalExpectedContent = testHelper.checkFileContentSync(`${topicDetails.topicSrcLocationInternal}/${metaFileName}`, metaFileContentExpected);

      expect(isInternalExpectedContent).to.equal(true);
    }
    cb();
  });
}
