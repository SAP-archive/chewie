'use strict';
const config = require('../chewieConfigTestLocal'),
  preparePushResult = require('../../src/integration/preparePushResult'),
  prepareRegistry = require('../../src/integration/prepareRegistry'),
  cloneDocuSources = require('../../src/integration/cloneDocuSources'),
  createMetaInfo = require('../../src/integration/createMetaInfo'),
  preparePlaceholders = require('../../src/integration/preparePlaceholders'),
  cloner = require('../../src/helpers/cloner'),
  testHelper = require('../helpers/testHelper'),
  chai = require('chai'),
  expect = chai.expect,
  rimraf = require('rimraf'),
  path = require('path');


describe('Check if backup works for full generation', () => {

  let registry;

  before((done) => {
    prepareRegistry(null, config, () => {

      registry = testHelper.getRegistry(config.registry.registryPath);

      const opt = {
        'src': `${config.skeletonOutDestination}/**`,
        'dest': config.generationResult.clonedResultFolderPath,
        'branch': config.generationResult.branch,
        'message': 'Push operation for the whole Dev Portal',
        'independent': false,
        'tempLocation': config.tempLocation
      };

      cloneDocuSources(registry, config, null, () => {
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
   * Check if notClonedRepositories file was created and contains content (cloneDocuSources -> _createMatrixWithRepositories)
   */
  it('It should create notClonedRepositories.json file', (done) => {
    const contentOfNotClonedRepositoriesFile = './tymczas/latestStarWarsRepo/rn/services/failingipsum/v1,./tymczas/latestStarWarsRepo/internal/rn/services/failingipsum/v1,./tymczas/latestStarWarsRepo/services/failingipsum/v1,./tymczas/latestStarWarsRepo/internal/services/failingipsum/v1,./tymczas/latestStarWarsRepo/rn/services/failingipsum/latest,./tymczas/latestStarWarsRepo/internal/rn/services/failingipsum/latest,./tymczas/latestStarWarsRepo/services/failingipsum/latest,./tymczas/latestStarWarsRepo/internal/services/failingipsum/latest';

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
    rimraf(`${config.tempLocation}`, () => {
      rimraf(config.skeletonOutDestination, done);
    });
  });

});


describe('Check if backup works for independent document generation', () => {

  let registry;

  before((done) => {
    prepareRegistry([{'type':'services', 'name':'Failing Ipsum'}, {'type':'services', 'name':'Samuel L Ipsum'}], config, () => {

      registry = testHelper.getRegistry(config.registry.shortRegistryPath);

      const opt = {
        'src': `${config.skeletonOutDestination}/**`,
        'dest': config.generationResult.clonedResultFolderPath,
        'branch': config.generationResult.branch,
        'message': 'Push operation for the whole Dev Portal',
        'independent': true,
        'tempLocation': config.tempLocation
      };

      cloneDocuSources(registry, config, true, () => {
        preparePlaceholders(registry, config, () => {
          createMetaInfo(registry, [{'type':'services', 'name':'Samuel L Ipsum'}, {'type':'services', 'name':'Failing Ipsum'}], config, () => {
            cloner.cloneRepo(config.generationResult.srcLocation, 'preparePushResultTest', './out', () => {
              preparePushResult(opt, done);
            });
          });
        });
      });
    });
  });


  /**
   * Check if notClonedRepositories file was created and contains content (cloneDocuSources -> _createMatrixWithRepositories)
   */
  it('It should create notClonedRepositories.json file', (done) => {
    _checkFileOrDir(true, `${config.tempLocation}/notClonedRepositories.json`, true);
    done();
  });


  /**
   * Check if indepenedentDocuRepositories file was created and contains content (cloneDocuSources -> _createMatrixWithRepositories)
   */

  it('It should create indepenedentDocuRepositories.json file', (done) => {
    _checkFileOrDir(true, `${config.tempLocation}/indepenedentDocuRepositories.json`, true);
    done();
  });


  /**
   * Check if deletePreviouslyClonedResultsRepo operation has been performed (preparePushResult -> deletePreviouslyClonedResultsRepo)
   */
  it('DeleteIpsum service folder should not be deleted', (done) => {
    _checkFileOrDir(false, `${config.tempLocation}/${config.generationResult.cloneLocation}/services/deleteipsum`, true);
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
