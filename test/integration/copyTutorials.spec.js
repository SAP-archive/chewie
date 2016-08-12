'use strict';

const config = require('../chewieConfigTest'),
  cloneDocuSources = require('../../src/integration/cloneDocuSources'),
  prepareRegistry = require('../../src/integration/prepareRegistry'),
  copyTutorials = require('../../src/integration/copyTutorials'),
  fs = require('fs'),
  rimraf = require('rimraf'),
  chai = require('chai'),
  expect = chai.expect,
  gulp = require('gulp'),
  misc = require('../../src/helpers/misc'),
  testHelper = require('../helpers/testHelper'),
  async = require('async');

describe('Coping and versioning interactive tutorials', () => {

  let registry;
  const matrixFileLocation = config.constantLocations.apinotebooksTestMatrixFile;

  let testFile = {};

  before((done) => {

    prepareRegistry(null, config, () => {
      registry = testHelper.getRegistry(config.registry.registryPath);

      cloneDocuSources(registry, config, null, () => {

        copyTutorials(registry, config, () => {

          fs.readFile(matrixFileLocation, 'utf8', (err, data) => {

            testFile = JSON.parse(data);
            done();
          });
        });
      });
    });
  });

  it('should copy to raw/apinotebooks', () => {
    const fileArray = testFile.fileToCopy;
    const isAllExists = checkIfAllExist(fileArray);

    expect(isAllExists).to.equal(true);
  });

  it('should version tutorials', () => {

    const fileArray = testFile.fileToVersion;
    const isAllExists = checkIfAllExist(fileArray);

    expect(isAllExists).to.equal(true);
  });

  it('should replace content with partial', () => {

    const fileArray = testFile.fileToCheckPartial;
    const allReplaced = checkIfAllHaveReplacedContent(fileArray);

    expect(allReplaced).to.equal(true);
  });

  after((done) => {
    rimraf(`${config.tempLocation}`, () => {
      rimraf(`${config.constantLocations.apinotebooksTestMatrixFile}`, () => {
        rimraf(`${config.constantLocations.apinotebooksLocation}`, done);
      });
    });
  });

});


function checkIfAllExist(fileArray) {
  const tutorialsLocation = config.constantLocations.apinotebooksLocation;

  const isAllExists =  fileArray.every((element) => {
    const filePath = `${tutorialsLocation}/${element}.md.eco`;

    try {
      fs.statSync(filePath);
      return true;
    }
    catch(e) {
      return false;
    }
  });
  return isAllExists;
}

function checkIfAllHaveReplacedContent(fileArray) {

  const isAllReplaced =  fileArray.every((element) => {
    const filePath = element;

    try  {
      const data = fs.readFileSync(filePath, 'utf8');
      const partialContent = `<%- @partial('interactiveTutorial', { tutorial:`;

      if(data.indexOf(partialContent) !== -1)
        return true;

      return false;
    }
    catch(e) {
      return false;
    }
  });
  return isAllReplaced;
}
