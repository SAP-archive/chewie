'use strict';
const config = require('../chewieConfigTest'),
  cloneDocuSources = require('../../src/integration/cloneDocuSources'),
  prepareRegistry = require('../../src/integration/prepareRegistry'),
  copyContent = require('../../src/integration/copyContent'),
  fs = require('fs'),
  rimraf = require('rimraf'),
  chai = require('chai'),
  expect = chai.expect,
  eachRegTopic = require('../../src/helpers/registryIterator'),
  async = require('async'),
  testHelper = require('../helpers/testHelper'),
  misc = require('../../src/helpers/misc');

describe('Copy all docu files for topics listed in the registry', () => {

  let registry;

  before((done) => {

    prepareRegistry(null, config, () => {
      registry = testHelper.getRegistry(config.registry.registryPath);

      async.series([
        misc.asyncTaskCreator(cloneDocuSources, [registry, config, null]),
        misc.asyncTaskCreator(copyContent, [registry, config])
      ], done);

    });
  });

  it('should have copied over docu sources to skeleton', (done) => {

    let stats,
      topicDetails,
      locToArray,
      folder,
      isGetStart;

    eachRegTopic.async(registry, config, done, (topicDetails, cb) => {

      //if there were ext docu files
      if (fs.existsSync(topicDetails.topicSrcLocation)){
        if(topicDetails.type !== 'services') {
          stats = fs.statSync(topicDetails.destLocationWithoutVersion);
          expect(stats.isDirectory()).to.equal(true);
        }
        else {
          stats = fs.statSync(topicDetails.destLocation);
          expect(stats.isDirectory()).to.equal(true);
        }

        // quick check if src has points to gettingstarted and not files folder when needed
        // LGO: I know this should be in a Unit test
        if (topicDetails.isGS){
          locToArray = topicDetails.topicSrcLocation.split('/');
          folder = locToArray[locToArray.length - 2];
          isGetStart = (folder === 'gettingstarted');
          expect(isGetStart).to.equal(true);
        }
      }

      //if there were int docu files
      if (fs.existsSync(topicDetails.topicSrcLocationInternal)){
        if(topicDetails.type !== 'services') {
          stats = fs.statSync(topicDetails.destLocationInternalWithoutVersion);
          expect(stats.isDirectory()).to.equal(true);
        }
        else {
          stats = fs.statSync(topicDetails.destLocationInternal);
          expect(stats.isDirectory()).to.equal(true);
        }

        // quick check if internal destination has a different folder name then the external one
        // LGO: I know this should be in a Unit test
        if (topicDetails.isInternalNameExists){
          expect(topicDetails.destLocationInternal.indexOf(topicDetails.shortNameInternal)).to.not.equal(-1);
        }

      }
      cb();
    });
  });

  after((done) => {
    rimraf(`${config.tempLocation}`, done);
  });

});
