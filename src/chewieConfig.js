const config = {

  tempLocation: './tmp',
  skeletonDestination: './src',
  skeletonOutDestination: './out',
  placeholdersLocation: './placeholders',
  docuUrl: process.env.docuURL || 'https://devportal.yaas.io',
  notClonedRepositoriesFile: 'notClonedRepositories.json',
  indepenedentDocuRepositoriesFile: 'indepenedentDocuRepositories',
  docuProvider: process.env.docuProvider || 'S3',

  registry: {
    location: process.env.REGISTRY_LOCATION || 'remote',
    path: process.env.REGISTRY_PATH || 'https://github.com/YaaS/chewie-sample-data.git',
    fileName: 'docu_registry.json',
    branch: 'master',
    shortVersionFileName: 'shrinkedRegistry.json',
    clonedRegistryFolder: 'registry'
  },

  docu: {
    clonedRepoFolder: 'docuSources',
    srcRepoDocuFolder: 'docu',
    metaFileName: 'meta-inf',
    folders: {
      mainDocu: 'files',
      getStart: 'gettingstarted',
      releaseNotes: 'release_notes',
      contentReuse: 'partials'
    }
  },

  generationResult: {
    srcLocation: process.env.generationResultLocation || 'ssh://git@stash.hybris.com:7999/wookiee/devportal_out.git',
    branch: process.env.docuBranch || 'dev',
    cloneLocation: 'latestResultRepo',
    s3: {
      bucket: process.env.S3_BUCKET,
      credentials: {
        accessKeyId: process.env.AWS_ID,
        secretAccessKey: process.env.AWS_SECRET,
        region: process.env.AWS_REGION
      }
    }
  },
  
  constantLocations: {
    apinotebooksLocation: './src/raw/apinotebooks',
    apinotebooksOutLocation: './out/apinotebooks',
    apinotebooksTestMatrixFile: './src/raw/matrix/apinotebook.txt'
  }
};

const out = config.skeletonOutDestination;

config.minification = {
  js: {
    src: [`${out}/scripts/opt-in-features.js`,
      `${out}/scripts/app/lscache.js`,
      `${out}/scripts/globalnomodal.js`,
      `${out}/scripts/modernizr-2.6.2.min.js`,
      `${out}/scripts/offcanvas.js`,
      `${out}/scripts/backtop.js`,
      `${out}/scripts/sequence_nav.js`,
      `${out}/scripts/apiref.js`,
      `${out}/scripts/scrollspy.js`,
      `${out}/scripts/remember_location.js`,
      `${out}/scripts/ZeroClipboard-min.js`,
      `${out}/scripts/expand-collapse.js`,
      `${out}/scripts/search-bar.js`,
      `${out}/scripts/code-block.js`,
      `${out}/scripts/api-filter.js`,
      `${out}/scripts/api-console.js`,
      `${out}/scripts/simplePagination.js`,
      `${out}/scripts/blog.js`,
      `${out}/scripts/img-click-modal.js`,
      `${out}/scripts/yaas-sso-min.js`,
      `${out}/scripts/delete_partial.js`],
    dest: `${out}/scripts/`,
    name: 'devportal-yaas.min.js'
  },
  css: {
    src: [`${out}/styles/main.css`, `${out}/styles/components/globalnomodal.css`],
    dest: `${out}/styles/`,
    name: 'devportal-yaas.css',
    opts: {benchmark:true, noAdvanced:false}
  },
  html: {
    src: [`${out}/**/*.html`, `!${out}/error/error.html`],
    dest: `${out}/`,
    opts: {spare:true, conditionals:true, empty:true}
  },
  img: {
    src: `${out}/**/*`,
    dest: `${out}/`,
    opts: { optimizationLevel: 5, progressive: true, interlaced: true }
  },
  json: {
    src: [`${out}/**/*.json`],
    dest: `${out}/`
  }
};

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
config.skeletonSrcDestination = `${config.skeletonDestination}/documents`;

module.exports = config;
