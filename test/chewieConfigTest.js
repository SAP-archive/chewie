const config = {
  tempLocation: './tymczas',
  skeletonDestination: './tymczas',
  skeletonOutDestination: './tymczas/document',
  placeholdersLocation: './placeholders',
  docuUrl: 'https://devportal.yaas.io',
  test: 'yes',


  registry: {
    location: process.env.REGISTRY_LOCATION || 'remote',
    path: process.env.REGISTRY_PATH || 'https://github.com/hybris/chewie-sample-data.git',
    fileName: 'whatever.json',
    branch: 'master',
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
    srcLocation: 'https://github.com/hybris/chewie-sample-result.git',
    branch: 'master',
    cloneLocation: 'latestStarWarsRepo'
  },

  constantLocations: {
    apinotebooksLocation: './src/raw/apinotebooks',
    apinotebooksTestMatrixFile: './src/raw/matrix/apinotebook.txt'
  },

  typesSrcLocNotMainDocu: [
    'gettingstarted',
    'overview',
    'solutions',
    'architecture',
    'docu_guide'
  ],

  typesWithReleaseNotes: [
    'tools',
    'services'
  ],

  defaultBaseUriDomain: 'localhost'
};

config.independentGeneration = {
  notUsedFiles: [`${out}/atom.xml`,
                `${out}/rn/index.html`,
                `${out}/internal/rn/index.html`,
                `${out}/matrix/apinotebook.txt`,
                `${out}/lunr`,
                `${out}/internal/rn/internal_atom.xml`,
                `!${out}/.git`]
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
    name: 'miniIpsum.css'
  },
  {
    src: [`${out}/styles/zombieipsum.css`, `${out}/styles/hipsteripsum.css`],
    dest: `${out}/minResult`,
    name: 'miniIpsum2.css'
  }],
  html: [{
    src: [`${out}/html/baconipsum.html`],
    dest: `${out}/minResult`,
    opts: {collapseWhitespace: true}
  },
  {
    src: [`${out}/html/baconipsum2.html`],
    dest: `${out}/minResult`,
    opts: {collapseWhitespace: true}
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
config.registry.clonedRegistryFolderPath = `${config.tempLocation}/${config.registry.clonedRegistryFolder}`;
config.registry.shortRegistryPath = `${config.tempLocation}/${config.registry.shortVersionFileName}`;
config.registry.pathFolderWithClonedRegistry = `${config.tempLocation}/${config.registry.clonedRegistryFolder}/registry`;

//add attributes to docu
config.docu.clonedRepoFolderPath = `${config.tempLocation}/${config.docu.clonedRepoFolder}`;

//add attributes to generationResult
config.generationResult.clonedResultFolderPath = `${config.tempLocation}/${config.generationResult.cloneLocation}`;

//add location with docu files
config.skeletonSrcDestination = `${config.skeletonDestination}/document`;

module.exports = config;
