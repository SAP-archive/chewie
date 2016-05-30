'use strict';
const config = require('../chewieConfigTest'),
  minify = require('../../src/minification/minify'),
  cloneDocuSources = require('../../src/integration/cloneDocuSources'),
  prepareRegistry = require('../../src/integration/prepareRegistry'),
  fs = require('fs'),
  util = require('util'),
  rimraf = require('rimraf'),
  chai = require('chai'),
  testHelper = require('../helpers/testHelper'),
  expect = chai.expect;

describe('Minify js, css, html and img', () => {

  before((done) => {
    prepareRegistry(null, config, () => {
      minify(config, done);
    });
  });

  it('should have minified js into one file', () => {

    const js = config.minification.js;

    let jsMinContentExpected = '!function(){console.log("Hodor hodor Hodor")}();';
    let isContentEqual = testHelper.checkFileContentSync(`${js[0].dest}/${js[0].name}`, jsMinContentExpected);

    expect(isContentEqual).to.equal(true);

    jsMinContentExpected = '!function(weapon){console.log("Batman uses: "),console.log(weapon)}();';
    isContentEqual = testHelper.checkFileContentSync(`${js[1].dest}/batmanipsum.js`, jsMinContentExpected);

    expect(isContentEqual).to.equal(true);

  });


  it('should have minified css into one file', () => {

    const css = config.minification.css,
      cssMinContentExpected = '.zombieStyle{display:block;position:fixed;top:100px;font-family:Curier}\n.hipsterStyle{display:none;position:fixed;right:10px;bottom:100px;font-family:Dosis;z-index:1000}';
    let isContentEqual;

    css.forEach((el) => {
      isContentEqual = testHelper.checkFileContentSync(`${el.dest}/${el.name}`, cssMinContentExpected);
      expect(isContentEqual).to.equal(true);
    });



  });

  it('should have minified html files', () => {

    const html = config.minification.html,
      htmlMinContentExpected = '<div><p>Bacon ipsum dolor amet meatball cupim pork chop venison filet mignon</p></div>';

    let isContentEqual = testHelper.checkFileContentSync(`${html[0].dest}/baconipsum.html`, htmlMinContentExpected);
    expect(isContentEqual).to.equal(true);

    isContentEqual = testHelper.checkFileContentSync(`${html[1].dest}/baconipsum2.html`, htmlMinContentExpected);
    expect(isContentEqual).to.equal(true);

  });

  it('should have minified img files', () => {

    const img = config.minification.img;
    let imgBefore = fs.statSync(img[0].src),
      imgAfter = fs.statSync(`${img[0].dest}/chewie.png`),
      sizeBeforeMin = util.inspect(imgBefore.size),
      sizeAfterMin = util.inspect(imgAfter.size);

    expect(sizeAfterMin<sizeBeforeMin).to.equal(true);

    imgBefore = fs.statSync(img[1].src),
    imgAfter = fs.statSync(`${img[1].dest}/chewie2.png`),
    sizeBeforeMin = util.inspect(imgBefore.size),
    sizeAfterMin = util.inspect(imgAfter.size);

    expect(sizeAfterMin<sizeBeforeMin).to.equal(true);


  });

  it('should have minified json files', () => {

    const json = config.minification.json,
      jsonMinContentExpected = '{"first_name":"Tupac","last_name":"Shakur","died":"13.09.1996","age":25,"best_song":"California Love","known_for":"Thug Life"}';

    let isContentEqual = testHelper.checkFileContentSync(`${json[0].dest}/tupacipsum.json`, jsonMinContentExpected);
    expect(isContentEqual).to.equal(true);

    isContentEqual = testHelper.checkFileContentSync(`${json[1].dest}/tupacipsum2.json`, jsonMinContentExpected);
    expect(isContentEqual).to.equal(true);

  });

  after((done) => {
    rimraf(config.tempLocation, done);
  });

});
