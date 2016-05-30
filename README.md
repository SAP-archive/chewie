### Install

```
npm install https://github.com/hybris/chewie.git
```


### Quick start

One of many tools, you can use is for example: gulp.js. To use chewie with gulp.js, in the gulp file add:

```
const chewie = require('chewie');
```

### Create documentation

```
sudo npm install -g jsdoc
jsdoc -r src -d documentation
```

Open index.html under apidocs/documentation


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
