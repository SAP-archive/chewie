'use strict';
const config = require('../gulpConfigTest'),
  prepareRegistry = require('../../src/integration/prepareRegistry'),
  fs = require('fs'),
  rimraf = require('rimraf'),
  chai = require('chai'),
  testHelper = require('../helpers/testHelper'),
  expect = chai.expect;


describe('Get registry remote', () => {

  before((done) => {
    testHelper.makeRegistryRemote();
    prepareRegistry(null, config, done);
  });

  it('should have prepare the registy under configured directory and name', () => {
    const stats = fs.statSync(config.registry.registryPath);

    expect(stats.isFile()).to.equal(true);
  });

  after((done) => {
    rimraf(`${config.tempLocation}`, done);
  });

});


describe('Get registry local', () => {

  before((done) => {
    testHelper.makeRegistryLocal();
    prepareRegistry(null, config, done);
  });

  it('should have prepare the registy under configured directory and name', () => {

    const stats = fs.statSync(config.registry.registryPath);
    expect(stats.isFile()).to.equal(true);
  });

  after((done) => {
    rimraf(`${config.tempLocation}`, done);
  });

});
