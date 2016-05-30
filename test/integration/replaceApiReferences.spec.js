'use strict';
const config = require('../gulpConfigTest'),
  cloneDocuSources = require('../../src/integration/cloneDocuSources'),
  replaceApiReferences = require('../../src/integration/replaceApiReferences'),
  preparePlaceholders = require('../../src/integration/preparePlaceholders'),
  rewriteRAML = require('../../src/integration/rewriteRAML'),
  prepareApiReferences = require('../../src/integration/prepareApiReferences'),
  copyContent = require('../../src/integration/copyContent'),
  prepareRegistry = require('../../src/integration/prepareRegistry'),
  topicPropsBuilder = require('../../src/helpers/topicPropsBuilder'),
  log = require('../../src/helpers/logger'),
  fs = require('fs'),
  rimraf = require('rimraf'),
  chai = require('chai'),
  expect = chai.expect,
  misc = require('../../src/helpers/misc'),
  eachRegTopic = require('../../src/helpers/registryIterator'),
  testHelper = require('../helpers/testHelper'),
  async = require('async');

describe('Run replaceApiReferences task', () => {

  let registry;

  const task = '<li><a href="index.html#ApiReference" id="parent_api_ref_nav">API Reference <span class="left-nav__icon hyicon hyicon-chevron u-hide-permanently"></span> <img class="left-nav__play-button svg u-hide-permanently" src="/images/icons/ico_interactive.svg" width="26" height="26" alt=""></a></li>';

  before((done) => {
    prepareRegistry(null, config, () => {
      registry = require(`${config.registry.testRegistryPath}`);

      async.series([
        misc.asyncTaskCreator(cloneDocuSources, [registry, config]),
        misc.asyncTaskCreator(rewriteRAML, [registry, config, false]),
        misc.asyncTaskCreator(preparePlaceholders, [registry, config]),
        misc.asyncTaskCreator(copyContent, [registry, config]),
        misc.asyncTaskCreator(prepareApiReferences, [registry, config]),
        misc.asyncTaskCreator(replaceApiReferences, [registry, config])
      ], done);

    });
  });

  it (`it should replace rightReferencePlaceholder with: ${task}`, (done) => {
    let topicDetails;

    eachRegTopic.async(registry, config, done, (topicDetails, cb) => {

      if (topicDetails.isService){
        if(topicDetails.latest){
          const indexFile = fs.readFileSync(`${topicDetails.genBasicDocuLocation}/latest/index.html.eco`, 'utf-8');
          const check = (indexFile.indexOf(task) >= 0);

          expect(check).to.equal(true);

          if (testHelper.dirCheckSync(topicDetails.topicSrcLocationInternal)){
            const indexFileInternal = fs.readFileSync(`${topicDetails.genBasicDocuLocationInternal}/latest/index.html.eco`, 'utf-8');
            const checkInternal = (indexFileInternal.indexOf(task) >= 0);

            expect(checkInternal).to.equal(true);
          }
        }
        else {
          const indexFile = fs.readFileSync(`${topicDetails.genBasicDocuLocation}/${topicDetails.version}/index.html.eco`, 'utf-8');
          const check = (indexFile.indexOf(task) >= 0);

          expect(check).to.equal(true);

          if (testHelper.dirCheckSync(topicDetails.topicSrcLocationInternal)){
            const indexFileInternal = fs.readFileSync(`${topicDetails.genBasicDocuLocationInternal}/${topicDetails.version}/index.html.eco`, 'utf-8');
            const checkInternal = (indexFileInternal.indexOf(task) >= 0);

            expect(checkInternal).to.equal(true);
          }
        }
      }
      cb();
    });
  });

  it (`it should replace mainReferencePlaceholder with the content of apireferenceTempContent.html file`, (done) => {
    let topicDetails;

    eachRegTopic.async(registry, config, done, (topicDetails, cb) => {

      if (topicDetails.isService){
        if(topicDetails.latest){
          if (testHelper.dirCheckSync(topicDetails.topicSrcLocation)){

            let contentOfApiRef = fs.readFileSync(topicDetails.apiReferenceSource, 'utf-8');
            contentOfApiRef = _createContent(contentOfApiRef);


            const indexFile = fs.readFileSync(`${topicDetails.genBasicDocuLocation}/latest/index.html.eco`, 'utf-8');
            const check = (indexFile.indexOf(contentOfApiRef) >= 0);
            expect(check).to.equal(true);
          }

          if (testHelper.dirCheckSync(topicDetails.topicSrcLocationInternal)){
            let contentOfApiRefInternal = fs.readFileSync(topicDetails.apiReferenceSource, 'utf-8');
            contentOfApiRefInternal = _createContent(contentOfApiRefInternal);

            const indexFileInternal = fs.readFileSync(`${topicDetails.genBasicDocuLocationInternal}/latest/index.html.eco`, 'utf-8');
            const checkInternal = (indexFileInternal.indexOf(contentOfApiRefInternal) >= 0);

            expect(checkInternal).to.equal(true);

          }
        }
        else{
          if (testHelper.dirCheckSync(topicDetails.topicSrcLocation)){
            let contentOfApiRef = fs.readFileSync(topicDetails.apiReferenceSource, 'utf-8');
            contentOfApiRef = _createContent(contentOfApiRef);

            const indexFile = fs.readFileSync(`${topicDetails.genBasicDocuLocation}/${topicDetails.version}/index.html.eco`, 'utf-8');
            const check = (indexFile.indexOf(contentOfApiRef) >= 0);
            expect(check).to.equal(true);
          }

          if (testHelper.dirCheckSync(topicDetails.topicSrcLocationInternal)){
            let contentOfApiRefInternal = fs.readFileSync(topicDetails.apiReferenceSource, 'utf-8');
            contentOfApiRefInternal = _createContent(contentOfApiRefInternal);

            const indexFileInternal = fs.readFileSync(`${topicDetails.genBasicDocuLocationInternal}/${topicDetails.version}/index.html.eco`, 'utf-8');
            const checkInternal = (indexFileInternal.indexOf(contentOfApiRefInternal) >= 0);

            expect(checkInternal).to.equal(true);

          }
        }
      }
      cb();
    });
  });

  after((done) => {
    rimraf(`${config.tempLocation}`, done);
  });

});

function _createContent(data) {
  return `<section id="ApiReference" class="group">\n<h2>API Reference</h2>\n<p>\n${data}\n</p>\n</section>\n<hr>`;
}