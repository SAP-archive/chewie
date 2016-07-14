'use strict';

// integration
const prepareRegistry = require('./src/integration/prepareRegistry'),
  cloneDocuSources = require('./src/integration/cloneDocuSources'),
  createMetaInfo = require('./src/integration/createMetaInfo'),
  preparePlaceholders = require('./src/integration/preparePlaceholders'),
  rewriteRAML = require('./src/integration/rewriteRAML'),
  prepareApiReferences = require('./src/integration/prepareApiReferences'),
  createRAMLPartials = require('./src/integration/createRAMLPartials'),
  copyContent = require('./src/integration/copyContent'),
  createUrlPartials = require('./src/integration/createUrlPartials'),
  serviceLatestCreate = require('./src/integration/serviceLatestCreate'),
  preparePushResult = require('./src/integration/preparePushResult'),
  pushResult = require('./src/integration/pushResult'),
  copyTutorials = require('./src/integration/copyTutorials'),
  replaceApiReferences = require('./src/integration/replaceApiReferences'),
  removeClonedRepositories = require('./src/integration/removeClonedRepositories');


// helpers
const cloner = require('./src/helpers/cloner'),
  concater = require('./src/helpers/concater'),
  copier = require('./src/helpers/copier'),
  creator = require('./src/helpers/creator'),
  logger = require('./src/helpers/logger'),
  metaBuild = require('./src/helpers/metaBuild'),
  minifier = require('./src/helpers/minifier'),
  misc = require('./src/helpers/misc'),
  modifyGlossary = require('./src/helpers/modifyGlossary'),
  nameCreator = require('./src/helpers/nameCreator'),
  reader = require('./src/helpers/reader'),
  registryIterator = require('./src/helpers/registryIterator'),
  replacer = require('./src/helpers/replacer'),
  topicPropsBuilder = require('./src/helpers/topicPropsBuilder'),
  tutorialHelper = require('./src/helpers/tutorialHelper'),
  validator = require('./src/helpers/validator'),
  ziper = require('./src/helpers/ziper'),
  testHelper = require('./test/helpers/testHelper'),
  ramlParser = require('./src/helpers/ramlParser');

// clean
const cleanSkeleton = require('./src/clean/cleanSkeleton');

// minification
const minify = require('./src/minification/minify');



const chewie = {
  replaceApiReferences,
  prepareRegistry,
  cloneDocuSources,
  createMetaInfo,
  preparePlaceholders,
  rewriteRAML,
  removeClonedRepositories,
  prepareApiReferences,
  createRAMLPartials,
  copyContent,
  createUrlPartials,
  serviceLatestCreate,
  preparePushResult,
  pushResult,
  copyTutorials,
  cloner,
  concater,
  copier,
  creator,
  logger,
  metaBuild,
  minifier,
  misc,
  modifyGlossary,
  nameCreator,
  ramlParser,
  reader,
  registryIterator,
  replacer,
  topicPropsBuilder,
  tutorialHelper,
  validator,
  ziper,
  testHelper,
  cleanSkeleton,
  minify
};

module.exports = chewie;
