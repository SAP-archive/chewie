'use strict';
const assert = require('assert');
const preparePushResult = require('../../src/integration/preparePushResult');
const _ = require('underscore');

describe('preparePushResult', () => {

  describe('_uniqTopicTypes()', () => {

    it('should return array with one unique type', () => {

      // is quantity correct
      const message = 'services:serviceUno,services:serviceDos';
      const uniqTopicTypes = preparePushResult._uniqTopicTypes(message);
      assert.equal(uniqTopicTypes.length, 1);

      // are values correct
      const isCorrect = _.isEqual(uniqTopicTypes, ['services']);
      assert.equal(isCorrect, true);
    });

    it('should return array with 2 unique types', () => {

      // is quantity correct
      const message = 'services:serviceUno,services:serviceDos,services:serviceTres,tools:Quattro';
      const uniqTopicTypes = preparePushResult._uniqTopicTypes(message);
      assert.equal(uniqTopicTypes.length, 2);

      // are values correct
      const isCorrect = _.isEqual(uniqTopicTypes, ['services', 'tools']);
      assert.equal(isCorrect, true);
    });

    it('should return emply array if no type was provided', () => {

      // is quantity correct
      const message = '';
      const uniqTopicTypes = preparePushResult._uniqTopicTypes(message);
      assert.equal(uniqTopicTypes.length, 0);
    });

  });


  describe('_prepareOutdatedPaths()', () => {

  });

});
