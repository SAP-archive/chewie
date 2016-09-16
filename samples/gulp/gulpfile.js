/* eslint camelcase: 0 */
'use strict';

const gulp = require('gulp'),
  chewie = require('chewie'),
  validation = require('./gulp_tasks/deployment/validationMetadata.js'),
  argv = require('yargs')
  .alias('s', 'section')
  .alias('t', 'topics')
  .alias('l', 'local')
  .alias('r', 'rewriter')
  .alias('b', 'browser')
  .alias('p', 'platform')
  .alias('a', 'sauce')
  .alias('y', 'type')
  .alias('f', 'force')
  .argv,
  log = require('./node_modules/chewie/src/helpers/logger'),
  unzip = require('gulp-unzip'),
  download = require('gulp-download'),
  async = require('async'),
  path = require('path'),
  INTERACTIVE_DOCU_SRC_LOC = 'https://devportal.yaas.io/build.zip';


const LOCAL_REGISTRY_PATH = '../sample_data';


const localValue = argv.local;

if (localValue) {
  const isEmpty = localValue && localValue === true; //true means that flag is available but no content was provided - use default

  const pathToRegistry = isEmpty ? LOCAL_REGISTRY_PATH : localValue;

  process.env.REGISTRY_PATH = path.resolve(__dirname, pathToRegistry);

  process.env.REGISTRY_LOCATION = 'local';
}

const config = require('./chewieConfig');
const topics = _getTopics(argv.topics);

gulp.task('start', (cb) => {


  chewie.removeClonedRepositories(argv.force, config, () => {

    let registry;

    //If you use remote registry, you want to pass the name of the branch in the remote repo, for example you can run task with: '-b dev'
    chewie.prepareRegistry(topics, config, () => {

      const fullRegistry = require(config.registry.registryPath);

      topics ? registry = require(`${config.tempLocation}/${config.registry.shortVersionFileName}`) : registry = fullRegistry;

      //stop processing if there is no registry
      if (!registry) {
        throw new Error('Registry is not provided');
      }

      async.series({
        cloneDocuSources: asyncCb(chewie.cloneDocuSources, registry, config, topics),
        rewriteRAML: asyncCb(chewie.rewriteRAML, registry, config, argv.r),
        copyTutorials: asyncCb(chewie.copyTutorials, registry, config),
        preparePlaceholders: asyncCb(chewie.preparePlaceholders, registry, config),
        createMetaInfo: asyncCb(chewie.createMetaInfo, fullRegistry, topics, config),
        prepareApiReferences: asyncCb(chewie.prepareApiReferences, registry, config),
        createUrlPartials: asyncCb(chewie.createUrlPartials, registry, config),
        createRAMLPartials: asyncCb(chewie.createRAMLPartials, registry, config),
        copyContent: asyncCb(chewie.copyContent, fullRegistry, config)
      }, cb);
    });
  });


  function asyncCb() {
    const args = (arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments)); //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/arguments
    const func = args[0];
    const params = args.slice(1);

    return (cb) => {
      log.info(`Started task: ${func.name}`);
      params.push(() => {
        log.info(`Finished task: ${func.name}`);
        cb();
      });
      func.apply(null, params);
    };
  }
});


gulp.task('replaceApiReferences', (cb) => {
  chewie.prepareRegistry(topics, config, (err) => {

    const registry = require(config.registry.registryPath);
    chewie.replaceApiReferences(registry, config, cb);
  });
});


gulp.task('fixTables', (cb) => {
  chewie.replacer.replaceInFile('./out/**/*.html', '<table>', '<table class="table table-striped techne-table">', './out', cb);
});


gulp.task('serviceLatest', ['fixTables'], (cb) => {
  const registry = require(config.registry.registryPath);
  chewie.serviceLatestCreate(registry, config, cb);
});


gulp.task('minify', ['serviceLatest'], (cb) => {
  chewie.minify(config, cb);
});


