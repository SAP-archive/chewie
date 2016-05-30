'use strict';
const config = require('../chewieConfigTest'),
  cleanSkeleton = require('./../../src/clean/cleanSkeleton'),
  cloneDocuSources = require('../../src/integration/cloneDocuSources'),
  prepareRegistry = require('../../src/integration/prepareRegistry'),
  copyContent = require('../../src/integration/copyContent'),
  eachRegTopic = require('../../src/helpers/registryIterator'),
  reader = require('../../src/helpers/reader'),
  testHelper = require('../helpers/testHelper'),
  async = require('async'),
  chai = require('chai'),
  rimraf = require('rimraf'),
  fs = require('fs'),
  expect = chai.expect;

//use local config
testHelper.makeRegistryLocal();

describe('Cleaner function with specific sections', () => {

  let registry;
  const cleanInfo = [];

  before((done) => {
    prepareRegistry(null, config, () => {
      registry = require(`${config.registry.testRegistryPath}`);
      cloneDocuSources(registry, config, () => {
        copyContent(registry, config, () => {
          eachRegTopic.sync(registry, config, () => cleanSkeleton.clean(registry, config, 'services', done), (topicDetails, cb) => {
            if(topicDetails.type !== 'services') return cb();
            reader.getFilesFromLocations([topicDetails.partialsMainLocation, topicDetails.partialsMainLocationInternal], (err, files) => {
              cleanInfo.push({
                files,
                topicDetails
              });
              cb();
            });
          });
        });
      });
    });
  });

  it('should remove services, their rn and partials', () => {

    cleanInfo.forEach((info) => {
      info.files.forEach((file) => expect(testHelper.fileCheckSync(`${info.topicDetails.partialsDestLocation}/${file}`)).to.equal(false));
      expect(testHelper.dirCheckSync(info.topicDetails.rnDestLocation)).to.equal(false);
      expect(testHelper.dirCheckSync(info.topicDetails.rnDestLocationInternal)).to.equal(false);
      expect(testHelper.dirCheckSync(info.topicDetails.genDocuLocation)).to.equal(false);
      expect(testHelper.dirCheckSync(info.topicDetails.genDocuLocationInternal)).to.equal(false);
      expect(testHelper.dirCheckSync(info.topicDetails.clonedDocuFolderTypes)).to.equal(false);
    });
  });


  after((done) => {
    rimraf(config.tempLocation, done);
  });

});

describe('Cleaner function that is cleaning every section', () => {

  const cleanInfo = [];
  let registry;

  before((done) => {
    prepareRegistry(null, config, () => {
      registry = require(`${config.registry.testRegistryPath}`);
      cloneDocuSources(registry, config, () => {
        copyContent(registry, config, () => {
          eachRegTopic.sync(registry, config, () => cleanSkeleton.clean(registry, config, null, done), (topicDetails, cb) => {
            reader.getFilesFromLocations([topicDetails.partialsMainLocation, topicDetails.partialsMainLocationInternal], (err, files) => {
              cleanInfo.push({
                files,
                topicDetails
              });
              cb();
            });
          });
        });
      });
    });
  });

  it('should remove all documents, rn and partials from every part of portal', () => {
    cleanInfo.forEach((info) => {
      info.files.forEach((file) => expect(testHelper.fileCheckSync(`${info.topicDetails.partialsDestLocation}/${file}`)).to.equal(false));
      expect(testHelper.dirCheckSync(info.topicDetails.rnDestLocation)).to.equal(false);
      expect(testHelper.dirCheckSync(info.topicDetails.rnDestLocationInternal)).to.equal(false);
      expect(testHelper.dirCheckSync(info.topicDetails.genDocuLocation)).to.equal(false);
      expect(testHelper.dirCheckSync(info.topicDetails.genDocuLocationInternal)).to.equal(false);
      expect(testHelper.dirCheckSync(info.topicDetails.clonedDocuFolderTypes)).to.equal(false);
    });
  });

  after((done) => {
    rimraf(config.tempLocation, done);
  });

});
