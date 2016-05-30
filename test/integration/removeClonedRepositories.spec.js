'use strict';

const config = require('../gulpConfigTest'),
  cloneDocuSources = require('../../src/integration/cloneDocuSources'),
  prepareRegistry = require('../../src/integration/prepareRegistry'),
  removeOldContent = require('../../src/integration/removeClonedRepositories'),
  async = require('async'),
  fs = require('fs'),
  chai = require('chai'),
  expect = chai.expect,
  misc = require('../../src/helpers/misc'),
  testHelper = require('../helpers/testHelper');

//use local config
testHelper.makeRegistryLocal();

describe('Check if tempLocation directory will be deleted', () => {

  let registry;

  beforeEach((done) => {

    prepareRegistry(null, config, () => {
      registry = require(`${config.registry.testRegistryPath}`);

      async.series([
        misc.asyncTaskCreator(cloneDocuSources, [registry, config])
      ], done);

    });
  });

  it('should remove content with flag force set to true', (done) => {

    fs.lstat(`./${config.tempLocation}`, (err, stats) => {

      expect(err).to.equal(null);

      removeOldContent(true, config, () => {

        fs.lstat(`./${config.tempLocation}`, (err, stats) => {
          expect(err).to.not.equal(null);
          done();
        });

      });
    });
  });

  it('shouldnt remove content with flag force set to false', (done) => {

    fs.lstat(`${config.tempLocation}`, (err, stats) => {

      expect(err).to.equal(null);

      removeOldContent(false, config, () => {

        fs.lstat(`${config.tempLocation}`, (err, stats) => {
          expect(err).to.equal(null);
          done();
        });

      });
    });
  });
});