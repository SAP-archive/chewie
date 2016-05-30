'use strict';
const config = require('../gulpConfigTest'),
  cloneDocuSources = require('../../src/integration/cloneDocuSources'),
  prepareRegistry = require('../../src/integration/prepareRegistry'),
  misc = require('../../src/helpers/misc'),
  fs = require('fs'),
  rimraf = require('rimraf'),
  chai = require('chai'),
  expect = chai.expect,
  testHelper = require('../helpers/testHelper'),
  eachRegTopic = require('../../src/helpers/registryIterator');

//use local config
testHelper.makeRegistryLocal();

describe('Clone all docu topics listed in the registry', () => {

  let registry;

  before((done) => {

    prepareRegistry(null, config, () => {
      registry = require(`${config.registry.testRegistryPath}`);

      cloneDocuSources(registry, config, done);
    });
  });

  it('should have created a folder for cloned repos', () => {

    const stats = fs.statSync(`${config.docu.clonedRepoFolderPath}`);
    expect(stats.isDirectory()).to.equal(true);
  });

  it('should have all the topics listed in registry cloned locally', (done) => {

    let stats,
      topicDetails;

    eachRegTopic.async(registry, config, done, (topicDetails, cb) => {

      stats = fs.statSync(topicDetails.sourcesCloneLoc);
      expect(stats.isDirectory()).to.equal(true);
      cb();

    });
  });

  after((done) => {

    rimraf(`${config.tempLocation}`, (err) => {
      if(err) return done(err);
      done();
    });
  });

});

describe('Clone all docu topics listed specified in the topic array', () => {

  let registry;

  before((done) => {

    prepareRegistry([{'type':'overview', 'name':'Tupac Ipsum'}, {'type':'services', 'name':'Samuel L Ipsum'}], config, () => {

      registry = require(`${config.registry.testRegistryShortPath}`);

      cloneDocuSources(registry, config, () => {
        done();
      });
    });
  });


  it('should have created a folder for listed topics cloned repos', () => {

    const stats = fs.statSync(`${config.docu.clonedRepoFolderPath}`);
    expect(stats.isDirectory()).to.equal(true);
  });

  it('should have all the topics listed in registry cloned locally', (done) => {

    let stats,
      topicDetails;

    registry = require(`${config.registry.testRegistryShortPath}`);

    eachRegTopic.async(registry, config, done, (topicDetails, cb) => {
      stats = fs.statSync(topicDetails.sourcesCloneLoc);
      expect(stats.isDirectory()).to.equal(true);
      cb();
    });
  });

  after((done) => {
    rimraf(`${config.tempLocation}`, done);
  });

});