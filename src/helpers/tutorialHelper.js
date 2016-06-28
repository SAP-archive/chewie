'use strict';

const fs = require('fs'),
  copier = require('./copier'),
  gulp = require('gulp'),
  log = require('./logger'),
  tap = require('gulp-tap'),
  mkmeta = require('marked-metadata'),
  misc = require('./misc'),
  rename = require('gulp-rename'),
  replace = require('gulp-replace'),
  path = require('path'),
  creator = require('./creator');

// Object for testing purposes - its a list of files which we assert in integration tests.
const testObj = {
  fileToCopy: [],
  fileToVersion: [],
  fileToCheckPartial: []
};

/**
 * Function versions apinotebook file.
 * @param {String} [srcPath] - Apinotebook file location
 * @param {String} [id] - Id of apinotebook file
 * @param {String} [newId] - New id of apinotebook file
 * @param {String} [newFileName] - New filename
 * @param {String} [next] - Path to a file where test informations are store
 */

function _versionApinotebookFile(srcPath, id, newId, newFileName, next) {

  const destFolder = path.dirname(srcPath);

  gulp.src(srcPath)
     .pipe(replace(`id: ${id}`, `id: ${newId}`))
     .pipe(rename(newFileName))
     .pipe(gulp.dest(destFolder))
     .pipe(tap(() => {
       fs.unlink(srcPath);
     }))
     .on('error', (err) => {
       log.error(err);
       next();
     })
     .on('end', next);

}


/**
 * Function process apinotebook files. 1) Versioning 2) Coping to dest location 3) Adding partial with interactive tutorial + comment all present content
 * @param {String} [src] - src location to search apinotebook files.
 * @param {String} [dest] - destination directory for apinotebook files
 * @param {String} [nameShort] - Short name of processing service
 * @param {String} [version] - specified version of the service
 * @param {String} [matrixFileLocation] - Path to a file where test informations are stored
 */

function copyAndRenameInteractiveTutorials(src, dest, nameShort, version, matrixFileLocation) {
  const copier = require('./copier');

  return (cb) => {
    gulp.src(src)
      .pipe(tap((file, t) => {
        const filePath = file.path;
        const isHTML = filePath.indexOf('.html') !== -1;
        const isMD = filePath.indexOf('.md') !== -1;

        //check if processed file is md or html - avoid casses where for example img files come in.
        if(isHTML || isMD) {
          let md = {};
          try {
            md = new mkmeta(filePath);
            md = md.metadata();
            if(md.id && md.id.indexOf(`'`) !== -1)
              log.error(`Interactive tutorial ${md.id} will not be generated because of wrong id metadata`);
          }
          catch(e) {
            log.error(e);
            return;
          }

          if(md.interactive && !(md.interactive === 'false')) {

            if(isHTML) {
              log.error(`Interactive tutorial ${md.id} will not be generated because it contains *.html extension!`);
              return fs.unlinkSync(filePath);
            }
            let header = '---\n';
            Object.keys(md).forEach((meta) => {
              header += `${meta}: ${md[meta]}\n`;
            });
            header += '---\n';

            //it means apinotebook was already copied
            if(filePath.indexOf(`_${nameShort}_${version}`) !== -1 || filePath.indexOf(`_${nameShort}`) !== -1) return;

            const fileContent = header + fs.readFileSync(filePath, 'utf8');
            fs.writeFileSync(filePath, fileContent, 'utf8');

            const newId = version ? `${md.id}_${nameShort}_${version}` : `${md.id}_${nameShort}`;

            const newFileName = misc.checkExtension(filePath, '.eco') ? `${newId}.md.eco` : `${newId}.md`;

            const newPath = misc.changeFileName(filePath, newFileName);
            _versionApinotebookFile(filePath, md.id, newId, newFileName, (err) => {
              if(err) throw err;

              copier.copyFiles(newPath, dest, () => {
                _processNotebookFile(newPath, newId);

                testObj.fileToCopy.push(newId);
                testObj.fileToVersion.push(newId);

              });
            });
          }
        }
      }))
      .pipe(gulp.dest('./tmp/trash'))
      .on('end', () => {
        creator.createFile(matrixFileLocation, JSON.stringify(testObj), () => {
          cb();
        });
      });
  };
}


/**
 * Functions process notebook file :
 * a) comment all content except metadata
 * b) add partial with current apinotebook + add .eco extension
 * @param {String} [filePath] - Path to file
 * @param {String} [id] - Id of apinotebook file
 */
function _processNotebookFile(filePath, id) {

  fs.readFile(filePath, (err, data) => {
    if (err) throw err;

    const replaceContent = _prepareTutorialWithPartial(data, id);

    const destinationReplacementPath = misc.checkExtension(filePath, '.eco') ? filePath : `${filePath}.eco`;

    fs.writeFile(destinationReplacementPath, replaceContent, (err) => {

      testObj.fileToCheckPartial.push(destinationReplacementPath);

      if (err) throw err;
      if(filePath !== destinationReplacementPath) fs.unlink(filePath);
    });
  });
}

/**
 * Function comments content inside data(excluding metadata) and adds apinotebook partial with given id
 * @param {String} [data] - Data to process
 * @param {String} [id] - Apinotebook ID
 */
const _prepareTutorialWithPartial = (data, id) => {

  const content = data.toString();

  const endIndex = content.indexOf('---', 1) + 3;
  const contentToCommentStartIndex = content.indexOf('---', 4);
  const contentToCommentEndIndex = content.length;

  const metaData = content.substring(0, endIndex);
  const contentToComment = content.substring(contentToCommentStartIndex, contentToCommentEndIndex);

  const finalContent = `${metaData} \n<%- @partial('interactiveTutorial', { tutorial: '${id}' })  %> <!-- ${contentToComment} -->`;

  return finalContent;
};

const tutorialHelper = {
  copyAndRenameInteractiveTutorials
};

module.exports = tutorialHelper;
