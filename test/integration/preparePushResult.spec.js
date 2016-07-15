'use strict';
const preparePushResult = require('../../src/integration/preparePushResult'),
  prepareRegistry = require('../../src/integration/prepareRegistry'),
  cloneDocuSources = require('../../src/integration/cloneDocuSources'),
  createMetaInfo = require('../../src/integration/createMetaInfo'),
  preparePlaceholders = require('../../src/integration/preparePlaceholders'),
  cloner = require('../../src/helpers/cloner'),
  testHelper = require('../helpers/testHelper'),
  chai = require('chai'),
  expect = chai.expect,
  eachRegTopic = require('../../src/helpers/registryIterator'),
  misc = require('../../src/helpers/misc'),
  rimraf = require('rimraf'),
  path = require('path'),
  async = require('async');

//use local config
testHelper.makeRegistryLocalWithOneFailingRepo();

const config = require('../chewieConfigTest');

describe('Check if backup works for full generation', () => {

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

      cloneDocuSources(registry, config, () => {
        testHelper.makeRegistryRemote();  //use remote config
        preparePlaceholders(registry, config, () => {
          createMetaInfo(registry, null, config, () => {
            cloner.cloneRepo(config.generationResult.srcLocation, 'preparePushResultTest', './out', () => {
              preparePushResult(opt, done);
            });
          });
        });
      });
    });
  });


  /**
   * Check if notClonedRepositories file was created and contains content (cloneDocuSources -> _createMatrixWithNotClonedRepositories)
   */
  it('It should create notClonedRepositories.json file', (done) => {

    const contentOfNotClonedRepositoriesFile = './tymczas/latestStarWarsRepo/rn/services/failingipsum/v1,./tymczas/latestStarWarsRepo/internal/rn/services/failingipsum/v1,./tymczas/latestStarWarsRepo/services/failingipsum/v1,./tymczas/latestStarWarsRepo/internal/services/failingipsum/v1';

    const notClonedRepositoriesFile = testHelper.checkFileContentSync(`${config.tempLocation}/notClonedRepositories.json`, contentOfNotClonedRepositoriesFile);

    expect(notClonedRepositoriesFile).to.equal(true);
    done();
  });


  /**
   * Check if backup operation has been performed (preparePushResult -> backupOfNotClonedRepositories)
   */
  it('It should create backup folder', (done) => {
    _checkFileOrDir(false, `${config.tempLocation}/backup`, true);
    done();
  });

  it('FailingIpsum service folder should be in the backup folder', (done) => {
    _checkFileOrDir(false, `${config.tempLocation}/backup/${config.tempLocation}/${config.generationResult.cloneLocation}/services/failingipsum`, true);
    done();
  });

  it('FailingIpsum service folder should have some content', (done) => {
    _checkFileOrDir(true, `${config.tempLocation}/backup/${config.tempLocation}/${config.generationResult.cloneLocation}/services/failingipsum/v1/index.html.eco`, true);
    done();
  });


  /**
   * Check if deletePreviouslyClonedResultsRepo operation has been performed (preparePushResult -> deletePreviouslyClonedResultsRepo)
   */
  it('DeleteIpsum service folder should be deleted', (done) => {
    _checkFileOrDir(true, `${config.tempLocation}/${config.generationResult.cloneLocation}/services/deleteipsum`, false);
    done();
  });


  /**
   * Check if copyFilesAsync operation has been performed (preparePushResult -> copier.copyFilesAsync)
   */
  it(`AdditionalIpsum service folder should be copied to ${config.generationResult.cloneLocation} folder`, (done) => {
    _checkFileOrDir(false, `${config.tempLocation}/${config.generationResult.cloneLocation}/services/additionalipsum`, true);
    done();
  });

  it('AdditionalIpsum service folder should have some content', (done) => {
    _checkFileOrDir(true, `${config.tempLocation}/${config.generationResult.cloneLocation}/services/additionalipsum/v1/index.html.eco`, true);
    done();
  });


  /**
   * Check if restoreBackupOfNotClonedRepositories operation has been performed (preparePushResult -> deletePreviouslyClonedResultsRepo)
   */
  it('FailingIpsum service folder should be restored', (done) => {
    _checkFileOrDir(false, `${config.tempLocation}/${config.generationResult.cloneLocation}/services/failingipsum`, true);
    done();
  });

  it('FailingIpsum service folder should have some content', (done) => {
    _checkFileOrDir(true, `${config.tempLocation}/${config.generationResult.cloneLocation}/services/failingipsum/v1/index.html.eco`, true);
    done();
  });


  after((done) => {
    rimraf(config.tempLocation, () => {
      rimraf(config.skeletonOutDestination, done);
    });
  });

});

function _checkFileOrDir(isFile, pathToBeChecked, expectedResult){
  const fileOrDir = isFile ? testHelper.fileCheckSync(path.resolve(pathToBeChecked)) : testHelper.dirCheckSync(path.resolve(pathToBeChecked));

  expect(fileOrDir).to.equal(expectedResult);
}
