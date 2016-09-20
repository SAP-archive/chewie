'use strict';
let config;
const prepareRegistry = require('../../src/integration/prepareRegistry'),
  fs = require('fs'),
  rimraf = require('rimraf'),
  chai = require('chai'),
  testHelper = require('../helpers/testHelper'),
  creator = require('../../src/helpers/creator'),
  expect = chai.expect,
  content = 'already exists';

describe('Get registry remote', () => {

  before((done) => {
    config = require('../chewieConfigTest');
    prepareRegistry(null, config, done);
  });

  it('should have prepare the registy under configured directory and name', () => {

    expect(config.registry.location).to.equal('remote');
    const stats = fs.statSync(config.registry.registryPath);
    expect(stats.isFile()).to.equal(true);
  });

  after((done) => {
    rimraf(`${config.tempLocation}`, done);
  });

});


describe('Get registry local', () => {

  before((done) => {
    config = require('../chewieConfigTestLocal');
    prepareRegistry(null, config, done);
  });

  it('should have prepare the registy under configured directory and name', () => {

    expect(config.registry.location).to.equal('local');
    const stats = fs.statSync(config.registry.registryPath);
    expect(stats.isFile()).to.equal(true);
  });

  after((done) => {
    rimraf(`${config.tempLocation}`, done);
  });

});

//Here we are creting a file with some fixed content. File is name the same as registry file
//prepareRegistry would normally override the file is it would be written in a wrong way
describe('Dont get the registry if it is already in place', () => {

  before((done) => {

    config = require('../chewieConfigTest');
    creator.createFilesSync(config.registry.registryPath, content, 'utf8');
    prepareRegistry(null, config, done);
  });

  it('should have prepare the registy under configured directory and name', () => {

    expect(config.registry.location).to.equal('remote');
    testHelper.checkFileContentSync(config.registry.registryPath, content);
  });

  after((done) => {

    rimraf(`${config.tempLocation}`, done);
  });

});
