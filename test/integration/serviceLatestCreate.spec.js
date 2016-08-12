'use strict';
const config = require('../chewieConfigTest'),
  cloneDocuSources = require('../../src/integration/cloneDocuSources'),
  prepareRegistry = require('../../src/integration/prepareRegistry'),
  serviceLatestCreate = require('../../src/integration/serviceLatestCreate'),
  copyContent = require('../../src/integration/copyContent'),
  fs = require('fs'),
  rimraf = require('rimraf'),
  chai = require('chai'),
  expect = chai.expect,
  misc = require('../../src/helpers/misc'),
  eachRegTopic = require('../../src/helpers/registryIterator'),
  testHelper = require('../helpers/testHelper'),
  async = require('async');

describe('Copy all services docu files and its release notes from location with version to location "latest"', () => {

  let registry;

  before((done) => {
    prepareRegistry(null, config, () => {
      registry = testHelper.getRegistry(config.registry.registryPath);

      async.series([
        misc.asyncTaskCreator(cloneDocuSources, [registry, config, null]),
        misc.asyncTaskCreator(copyContent, [registry, config]),
        misc.asyncTaskCreator(serviceLatestCreate, [registry, config])
      ], done);

    });
  });

  it('should have copied over docu sources and release notes to different location', (done) => {

    let stats,
      topicDetails,
      locToArray,
      folder,
      isGetStart;

    eachRegTopic.async(registry, config, done, (topicDetails, cb) => {

      if (!topicDetails.latest || !topicDetails.type !== 'services') return cb();


      //if there were ext docu files
      if (fs.existsSync(topicDetails.genDocuLocation)){
        stats = fs.statSync(topicDetails.genDocuLocationLatest);
        expect(stats.isDirectory()).to.equal(true);
      }

      //if there were int docu files
      if (fs.existsSync(topicDetails.genDocuLocationInternal)){
        stats = fs.statSync(topicDetails.genDocuLocationLatestInternal);
        expect(stats.isDirectory()).to.equal(true);
      }

      //if there were ext release notes files
      if (fs.existsSync(topicDetails.genRNLocation)){
        stats = fs.statSync(topicDetails.genRNLocationLatest);
        expect(stats.isDirectory()).to.equal(true);
      }

      //if there were int release notes files
      if (fs.existsSync(topicDetails.genRNLocationInternal)){
        stats = fs.statSync(topicDetails.genRNLocationLatestInternal);
        expect(stats.isDirectory()).to.equal(true);
      }
      cb();
    });
  });

  after((done) => {
    rimraf(`${config.tempLocation}`, done);
  });

});
