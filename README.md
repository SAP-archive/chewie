[![npm version](https://badge.fury.io/js/chewie.svg)](https://badge.fury.io/js/chewie)
[![npm](https://img.shields.io/npm/dm/chewie.svg)]()
[![npm](https://img.shields.io/npm/dt/chewie.svg)]()
[![dependencies](https://david-dm.org/yaas/chewie.svg)]()

### Install

```
npm install chewie
```


### Quick start

One of many tools, that you can use, is for example gulp.js. To use chewie with gulp.js, in the gulp file add:

```
const chewie = require('chewie');
```

### Create documentation

```
sudo npm install -g jsdoc
jsdoc -r src -d documentation
```

Open index.html under apidocs/documentation

### How to release

If you have proper permissions to push this package to npm run this command:

```
npm run release
```

DISCLAIMER: This will increment your package version by 0.0.1 (patch). In case you want to push minor or major release, change `bump-version` script in `package.json` and replace `patch` with your release version.


### Dev Hints - Testing

* To run all tests, use the following command:  
  ```
  NODE_ENV=master npm run test-unit && npm run test-integration
  ```

* To run just one specific test, use one of the following command:

  ```
  NODE_ENV=master ./node_modules/mocha/bin/mocha --harmony_shipping test/unit/NAME_OF_THE_UNIT_TEST.spec.js
  ```

  ```
  NODE_ENV=master ./node_modules/mocha/bin/mocha --timeout 40000 --harmony_shipping test/integration/NAME_OF_THE_INTEGRATION_TEST.spec.js
  ```

### License

This library is licensed under Apache 2.0. Full license text is available in [LICENSE](LICENSE).
