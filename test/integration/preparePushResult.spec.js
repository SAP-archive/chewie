'use strict';
const config = require('../chewieConfigTestLocal'),
  preparePushResult = require('../../src/integration/preparePushResult'),
  prepareRegistry = require('../../src/integration/prepareRegistry'),
  cloneDocuSources = require('../../src/integration/cloneDocuSources'),
  createMetaInfo = require('../../src/integration/createMetaInfo'),
  preparePlaceholders = require('../../src/integration/preparePlaceholders'),
  cloner = require('../../src/helpers/cloner'),
  testHelper = require('../helpers/testHelper'),
  misc = require('../../src/helpers/misc'),
  chai = require('chai'),
  expect = chai.expect,
  rimraf = require('rimraf'),
  path = require('path'),
  fs = require('fs');


describe('Check if backup works for full generation', () => {

  let registry;

  before((done) => {
    prepareRegistry(null, config, () => {

      registry = testHelper.getRegistry(config.registry.registryPath);

      const opt = {
        'src': `${config.skeletonOutDestination}/**`,
        'latestDocu': config.generationResult.srcLocation,
        'dest': config.generationResult.clonedResultFolderPath,
        'branch': config.generationResult.branch,
        'repo': config.generationResult.clonedResultFolderPath,
        'message': 'Push operation for the whole Dev Portal',
        'independent': false,
        'tempLocation': config.tempLocation,
        'notClonedRepositoriesFile': config.notClonedRepositoriesFile,
        'indepenedentDocuRepositoriesFile': config.indepenedentDocuRepositoriesFile,
        'apinotebooksOutLocation': config.constantLocations.apinotebooksOutLocation
      };

      cloneDocuSources(registry, config, null, () => {
        preparePlaceholders(registry, config, () => {
          createMetaInfo(registry, null, config, () => {
            cloner.cloneRepo(config.generationResult.srcLocation, 'preparePushResultTest', './out', () => {
              preparePushResult(config, opt, done);
            });
          });
        });
      });
    });
  });


  /**
   * Check if notClonedRepositories file was created and contains content (cloneDocuSources -> _createMatrixWithRepositories)
   */
  it('It should create proper notClonedRepositories.json file', () => {

    //no try/catch here because if file doesn't exist we want to know
    const templateOfNotClonedRepositoriesFile = fs.readFileSync('./test/helpers/notClonedRepositoriesTemplate.json', 'utf-8');
    const contentOfNotClonedRepositoriesFile = fs.readFileSync(`${config.tempLocation}/notClonedRepositories.json`, 'utf-8');

    //string -> parse -> stringify, so we can be sure there are no differences in a way file was saved (extra tabs, spaces)
    expect(JSON.stringify(JSON.parse(templateOfNotClonedRepositoriesFile)) === JSON.stringify(JSON.parse(contentOfNotClonedRepositoriesFile))).to.equal(true);

  });


  /**
   * Check if backup operation has been performed (preparePushResult -> backupOfNotClonedRepositories)
   */
  it('It should create backup folder', () => {
    _checkFileOrDir(false, `${config.tempLocation}/backup`, true);
  });

  it('FailingIpsum service folder should be in the backup folder', () => {
    _checkFileOrDir(false, `${config.tempLocation}/backup/${config.tempLocation}/${config.generationResult.cloneLocation}/services/failingipsum`, true);
  });

  it('FailingIpsum service folder should have some content', () => {
    _checkFileOrDir(true, `${config.tempLocation}/backup/${config.tempLocation}/${config.generationResult.cloneLocation}/services/failingipsum/v1/index.html.eco`, true);
  });


  /**
   * Check if deletePreviouslyClonedResultsRepo operation has been performed (preparePushResult -> deletePreviouslyClonedResultsRepo)
   */
  it('DeleteIpsum service folder should be deleted', () => {
    _checkFileOrDir(true, `${config.tempLocation}/${config.generationResult.cloneLocation}/services/deleteipsum`, false);
  });


  /**
   * Check if copyFilesAsync operation has been performed (preparePushResult -> copier.copyFilesAsync)
   */
  it(`AdditionalIpsum service folder should be copied to ${config.generationResult.cloneLocation} folder`, () => {
    _checkFileOrDir(false, `${config.tempLocation}/${config.generationResult.cloneLocation}/services/additionalipsum`, true);
  });

  it('AdditionalIpsum service folder should have some content', () => {
    _checkFileOrDir(true, `${config.tempLocation}/${config.generationResult.cloneLocation}/services/additionalipsum/v1/index.html.eco`, true);
  });


  /**
   * Check if restoreBackupOfNotClonedRepositories operation has been performed (preparePushResult -> deletePreviouslyClonedResultsRepo)
   */
  it('FailingIpsum service folder should be restored', () => {
    _checkFileOrDir(false, `${config.tempLocation}/${config.generationResult.cloneLocation}/services/failingipsum`, true);
  });

  it('FailingIpsum service folder should have some content', () => {
    _checkFileOrDir(true, `${config.tempLocation}/${config.generationResult.cloneLocation}/services/failingipsum/v1/index.html.eco`, true);
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
        'latestDocu': config.generationResult.srcLocation,
        'dest': config.generationResult.clonedResultFolderPath,
        'branch': config.generationResult.branch,
        'repo': config.generationResult.clonedResultFolderPath,
        'message': 'services:Failing Ipsum,services:Samuel L Ipsum',
        'independent': true,
        'tempLocation': config.tempLocation,
        'notClonedRepositoriesFile': config.notClonedRepositoriesFile,
        'indepenedentDocuRepositoriesFile': config.indepenedentDocuRepositoriesFile,
        'apinotebooksOutLocation': config.constantLocations.apinotebooksOutLocation
      };

      cloneDocuSources(registry, config, true, () => {
        preparePlaceholders(registry, config, () => {
          createMetaInfo(registry, [{'type':'services', 'name':'Samuel L Ipsum'}, {'type':'services', 'name':'Failing Ipsum'}], config, () => {
            cloner.cloneRepo(config.generationResult.srcLocation, 'preparePushResultTest', './out', () => {
              preparePushResult(config, opt, done);
            });
          });
        });
      });
    });
  });


  /**
   * Check if notClonedRepositories file was created and contains content (cloneDocuSources -> _createMatrixWithRepositories)
   */
  it('It should create notClonedRepositories.json file', () => {
    _checkFileOrDir(true, `${config.tempLocation}/notClonedRepositories.json`, true);
  });


  /**
   * Check if indepenedentDocuRepositories file was created and contains content (cloneDocuSources -> _createMatrixWithRepositories)
   */

  it('It should create indepenedentDocuRepositories.json file', () => {
    _checkFileOrDir(true, `${config.tempLocation}/indepenedentDocuRepositories.json`, true);
  });


  /**
   * Check if deletePreviouslyClonedResultsRepo operation has been performed (preparePushResult -> deletePreviouslyClonedResultsRepo)
   */
  it('DeleteIpsum service folder should not be deleted', () => {
    _checkFileOrDir(false, `${config.tempLocation}/${config.generationResult.cloneLocation}/services/deleteipsum`, true);
  });

  it('It should replace services/inde.html file', () => {
    _checkFileOrDir(true, `${config.tempLocation}/${config.generationResult.cloneLocation}/services/index.html`, true);
  });

  it('Content of services/index.html file should be updated', () => {
    const newFileContent = 'Success! This file was overwritten during independent generation!';

    const servicesIndexFile = testHelper.checkFileContentSync(`${config.tempLocation}/${config.generationResult.cloneLocation}/services/index.html`, newFileContent);

    expect(servicesIndexFile).to.equal(true);
  });


  /**
   * Check if copyFilesAsync operation has been performed (preparePushResult -> copier.copyFilesAsync)
   */
  it(`AdditionalIpsum service folder should be copied to ${config.generationResult.cloneLocation} folder`, () => {
    _checkFileOrDir(false, `${config.tempLocation}/${config.generationResult.cloneLocation}/services/additionalipsum`, true);
  });

  it('AdditionalIpsum service folder should have some content', () => {
    _checkFileOrDir(true, `${config.tempLocation}/${config.generationResult.cloneLocation}/services/additionalipsum/v1/index.html.eco`, true);
  });


  /**
   * Check if restoreBackupOfNotClonedRepositories operation has been performed (preparePushResult -> deletePreviouslyClonedResultsRepo)
   */
  it('FailingIpsum service folder should be restored', () => {
    _checkFileOrDir(false, `${config.tempLocation}/${config.generationResult.cloneLocation}/services/failingipsum`, true);
  });

  it('FailingIpsum service folder should have some content', () => {
    _checkFileOrDir(true, `${config.tempLocation}/${config.generationResult.cloneLocation}/services/failingipsum/v1/index.html.eco`, true);
  });

  /**
   * Check if copyApiNotebooksToLatestResultRepos operation has been performed (preparePushResult -> copyApiNotebooksToLatestResultRepos)
   */
  it('APINotebooks folder contains a new apinotebook: SampleApiNotebook2.md', () => {
    _checkFileOrDir(true, `${config.tempLocation}/${config.generationResult.cloneLocation}/apinotebooks/SampleApiNotebook2.md`, true);
  });

  it('APINotebooks file: SampleApiNotebook.md should be overwritten', () => {
    const contentThatShouldBeReplaced = 'Test did not work!';

    const sampleApiNotebookFile = testHelper.checkFileContentSync(`${config.tempLocation}/${config.generationResult.cloneLocation}/apinotebooks/SampleApiNotebook.md`, contentThatShouldBeReplaced);

    expect(sampleApiNotebookFile).to.equal(false);
  });


  after((done) => {
    rimraf(config.tempLocation, () => {
      rimraf(config.skeletonOutDestination, done);
    });
  });

});


function _checkFileOrDir(isFile, pathToBeChecked, expectedResult){
  const fileOrDir = isFile ? testHelper.fileCheckSync(path.resolve(pathToBeChecked)) : misc.dirCheckSync(path.resolve(pathToBeChecked));

  expect(fileOrDir).to.equal(expectedResult);
}
