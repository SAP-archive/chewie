const del = require('del'),
  log = require('../helpers/logger');

function removeClonedRepositories(force, config, cb) {
  if(!force) return cb();

  del(`./${config.tempLocation}`).then(() => {
    log.warning(`Deleted ${config.tempLocation} location, forced new generation`);
    cb();
  });
}

module.exports = removeClonedRepositories;
