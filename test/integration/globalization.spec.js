'use strict';
const config = require('../chewieConfigTest'),
  cloneDocuSources = require('../../src/integration/cloneDocuSources'),
  replaceApiReferences = require('../../src/integration/replaceApiReferences'),
  preparePlaceholders = require('../../src/integration/preparePlaceholders'),
  rewriteRAML = require('../../src/integration/rewriteRAML'),
  prepareApiReferences = require('../../src/integration/prepareApiReferences'),
  copyContent = require('../../src/integration/copyContent'),
  prepareRegistry = require('../../src/integration/prepareRegistry'),
  serviceLatestCreate = require('../../src/integration/serviceLatestCreate'),
  globalization = require('../../src/integration/globalization'),
  topicPropsBuilder = require('../../src/helpers/topicPropsBuilder'),
  pathCreator = require('../../src/helpers/pathCreator'),
  log = require('../../src/helpers/logger'),
  fs = require('fs'),
  rimraf = require('rimraf'),
  chai = require('chai'),
  expect = chai.expect,
  misc = require('../../src/helpers/misc'),
  eachRegTopic = require('../../src/helpers/registryIterator'),
  testHelper = require('../helpers/testHelper'),
  async = require('async'),
  gulp = require('gulp'),
  tap = require('gulp-tap');

describe('Run globalization task', () => {

  let registry;

  before((done) => {
    prepareRegistry(null, config, () => {
      registry = testHelper.getRegistry(config.registry.registryPath);

      async.series([
        misc.asyncTaskCreator(cloneDocuSources, [registry, config, null]),
        misc.asyncTaskCreator(rewriteRAML, [registry, config, false]),
        misc.asyncTaskCreator(preparePlaceholders, [registry, config]),
        misc.asyncTaskCreator(copyContent, [registry, config]),
        misc.asyncTaskCreator(prepareApiReferences, [registry, config]),
        misc.asyncTaskCreator(replaceApiReferences, [registry, config]),
        misc.asyncTaskCreator(serviceLatestCreate, [registry, config]),
        misc.asyncTaskCreator(globalization, [registry, config, _mapMarketsToRegions])
      ], done);

    });
  });

  it('should copied documents to proper locations', (done) => {

    let stats;

    eachRegTopic.async(registry, config, done, (topicDetails, cb) => {

      const regions = _mapMarketsToRegions(topicDetails.markets);

      if (!regions.length) return cb();

      // should copied docus to proper dirs
      regions.forEach((region) => {
        const createDestinationPath = pathCreator.globalizationDestination(config.skeletonOutDestination, topicDetails, region.code);

        // check copied version dir
        const destinationPath = createDestinationPath(topicDetails.version, false);
        stats = fs.statSync(destinationPath);
        expect(stats.isDirectory()).to.equal(true);

        // check copied latest dir
        const destinationPathLatest = createDestinationPath('latest', false);
        if (topicDetails.latest){
          stats = fs.statSync(destinationPathLatest);
          expect(stats.isDirectory()).to.equal(true);
        }

        const isInternal = fs.existsSync(topicDetails.genDocuLocationInternal);

        // check copied to internal
        const destinationPathInternal = createDestinationPath(topicDetails.version, true);
        if (isInternal){
          stats = fs.statSync(destinationPathInternal);
          expect(stats.isDirectory()).to.equal(true);
        }

        // check copied latest dir to internal
        const destinationPathLatestInternal = createDestinationPath('latest', true);
        if (topicDetails.latest && isInternal){
          stats = fs.statSync(destinationPathLatestInternal);
          expect(stats.isDirectory()).to.equal(true);
        }
      });

      cb();
    });
  });

  it('should replace domain in copied files', (done) => {

    eachRegTopic.async(registry, config, done, (topicDetails, cb) => {

      const regions = _mapMarketsToRegions(topicDetails.markets);

      if (!regions.length) return cb();

      const checkReplaceDomain = [];      
      regions.forEach((region) => {
        if(!region.domain)
          return;

        const createDestinationPath = pathCreator.globalizationDestination(config.skeletonOutDestination, topicDetails, region.code);
        const destinationPath = createDestinationPath(topicDetails.version, false);
        checkReplaceDomain.push(_checkReplaceDomain(destinationPath));
      });

      async.series(checkReplaceDomain, cb);
    });
  });

  after((done) => {
    rimraf(`${config.tempLocation}`, done);
  });

});

function _checkReplaceDomain(destinationPath){
  return function(cb){
    gulp.src(`${destinationPath}/**/*`)
      .pipe(tap((file) => {
        if(!file.contents)
          return;
        const contentFile = String(file.contents);
        const isReplacedDomain = contentFile.indexOf(config.defaultBaseUriDomain) === -1;
        expect(isReplacedDomain).to.equal(true);
      }))
      .on('end', cb);
  };
}

function _mapMarketsToRegions(markets){
  if(!markets.length) return false;
  return markets.map((market) => {
    return {
      code: market,
      domain: market === 'us' ? `${market}.domain` : null
    };
  });
}