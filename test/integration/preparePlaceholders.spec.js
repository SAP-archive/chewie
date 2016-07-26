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

describe('Move placeholders to a proper locations and on the move perform search&replace operation', () => {

  let registry;

  before((done) => {

    prepareRegistry(null, config, () => {
      registry = JSON.parse(fs.readFileSync(`${config.registry.registryPath}`, 'utf8'));

      async.series([
        misc.asyncTaskCreator(cloneDocuSources, [registry, config]),
        misc.asyncTaskCreator(createMetaInfo, [registry, null, config]),
        misc.asyncTaskCreator(preparePlaceholders, [registry, config]),
        misc.asyncTaskCreator(copyContent, [registry, config])
      ], done);
    });
  });

  it('should have move placeholers and contain one replaced text', (done) => {

    let phFileName,
      placeholder,
      placeholderInternal,
      topicDetails,
      isPHNeeded,
      isPHNeededInternal,
      docuSrcLocation,
      docuSrcLocationInternal,
      layoutPH;

    eachRegTopic.async(registry, config, done, (topicDetails, cb) => {

      docuSrcLocation = topicDetails.topicSrcLocation;
      docuSrcLocationInternal = topicDetails.topicSrcLocationInternal;
      phFileName = 'index.html.eco';
      isPHNeeded = testHelper.dirCheckSync(docuSrcLocation);
      isPHNeededInternal = testHelper.dirCheckSync(docuSrcLocationInternal);

      if (isPHNeeded){
        placeholder = fs.readFileSync(`${docuSrcLocation}/${phFileName}`, 'utf-8');
        expect(placeholder.indexOf(topicDetails.name)).to.not.equal(-1);
      }

      if (isPHNeededInternal){
        placeholderInternal = fs.readFileSync(`${docuSrcLocationInternal}/${phFileName}`, 'utf-8');
        expect(placeholderInternal.indexOf(topicDetails.name)).to.not.equal(-1);
      }
      cb();
    });
  });

  after((done) => {
    rimraf(`${config.tempLocation}`, done);
  });

});

describe('Do not move placeholders to not existing locations', () => {

  let registry;
  const topicsIndependent = {'type':'services', 'name':'Samuel L Ipsum'};

  before((done) => {

    prepareRegistry([topicsIndependent], config, () => {
      registry = JSON.parse(fs.readFileSync(`${config.registry.shortRegistryPath}`, 'utf8'));

      async.series([
        misc.asyncTaskCreator(cloneDocuSources, [registry, config]),
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
      isPHNeeded = testHelper.dirCheckSync(docuSrcLocation);
      isPHNeededInternal = testHelper.dirCheckSync(docuSrcLocationInternal);

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
