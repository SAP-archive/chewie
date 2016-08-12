/* eslint camelcase: 0 */

'use strict';
const config = require('../chewieConfigTest'),
  cloneDocuSources = require('../../src/integration/cloneDocuSources'),
  prepareRegistry = require('../../src/integration/prepareRegistry'),
  misc = require('../../src/helpers/misc'),
  fs = require('fs'),
  path = require('path'),
  rimraf = require('rimraf'),
  chai = require('chai'),
  expect = chai.expect,
  testHelper = require('../helpers/testHelper'),
  eachRegTopic = require('../../src/helpers/registryIterator');

describe('Clone all docu topics listed in the registry', () => {

  let registry;

  before((done) => {

    prepareRegistry(null, config, () => {
      registry = testHelper.getRegistry(config.registry.registryPath);

      cloneDocuSources(registry, config, null, done);
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

      registry = testHelper.getRegistry(config.registry.shortRegistryPath);

      cloneDocuSources(registry, config, null, () => {
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

    registry = testHelper.getRegistry(config.registry.shortRegistryPath);

    eachRegTopic.async(registry, config, done, (topicDetails, cb) => {
      stats = fs.statSync(topicDetails.sourcesCloneLoc);
      expect(stats.isDirectory()).to.equal(true);
      cb();
    });
  });

  it('should clone documentation from given location', (done) => {

    //this topic must be present in before clause because we rely that it is copied so we can give path to it - so we don't need to commit some example repo for tests
    const topic = [
      {
        name: 'Builder',
        type: 'overview',
        area: 'Overview',
        source: [
          {
            location: './tymczas/docuSourceros/overview/tupacipsum',
            local: true
          }
        ]
      }
    ];

    cloneDocuSources(topic, config, null, () => {
      eachRegTopic.async(topic, config, done, (topicDetails, cb) => {

        const stats = fs.statSync(path.resolve(process.cwd(), topicDetails.sourcesCloneLoc));
        expect(stats.isDirectory()).to.equal(true);
        cb();
      });
    });
  });

  after((done) => {
    rimraf(`${config.tempLocation}`, done);
  });

});
