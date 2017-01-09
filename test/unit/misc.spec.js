'use strict';
const assert = require('assert');
const misc = require('../../src/helpers/misc');

describe('Misc', () => {
  describe('#getTopicsByWildcard()', () => {
    const mockedRegistry = [{
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

    const wildTopicsBasic = [{
      type: 'tools',
      name: 'toolIpsum'
    },
      {
        type: 'services',
        name: 'servicesLorem'
      }
        ];

    const wildTopicsBasicWrongType = [{
      type: 'notExisitng',
      name: 'toolIpsum'
    },
      {
        type: 'notExisitng',
        name: 'servicesLorem'
      }
        ];

    const wildTopicsBasicWrongName = [{
      type: 'tools',
      name: 'notExisitng'
    },
      {
        type: 'services',
        name: 'notExisitng'
      }
        ];

    const wildTopicsMasks = [{
      type: '*',
      name: 'servicesLorem'
    },
      {
        type: 'tools',
        name: '*'
      }
        ];

    const wildTopicsMasksSecond = [{
      type: 's*',
      name: 'servicesLorem'
    },
      {
        type: 'tools',
        name: 't*'
      }
        ];

    const wildTopicsComplicatedMasks = [{
      type: '*',
      name: '*Ip*'
    },
      {
        type: '*',
        name: '*Lo*'
      }
        ];



    it('should return two entry when pattern is provided', () => {
      const wildcardedRegistry = misc.getTopicsByWildcard(mockedRegistry, wildTopicsBasic);

      assert.equal(wildcardedRegistry.length, 2);
    });

    it('should return no entry when bad type patterns are provided', () => {
      const wildcardedRegistry = misc.getTopicsByWildcard(mockedRegistry, wildTopicsBasicWrongType);

      assert.equal(wildcardedRegistry.length, 0);
    });

    it('should return no entry when bad name patterns are provided', () => {
      const wildcardedRegistry = misc.getTopicsByWildcard(mockedRegistry, wildTopicsBasicWrongName);

      assert.equal(wildcardedRegistry.length, 0);
    });

    it('should return three entry when patterns are provided', () => {
      const wildcardedRegistry = misc.getTopicsByWildcard(mockedRegistry, wildTopicsMasks);

      assert.equal(wildcardedRegistry.length, 3);
    });

    it('should return four entry when pattern is provided', () => {
      const wildcardedRegistry = misc.getTopicsByWildcard(mockedRegistry, wildTopicsComplicatedMasks);

      assert.equal(wildcardedRegistry.length, 4);
    });

    it('should return three entry when pattern is provided', () => {
      const wildcardedRegistry = misc.getTopicsByWildcard(mockedRegistry, wildTopicsMasksSecond);

      assert.equal(wildcardedRegistry.length, 3);
    });



  });

});
