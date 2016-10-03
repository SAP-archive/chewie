'use strict';
const misc = require('../helpers/misc'),
  log = require('../helpers/logger'),
  _ = require('underscore');


/**
 * This function creates an object that holds all properties of a topic registered in the registry + the location of docu on filesystem
 * @param {Object} [regEntry] - registry entry object
 * @param {Object} [sourceEntry] - nested source object in the registry object
 * @param {Object} [config] - configuration object with all the basic locations needed for the topic Builder
 * @return {Object} - all topic properties
 */
function topicPropsBuilder(regEntry, sourceEntry, config) {

  //name of the docu topic. Used for example for display in the navigation. Shoud match documents metadata.
  const name = regEntry.name;

  const isInternalNameExists = regEntry.nameInternal ? true : false;

  //internal name can be different the the official one
  const nameInternal = regEntry.nameInternal ? regEntry.nameInternal : name;

  //name all lower case without spaces
  const shortName = misc.trimAdvanced(name);

  //internal name all lower case without spaces
  const shortNameInternal = regEntry.nameInternal ? misc.trimAdvanced(nameInternal) : shortName;

  //author of the docu topic.
  const author = regEntry.author;

  //description of the docu topic.
  const description = regEntry.description;

  //creation date of the docu topic.
  const date = regEntry.date;

  //type of the content
  const type = misc.trimAdvanced(regEntry.type);

  //service version
  const version = sourceEntry.version;

  //markets where service is available
  const markets = sourceEntry.markets;

  //is it a service where version is required or other topic
  const versionPath = version ? `/${version}` : '';

  //if the version of the service is the latest one
  const latest = checkLatest(type, sourceEntry.latest);

  //description of the latest service version
  const latestVersion = latest ? `Latest - ${version}` : '';

  //default location of docu folder in repo is root of the repo, but it can be customized by docu_dir value in the registry
  const docuDir = sourceEntry.docu_dir ? `${sourceEntry.docu_dir}/` : '/';

  const docuUrl = config.docuUrl;

  //service information provided in the builder. Used to build base uri of the service behind proxy
  const builderOrg = regEntry.builder_org;

  //also used for service left navigation
  const builderIdentifier = sourceEntry.builder_identifier;
  const builderIdentifierInternal = sourceEntry.internal_builder_identifier ? sourceEntry.internal_builder_identifier : sourceEntry.builder_identifier;

  //building raml locations
  const raml = sourceEntry.raml;
  const ramlInternal = sourceEntry.ramlInternal || raml;

  //helper for GS
  const leftNavArea = regEntry.left_nav_area ? regEntry.left_nav_area : false;
  const leftNavAreaElement = regEntry.left_nav_area_element ? regEntry.left_nav_area_element : false;

  // helpers for types of register
  const isService = type === 'services';
  const isGS = type === 'gettingstarted';
  const isTools = type === 'tools';
  const hasReleaseNotes = _.contains(config.typesWithReleaseNotes, type);
  const isSrcLocNotMainDocu = _.contains(config.typesSrcLocNotMainDocu, type);

  //cloned src location by topic type
  const clonedDocuFolderTypes = `${config.docu.clonedRepoFolderPath}/${type}`;

  //defining location where to clone sources of repositories listed in the registry
  const sourcesCloneLoc = `${clonedDocuFolderTypes}/${shortName}${versionPath}`;

  const basicLocation = `${clonedDocuFolderTypes}/${shortName}${versionPath}${docuDir}`;

  // docu folder location. Same location for ext and int because repo sources are cloned to folder with main name
  const basicSrcLocation = `${clonedDocuFolderTypes}/${shortName}${versionPath}${docuDir}${config.docu.srcRepoDocuFolder}`;

  //if it is a getting started topic, then the sources location is not files but gettingstarted folder
  const ifGetStart = isSrcLocNotMainDocu ? `${type}/${shortName}` : config.docu.folders.mainDocu;

  //building src and destiny locations for copy operations
  //source links
  const topicSrcLocation = `${basicSrcLocation}/${ifGetStart}`;
  const srcLocation = version ? [`${topicSrcLocation}/**`, '!./**/apireferenceTempContent.html']: [`${topicSrcLocation}/**`];

  const topicSrcLocationInternal = `${basicSrcLocation}/internal/${ifGetStart}`;
  const srcLocationInternal = version ? [`${topicSrcLocationInternal}/**`, '!./**/apireferenceTempContent.html']: [`${topicSrcLocationInternal}/**`];

  //internal and external location used for example at interactive tutorials where //we need not-recursive iteration on directory
  const srcLocFilesPattern = isGS ? '/**/*.*' : '/*.*';
  const srcLocationFiles = version ? [`${topicSrcLocation}${srcLocFilesPattern}`, '!./**/apireferenceTempContent.html']: [`${topicSrcLocation}${srcLocFilesPattern}`];
  const srcLocationFilesInternal = version ? [`${topicSrcLocationInternal}${srcLocFilesPattern}`, '!./**/apireferenceTempContent.html']: [`${topicSrcLocationInternal}${srcLocFilesPattern}`];

  //destination links
  const destLocation = `${config.skeletonSrcDestination}/${type}/${shortName}/latest`;
  const destLocationWithoutVersion = `${config.skeletonSrcDestination}/${type}/${shortName}${versionPath}`;
  const destLocationInternal = `${config.skeletonSrcDestination}/internal/${type}/${shortNameInternal}/latest`;
  const destLocationInternalWithoutVersion = `${config.skeletonSrcDestination}/internal/${type}/${shortNameInternal}${versionPath}`;


  // building src and dest locations for Partials
  const reuse = config.docu.folders.contentReuse;
  const partialsMainLocation = `${basicSrcLocation}/${reuse}`;
  const partialsMainLocationInternal = `${basicSrcLocation}/internal/${reuse}`;

  const partialsRAMLContent = `${docuUrl}/services/${shortName}/${version}/api.raml`;
  const partialsRAMLContentInternal = `${docuUrl}/internal/services/${shortName}/${version}/api.raml`;

  const partialsSrcLocation = [`${partialsMainLocation}/*`];
  const partialsSrcLocationInternal = [`${partialsMainLocationInternal}/*`];
  const partialsDestLocation = `${config.skeletonDestination}/${reuse}`;

  // building src and dest locations for release notes
  const releaseNotes = config.docu.folders.releaseNotes;
  const rnBaseLocation = hasReleaseNotes ? `${basicSrcLocation}/${releaseNotes}` : false;
  const rnSrcLocation = (rnBaseLocation) ? `${rnBaseLocation}/**` : false;
  const rnBaseLocationInternal = hasReleaseNotes ? `${basicSrcLocation}/internal/${releaseNotes}` : false;
  const rnSrcLocationInternal = (rnBaseLocationInternal) ? `${rnBaseLocationInternal}/**` : false;
  const rnDestLocation = hasReleaseNotes ? `${config.skeletonSrcDestination}/rn/${type}/${shortName}/latest` : false;
  const rnDestLocationWithoutVersion = hasReleaseNotes ? `${config.skeletonSrcDestination}/rn/${type}/${shortName}` : false;
  const rnDestLocationInternal = hasReleaseNotes ? `${config.skeletonSrcDestination}/internal/rn/${type}/${shortNameInternal}/latest` : false;
  const rnDestLocationInternalWithoutVersion = hasReleaseNotes ? `${config.skeletonSrcDestination}/internal/rn/${type}/${shortNameInternal}` : false;

  /*
  adding base uri - service proxy url
  */

  if(!sourceEntry.baseUri && !config.defaultBaseUriDomain){
    throw new Error(`BaseURI for service ${name} is not set.
                    Please set baseURI value or provide default in your config file.`);
  }

  const defaultBaseUriDomain = config.defaultBaseUriDomain;

  //defining base uri for external
  const baseUri = sourceEntry.baseUri ? sourceEntry.baseUri : `${defaultBaseUriDomain}/${builderOrg}/${builderIdentifier}/${version}`;

  //defining base uri for internal
  let baseUriInternal;

  if (sourceEntry.internalBaseUri) {
    baseUriInternal = sourceEntry.internalBaseUri;
  }
  else if (sourceEntry.internal_builder_identifier) {
    baseUriInternal = `${defaultBaseUriDomain}/${builderOrg}/${builderIdentifierInternal}/${version}`;
  }
  else {
    baseUriInternal = baseUri;
  }

  /*
  end of adding base uri - service proxy url
  */

  /*
  APIReference creation
  */
  //external APIReference
  const apiReferenceContent = `---\nservice: ${name}\ntitle: API Reference\nlayout: document\n---\nmainReferencePlaceholder`;

  //internal APIReference
  const apiReferenceContentInternal = `---\nservice: ${nameInternal}\ntitle: API Reference\nlayout: document\n---\nmainReferencePlaceholder`;

  //building raml location in source directory
  const apiReferenceSource = `${topicSrcLocation}/apireferenceTempContent.html`;

  //building internal raml location in source directory
  const apiReferenceSourceInternal = `${topicSrcLocationInternal}/apireferenceTempContent.html`;

  //building new APIReference file
  const apiReferenceNewFile = `${topicSrcLocation}/apireference.html`;

  //building new internal APIReference file
  const apiReferenceNewFileInternal = `${topicSrcLocationInternal}/apireference.html`;

  //building generated js client folder
  const clientFolder = `${topicSrcLocation}/client`;

  //building generated js client folder - internal
  const clientFolderInternal = `${topicSrcLocationInternal}/client`;

  /*
  end APIReference creation
  */

  //building cloned generation result location link. Place where result of generation is copied over. It helps to determine if speicfic registered topic contains content
  const clonedGenDestLocation = `${config.generationResult.clonedResultFolderPath}/${type}/${shortName}${versionPath}`;
  const clonedGenDestLocationInternal = `${config.generationResult.clonedResultFolderPath}/internal/${type}/${shortNameInternal}${versionPath}`;

  const clonedGenDestLocationLatest = `${config.generationResult.clonedResultFolderPath}/${type}/${shortName}/latest`;
  const clonedGenDestLocationInternalLatest = `${config.generationResult.clonedResultFolderPath}/internal/${type}/${shortNameInternal}/latest`;

  //same as above but for release notes
  const clonedGenRNDestLocation = hasReleaseNotes ? `${config.generationResult.clonedResultFolderPath}/rn/${type}/${shortName}${versionPath}` : '';
  const clonedGenRNDestLocationInternal = hasReleaseNotes ? `${config.generationResult.clonedResultFolderPath}/internal/rn/${type}/${shortNameInternal}${versionPath}` : '';

  const clonedGenRNDestLocationLatest = hasReleaseNotes ? (isTools ? `${config.generationResult.clonedResultFolderPath}/rn/${type}/${shortName}${versionPath}` : `${config.generationResult.clonedResultFolderPath}/rn/${type}/${shortName}/latest`) : '';

  const clonedGenRNDestLocationInternalLatest = hasReleaseNotes ? (isTools ? `${config.generationResult.clonedResultFolderPath}/internal/rn/${type}/${shortNameInternal}${versionPath}` : `${config.generationResult.clonedResultFolderPath}/internal/rn/${type}/${shortNameInternal}/latest`) : '';

  //building link to a placeholder for specific topic
  const placeholderMainLoc = config.placeholdersLocation;

  //docu
  const placeholderLocation = `${placeholderMainLoc}/${type}/index.*`;

  //release notes
  const placeholderRNLocation = `${placeholderMainLoc}/${releaseNotes}/release_notes.*`;

  //api console
  const placeholderAPIConsoleLocation = `${placeholderMainLoc}/apiconsoles/apiconsole.*`;

  //defining collections names for specific topic
  const collectionName = type;
  const collectionNameInternal = `internal${type.charAt(0).toUpperCase()}${type.slice(1)}`;

  const tutorialsDest = config.constantLocations.apinotebooksLocation;

  //location of docu files after generation
  const versionLatest = latest ? '/latest' : '';
  const generatedDir = config.skeletonOutDestination;
  const genBasicDocuLocation = `${generatedDir}/${type}/${shortName}`;
  const genDocuLocationLatest = `${genBasicDocuLocation}${versionLatest}`;
  const genDocuLocation = `${genBasicDocuLocation}${versionPath}`;
  const genBasicDocuLocationInternal = `${generatedDir}/internal/${type}/${shortNameInternal}`;
  const genDocuLocationLatestInternal = `${genBasicDocuLocationInternal}${versionLatest}`;
  const genDocuLocationInternal = `${genBasicDocuLocationInternal}${versionPath}`;

  //location of release notes after generation
  const genBasicRNLocation = hasReleaseNotes ? `${generatedDir}/rn/${type}/${shortName}` : false;
  const genRNLocationLatest = (genBasicRNLocation) ? `${genBasicRNLocation}${versionLatest}` : false;
  const genRNLocation = (genBasicRNLocation) ? `${genBasicRNLocation}${versionPath}` : false;
  const genBasicRNLocationInternal = hasReleaseNotes ? `${generatedDir}/internal/rn/${type}/${shortNameInternal}` : false;
  const genRNLocationLatestInternal = (genBasicRNLocationInternal) ? `${genBasicRNLocationInternal}${versionLatest}` : false;
  const genRNLocationInternal = (genBasicRNLocationInternal) ? `${genBasicRNLocationInternal}${versionPath}` : false;
  const matrixFileLocation = config.constantLocations.apinotebooksTestMatrixFile;

  //additional metadatas
  const tags = regEntry.tags;
  const category = regEntry.category;
  const packages = regEntry.packages;

  //for local directories
  const local = sourceEntry.local === true || sourceEntry.local === 'true';


  const topicDetails = {
    packages,
    tags,
    category,
    name,
    service : name,
    nameInternal,
    shortName,
    shortNameInternal,
    author,
    description,
    date,
    type,
    docuUrl,
    version,
    latest,
    latestVersion,
    markets,
    docuDir,
    baseUri,
    baseUriInternal,
    builderIdentifier,
    builderIdentifierInternal,
    raml,
    ramlInternal,
    leftNavArea,
    leftNavAreaElement,
    sourcesCloneLoc,
    basicLocation,
    topicSrcLocation,
    topicSrcLocationInternal,
    srcLocation,
    srcLocationInternal,
    srcLocationFiles,
    srcLocationFilesInternal,
    destLocation,
    destLocationWithoutVersion,
    destLocationInternal,
    destLocationInternalWithoutVersion,
    clonedGenDestLocation,
    clonedGenDestLocationInternal,
    clonedGenDestLocationLatest,
    clonedGenDestLocationInternalLatest,
    clonedGenRNDestLocation,
    clonedGenRNDestLocationInternal,
    clonedGenRNDestLocationLatest,
    clonedGenRNDestLocationInternalLatest,
    placeholderLocation,
    placeholderRNLocation,
    placeholderAPIConsoleLocation,
    collectionName,
    collectionNameInternal,
    partialsSrcLocation,
    partialsSrcLocationInternal,
    partialsMainLocation,
    partialsMainLocationInternal,
    partialsRAMLContent,
    partialsRAMLContentInternal,
    partialsDestLocation,
    rnBaseLocation,
    rnBaseLocationInternal,
    rnSrcLocation,
    rnSrcLocationInternal,
    rnDestLocation,
    rnDestLocationInternal,
    rnDestLocationWithoutVersion,
    rnDestLocationInternalWithoutVersion,
    genBasicRNLocation,
    genRNLocation,
    genBasicRNLocationInternal,
    genRNLocationInternal,
    genBasicDocuLocation,
    genDocuLocation,
    genBasicDocuLocationInternal,
    genDocuLocationInternal,
    genDocuLocationLatest,
    genDocuLocationLatestInternal,
    genRNLocationLatest,
    genRNLocationLatestInternal,
    area : regEntry.area,
    location : sourceEntry.location,
    branchTag : sourceEntry.branch_or_tag,
    tutorialsDest,
    matrixFileLocation,
    apiReferenceContent,
    apiReferenceContentInternal,
    apiReferenceSource,
    apiReferenceSourceInternal,
    apiReferenceNewFile,
    apiReferenceNewFileInternal,
    clientFolder,
    clientFolderInternal,
    clonedDocuFolderTypes,
    isInternalNameExists,
    isService,
    isGS,
    isTools,
    hasReleaseNotes,
    isSrcLocNotMainDocu,
    local
  };

  return topicDetails;

}

function checkLatest(type, latest){

  let isLatest;

  switch (type) {

  case 'services':
    isLatest = (latest);
    break;

  default:
    isLatest = 'true';
  }

  return isLatest;
}

module.exports = topicPropsBuilder;
