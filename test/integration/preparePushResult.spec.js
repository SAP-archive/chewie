'use strict';
const preparePushResult = require('../../src/integration/preparePushResult'),
  prepareRegistry = require('../../src/integration/prepareRegistry'),
  cloneDocuSources = require('../../src/integration/cloneDocuSources'),
  createMetaInfo = require('../../src/integration/createMetaInfo'),
  preparePlaceholders = require('../../src/integration/preparePlaceholders'),
  testHelper = require('../helpers/testHelper'),
  chai = require('chai'),
  expect = chai.expect,
  eachRegTopic = require('../../src/helpers/registryIterator'),
  misc = require('../../src/helpers/misc'),
  async = require('async');

//use local config
testHelper.makeRegistryLocalWithOneFailingRepo();

const config = require('../chewieConfigTest');

describe('Test preparePushResult task', () => {

  let registry;

  before((done) => {
    prepareRegistry(null, config, () => {
      registry = require(`${config.registry.testRegistryPath}`);

      const opt = {
        'src': `${config.skeletonOutDestination}/**`,
        'dest': config.generationResult.clonedResultFolderPath,
        'branch': config.generationResult.branch,
        'message': 'Push operation for the whole Dev Portal',
        'independent': false,
        'notUsedFiles': config.independentGeneration.notUsedFiles,
        'tempLocation': config.tempLocation
      };



      //use local config
      testHelper.makeRegistryLocalWithOneFailingRepo();
      cloneDocuSources(registry, config, () => {

        //use remote config
        testHelper.makeRegistryRemote();
        createMetaInfo(registry, null, config, () => {

        });
      });


      // async.series([
      //   misc.asyncTaskCreator(cloneDocuSources, [registry, config]),
      //   misc.asyncTaskCreator(preparePlaceholders, [registry, config]),
      //   misc.asyncTaskCreator(createMetaInfo, [registry, null, config]),
      //   misc.asyncTaskCreator(preparePushResult, [opt])
      // ], done);

    });
  });

  it('Bla bla', (done) => {
    let topicDetails;

    eachRegTopic.async(registry, config, done, (topicDetails, cb) => {

      console.log(topicDetails.name);

      cb();
    });
  });


  // after((done) => {
  //   rimraf(`${config.tempLocation}`, done);
  // });

});
