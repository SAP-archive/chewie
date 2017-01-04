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
    }];
    const wildTopicsServices = [{
      type: 'services',
      name: 'servicesI*'
    }]

    const wildTopicsServicesTwo = [{
      type: 'services',
      name: '*'
    }]

    const wildTopicsUniversal = [{
      type: 'tools',
      name: '*'
    },
    {
      type: 'services',
      name: '*'
    }];

    const wildTopicsComplicated = [{
      type: 'services',
      name: '*Ip*'
    },
    {
      type: 'tools',
      name: '*Ip*'
    }]

    it('should return one entry when pattern is provided',  () => {
      const wildcardedRegistry = misc.getTopicsByWildcard(mockedRegistry, wildTopicsServices);

      assert.equal(wildcardedRegistry.length, 1);
    });

    it('should return two(all) service entries when pattern * is provided',  () => {
      const wildcardedRegistry = misc.getTopicsByWildcard(mockedRegistry, wildTopicsServicesTwo);

      assert.equal(wildcardedRegistry.length, 2);
    });

    it('should return four entries when pattern * is provided',  () => {
      const wildcardedRegistry = misc.getTopicsByWildcard(mockedRegistry, wildTopicsUniversal);

      assert.equal(wildcardedRegistry.length, 4);
    });

    it('should return 2 entries when *Ip* pattern is provided',  () => {
      const wildcardedRegistry = misc.getTopicsByWildcard(mockedRegistry, wildTopicsComplicated);

      assert.equal(wildcardedRegistry.length, 2);
    });


  });
});
