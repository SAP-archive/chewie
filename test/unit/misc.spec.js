'use strict';
const misc = require('../../src/helpers/misc'),
  assert = require('assert'),
  _ = require('underscore');

describe('misc', () => {

  describe('_uniqTopicTypes()', () => {

    it('should return array with one unique type', () => {

      // is quantity correct
      const message = 'services:serviceUno,services:serviceDos',
        uniqTopicTypes = misc.uniqTopicTypes(message);

      assert.equal(uniqTopicTypes.length, 1);

      // are values correct
      const isCorrect = _.isEqual(uniqTopicTypes, ['services']);
      assert.equal(isCorrect, true);
    });

    it('should return array with 2 unique types', () => {

      // is quantity correct
      const message = 'services:serviceUno,services:serviceDos,services:serviceTres,tools:Quattro',
        uniqTopicTypes = misc.uniqTopicTypes(message);

      assert.equal(uniqTopicTypes.length, 2);

      // are values correct
      const isCorrect = _.isEqual(uniqTopicTypes, ['services', 'tools']);
      assert.equal(isCorrect, true);
    });

    it('should return emply array if no type was provided', () => {

      // is quantity correct
      const message = '',
        uniqTopicTypes = misc.uniqTopicTypes(message);

      assert.equal(uniqTopicTypes.length, 0);
    });

  });


  describe('_prepareOutdatedPaths()', () => {

    it('should return object with 2 paths', () => {

      // is quantity correct
      const service = 'serviceUno',
        dest = './tmp',
        indexPaths = misc.prepareOutdatedPaths(dest, service);

      assert.equal(Object.keys(indexPaths).length, 2);

      // are values correct
      const isCorrectIndex = indexPaths.index === './tmp/serviceUno/index.html',
        isCorrectIndexInternal = indexPaths.indexInternal === './tmp/internal/serviceUno/index.html';

      assert.equal(isCorrectIndex && isCorrectIndexInternal, true);
    });

    it('should return emply object if sth is missing', () => {

      // is quantity correct
      const service = '',
        dest = '',
        indexPaths = misc.prepareOutdatedPaths(dest, service);

      assert.equal(Object.keys(indexPaths).length, 0);
    });

  });

});
