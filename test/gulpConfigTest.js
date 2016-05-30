const config = {
  tempLocation: './tymczas',
  skeletonDestination: './tymczas',
  skeletonOutDestination: './tymczas/document',
  docuUrl: 'https://devportal.yaas.io',
  test: 'yes',

  registry: {
    location: process.env.REGISTRY_LOCATION || 'remote',
    path: process.env.REGISTRY_PATH || 'git@github.com:hybris/chewie-sample-data.git',
    fileName: 'whatever.json',
    branch: process.env.NODE_ENV || 'prod',
    shortVersionFileName: 'smallwhatever.json',
    clonedRegistryFolder: 'registeros'
  },

  docu: {
    clonedRepoFolder: 'docuSourceros',
    srcRepoDocuFolder: 'docu',
    metaFileName: 'chewbacka',
    folders: {
      mainDocu: 'files',
      getStart: 'gettingstarted',
      releaseNotes: 'release_notes',
      contentReuse: 'partials'
    }
  },

  generationResult: {
    srcLocation: 'git@github.com:hybris/chewie-sample-result.git',
    branch: process.env.NODE_ENV || 'dev',
    cloneLocation: 'latestStarWarsRepo'
  },

  constantLocations: {
    apinotebooksLocation: './src/raw/apinotebooks',
    apinotebooksTestMatrixFile: './src/raw/matrix/apinotebook.txt'
  }
};

const out = `${config.skeletonDestination}/${config.registry.clonedRegistryFolder}/out`;

config.minification = {
  js: [{
    src: [`${out}/scripts/hodoripsum.js`],
    dest: `${out}/minResult`,
    name: 'miniIpsum.min.js'
  },
  {
    src: [`${out}/scripts/batmanipsum.js`],
    dest: `${out}/minResult`,
    opts: { mangle: false }
  }],
  css: [{
    src: [`${out}/styles/zombieipsum.css`, `${out}/styles/hipsteripsum.css`],
    dest: `${out}/minResult`,
    name: 'miniIpsum.css',
    opts: {benchmark:true, noAdvanced:false}
  },
  {
    src: [`${out}/styles/zombieipsum.css`, `${out}/styles/hipsteripsum.css`],
    dest: `${out}/minResult`,
    name: 'miniIpsum2.css',
    opts: {benchmark:true, noAdvanced:false}
  }],
  html: [{
    src: [`${out}/html/baconipsum.html`],
    dest: `${out}/minResult`,
    opts: {spare:true, conditionals:true, empty:true}
  },
  {
    src: [`${out}/html/baconipsum2.html`],
    dest: `${out}/minResult`,
    opts: {spare:true, conditionals:true, empty:true}
  }],
  img: [{
    src: `${out}/img/chewie.png`,
    dest: `${out}/minResult`,
    opts: { optimizationLevel: 5, progressive: true, interlaced: true }
  },
  {
    src: `${out}/img/chewie2.png`,
    dest: `${out}/minResult`,
    opts: { optimizationLevel: 5, progressive: true, interlaced: true }
  }],
  json: [{
    src: [`${out}/json/tupacipsum.json`],
    dest: `${out}/minResult`
  },
  {
    src: [`${out}/json/tupacipsum2.json`],
    dest: `${out}/minResult`
  }]
};

//placeholders location
config.placeholdersLocation = `${config.tempLocation}/${config.registry.clonedRegistryFolder}/placeholders`;

//add attributes to registry
config.registry.registryPath = `${config.tempLocation}/${config.registry.fileName}`;
config.registry.testRegistryPath = `./../../${config.registry.registryPath}`;
config.registry.clonedRegistryFolderPath = `${config.tempLocation}/${config.registry.clonedRegistryFolder}`;
config.registry.shortRegistryPath = `${config.tempLocation}/${config.registry.shortVersionFileName}`;
config.registry.testRegistryShortPath = `./../../${config.registry.shortRegistryPath}`;
config.registry.pathFolderWithClonedRegistry = `${config.tempLocation}/${config.registry.clonedRegistryFolder}/registry`;

//add attributes to docu
config.docu.clonedRepoFolderPath = `${config.tempLocation}/${config.docu.clonedRepoFolder}`;

//add attributes to generationResult
config.generationResult.clonedResultFolderPath = `${config.tempLocation}/${config.generationResult.cloneLocation}`;
config.generationResult.pathFolderWithClonedResult = `${config.generationResult.clonedResultFolderPath}/generatedDevportal`;

//add location with docu files
config.skeletonSrcDestination = `${config.skeletonDestination}/document`;

module.exports = config;