// task that is meant to clean every section of portal or just one
//
// removing all sections - NODE_ENV=master gulp clean
// removing one section - NODE_ENV=master gulp clean --section services
//
// mind that rn and partials are not sections anymore, they are deleted per service
gulp.task('clean', (cb) => {

  chewie.prepareRegistry(topics, config, (err) => {

    const registry = require(config.registry.registryPath);
    chewie.cleanSkeleton.clean(registry, config, argv.s && argv.s.toLowerCase(), cb);
  });
});


// task pushes latest results to remote repo that keeps results.
gulp.task('pushResult', (cb) => {
  const topics = _getTopics(argv.topics);
  const opt = {
    'src': `${config.skeletonOutDestination}/**`,
    'dest': config.generationResult.clonedResultFolderPath,
    'branch': config.generationResult.branch,
    'message': Boolean(!argv.topics) ? 'Push operation for the whole Dev Portal' : `Push operation for: ${JSON.stringify(topics)}`,
    'independent': Boolean(argv.topics)
  };

  chewie.pushResult(opt, (err) => {
    if (err) {
      log.error(err);
      return cb();
    }
    log.info('Push operation completed');
    cb();
  });
});

gulp.task('getDependencyInteractiveDocu', (cb) => {

  download(INTERACTIVE_DOCU_SRC_LOC)
    .pipe(unzip())
    .pipe(gulp.dest('./src/raw'))
    .on('end', cb);
});

gulp.task('preparePushResult', (cb) => {
  const topics = _getTopics(argv.topics);
  const opt = {
    'src': `${config.skeletonOutDestination}/**`,
    'dest': config.generationResult.clonedResultFolderPath,
    'branch': config.generationResult.branch,
    'message': Boolean(!argv.topics) ? 'Push operation for the whole Dev Portal' : `Push operation for: ${JSON.stringify(topics)}`,
    'independent': Boolean(argv.topics),
    'tempLocation': config.tempLocation,
    'notClonedRepositoriesFile': config.notClonedRepositoriesFile,
    'indepenedentDocuRepositoriesFile': config.indepenedentDocuRepositoriesFile
  };

  chewie.preparePushResult(opt, (err) => {
    if (err) {
      log.error(err);
      return cb();
    }
    log.info('Prepare pushResult operation completed');
    cb();
  });
});


function _getTopics(topics) {
  if(topics === true){
    throw new Error(`You must provide list of topics split with comma while using --topics flags. For example "'services:Cart','tools':'Builder SDK','services':'Events'"`);
  }
  return topics && topics.split(',').map((topic) => {
    const values = topic.split(':');
    return {
      type: values[0],
      name: values[1]
    };
  });
}



/////////////////////////////////////////
///            TESTS                  ///
/////////////////////////////////////////

gulp.task('test', (cb) => {

  const nightwatch = require('gulp-nightwatch');
  const helper = require('./tests/devportal/helpers/helper');
  const innerConfig = require('./tests/devportal/helpers/variables');
  const jsonTransform = require('gulp-json-transform');
  const os = require('os');

  const enviroment = helper.determineEnviroment(argv.b, argv.p);

  log.info(`Running tests against nightwatch envroment(s): ${enviroment} `, argv.a ? 'Test will be run on Sauce Labs (parameter s is present)' : 'Test will be run on localhost');

  gulp.src('./nightwatch.json')
    .pipe(jsonTransform((data) => {
      data.test_settings.default.launch_url = innerConfig.launchUrl;

      data.src_folders = argv.y ? [`tests/devportal/test-cases/${argv.y}`] : ['tests/devportal/test-cases'];

      data.test_settings.default.selenium_port = argv.a ? 80 : 4450;
      data.test_settings.default.selenium_host = argv.a ? 'ondemand.saucelabs.com' : 'localhost';
      data.selenium.start_process = argv.a ? false : true;

      data.test_settings.default.username = innerConfig.username;
      data.test_settings.default.access_key = innerConfig.accessKey;

      return data;
    }), 4)
    .pipe(gulp.dest('./'))
    .pipe(nightwatch({
      configFile: 'nightwatch.json',
      cliArgs: {
        env: enviroment,
        retries: 3
      }
    }))
    .on('error', cb);
});
