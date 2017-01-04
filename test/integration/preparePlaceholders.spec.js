'use strict';
const config = require('../chewieConfigTest'),
  cloneDocuSources = require('../../src/integration/cloneDocuSources'),
  prepareRegistry = require('../../src/integration/prepareRegistry'),
  preparePlaceholders = require('../../src/integration/preparePlaceholders'),
  createMetaInfo = require('../../src/integration/createMetaInfo'),
  copyContent = require('../../src/integration/copyContent'),
  rewriteRAML = require('../../src/integration/rewriteRAML'),
  fs = require('fs'),
  rimraf = require('rimraf'),
  chai = require('chai'),
  expect = chai.expect,
  misc = require('../../src/helpers/misc'),
  eachRegTopic = require('../../src/helpers/registryIterator'),
  testHelper = require('../helpers/testHelper'),
  async = require('async');

describe('Do not move placeholders to not existing locations', () => {

  let registry;
  const topicsIndependent = {'type':'services', 'name':'Samuel L Ipsum'};

  before((done) => {

    prepareRegistry([topicsIndependent], config, () => {
      registry = testHelper.getRegistry(config.registry.shortRegistryPath);

      async.series([
        misc.asyncTaskCreator(cloneDocuSources, [registry, config, null]),
        misc.asyncTaskCreator(rewriteRAML, [registry, config, false]),
        misc.asyncTaskCreator(createMetaInfo, [registry, [topicsIndependent], config]),
        misc.asyncTaskCreator(preparePlaceholders, [registry, config]),
        misc.asyncTaskCreator(copyContent, [registry, config])
      ], done);
    });
  });

  it('should not move placeholers to not existing locations', (done) => {

    let indexPlaceholderName,
      apiConsolePlaceholderName,
      releaseNotesPlaceholderName,
      placeholder,
      placeholderInternal,
      topicDetails,
      isPHNeeded,
      isPHNeededInternal,
      docuSrcLocation,
      docuSrcLocationInternal,
      rnBaseLocation,
      rnBaseLocationInternal,
      layoutPH;

    eachRegTopic.async(registry, config, done, (topicDetails, cb) => {

      docuSrcLocation = topicDetails.topicSrcLocation;
      docuSrcLocationInternal = topicDetails.topicSrcLocationInternal;
      rnBaseLocation = topicDetails.rnBaseLocation;
      rnBaseLocationInternal = topicDetails.rnBaseLocationInternal;
      indexPlaceholderName = 'index.html.eco';
      apiConsolePlaceholderName = 'apiconsole.html.eco';
      releaseNotesPlaceholderName = 'release_notes.html.eco';
      isPHNeeded = misc.dirCheckSync(docuSrcLocation);
      isPHNeededInternal = misc.dirCheckSync(docuSrcLocationInternal);

      const topicExists = topicDetails.name === topicsIndependent.name;

      if (isPHNeeded){
        const indexExists = testHelper.fileCheckSync(`${docuSrcLocation}/${indexPlaceholderName}`);
        expect(indexExists).to.equal(topicExists);

        const apiConsoleExists = testHelper.fileCheckSync(`${docuSrcLocation}/${apiConsolePlaceholderName}`);
        expect(apiConsoleExists).to.equal(topicExists);

        const releaseNotesExists = testHelper.fileCheckSync(`${rnBaseLocation}/${releaseNotesPlaceholderName}`);
        expect(releaseNotesExists).to.equal(topicExists);
      }
      if (isPHNeededInternal){
        const indexExistsInternal = testHelper.fileCheckSync(`${docuSrcLocationInternal}/${indexPlaceholderName}`);
        expect(indexExistsInternal).to.equal(topicExists);

        const apiConsoleExistsInternal = testHelper.fileCheckSync(`${docuSrcLocationInternal}/${apiConsolePlaceholderName}`);
        expect(apiConsoleExistsInternal).to.equal(topicExists);

        const releaseNotesExistsInternal = testHelper.fileCheckSync(`${rnBaseLocationInternal}/${releaseNotesPlaceholderName}`);
        expect(releaseNotesExistsInternal).to.equal(topicExists);
      }
      cb();
    });
  });

  after((done) => {
    rimraf(`${config.tempLocation}`, done);
  });

});
