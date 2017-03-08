'use strict';
const misc = require('../../src/helpers/misc'),
  assert = require('assert'),
  _ = require('underscore'),
  config = require('../chewieConfigTest');

describe('misc', () => {

  describe('_uniqTopicTypes()', () => {

    it('should return array with one unique type', () => {

      // is quantity correct
      const message = 'services:serviceUno,services:serviceDos',
        uniqTopicTypes = misc.uniqTopicTypes(config, message);

      assert.equal(uniqTopicTypes.length, 1);

      // are values correct
      const isCorrect = _.isEqual(uniqTopicTypes, ['services']);
      assert.equal(isCorrect, true);
    });

    it('should return array with 2 unique types', () => {

      // is quantity correct
      const message = 'services:serviceUno,services:serviceDos,services:serviceTres,tools:Quattro',
        uniqTopicTypes = misc.uniqTopicTypes(config, message);

      assert.equal(uniqTopicTypes.length, 2);

      // are values correct
      const isCorrect = _.isEqual(uniqTopicTypes, ['services', 'tools']);
      assert.equal(isCorrect, true);
    });

    it('should return empty array if no type was provided', () => {

      // is quantity correct
      const message = '',
        uniqTopicTypes = misc.uniqTopicTypes(config, message);

      assert.equal(uniqTopicTypes.length, 0);
    });

    it('should return array with types named in config', () => {

      config.independentSections = ['rn'];
      const message = '',
        uniqTopicTypes = misc.uniqTopicTypes(config, message);

      assert.equal(uniqTopicTypes.length, 1);
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


  describe('#getTopicsByWildcard()', () => {
    const mockedRegistry = [
      {
        type: 'services',
        name: 'servicesIpsum'
      },
      {
        type: 'services',
        name: 'servicesLorem'
      },
      {
        type: 'tools',
        name: 'toolIpsum'
      },
      {
        type: 'tools',
        name: 'toolsLorem'
      }
    ];

    it('should return two entry when pattern is provided', () => {

      const wildTopicsBasic = [
        {
          type: 'tools',
          name: 'toolIpsum'
        },
        {
          type: 'services',
          name: 'servicesLorem'
        }
      ];

      const wildcardedRegistry = misc.getTopicsByWildcard(mockedRegistry, wildTopicsBasic);

      assert.equal(wildcardedRegistry.length, 2);
    });

    it('should return no entry when bad type patterns are provided', () => {

      const wildTopicsBasicWrongType = [
        {
          type: 'notExisitng',
          name: 'toolIpsum'
        },
        {
          type: 'notExisitng',
          name: 'servicesLorem'
        }
      ];

      const wildcardedRegistry = misc.getTopicsByWildcard(mockedRegistry, wildTopicsBasicWrongType);

      assert.equal(wildcardedRegistry.length, 0);
    });

    it('should return no entry when bad name patterns are provided', () => {

      const wildTopicsBasicWrongName = [
        {
          type: 'tools',
          name: 'notExisitng'
        },
        {
          type: 'services',
          name: 'notExisitng'
        }
      ];

      const wildcardedRegistry = misc.getTopicsByWildcard(mockedRegistry, wildTopicsBasicWrongName);

      assert.equal(wildcardedRegistry.length, 0);
    });

    it('should return three entry when patterns are provided', () => {

      const wildTopicsMasks = [
        {
          type: '*',
          name: 'servicesLorem'
        },
        {
          type: 'tools',
          name: '*'
        }
      ];

      const wildcardedRegistry = misc.getTopicsByWildcard(mockedRegistry, wildTopicsMasks);

      assert.equal(wildcardedRegistry.length, 3);
    });

    it('should return four entry when pattern is provided', () => {

      const wildTopicsComplicatedMasks = [
        {
          type: '*',
          name: '*Ip*'
        },
        {
          type: '*',
          name: '*Lo*'
        }
      ];

      const wildcardedRegistry = misc.getTopicsByWildcard(mockedRegistry, wildTopicsComplicatedMasks);

      assert.equal(wildcardedRegistry.length, 4);
    });

    it('should return three entry when pattern is provided', () => {

      const wildTopicsMasksSecond = [
        {
          type: 's*',
          name: 'servicesLorem'
        },
        {
          type: 'tools',
          name: 't*'
        }
      ];

      const wildcardedRegistry = misc.getTopicsByWildcard(mockedRegistry, wildTopicsMasksSecond);

      assert.equal(wildcardedRegistry.length, 3);
    });
  });

});
