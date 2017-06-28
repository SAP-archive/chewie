[![Build Status](https://travis-ci.org/YaaS/chewie.svg?branch=master)](https://travis-ci.org/YaaS/chewie)
[![npm version](https://badge.fury.io/js/chewie.svg)](https://badge.fury.io/js/chewie)
[![npm](https://img.shields.io/npm/dm/chewie.svg)](https://www.npmjs.com/package/chewie)
[![npm](https://img.shields.io/npm/dt/chewie.svg)](https://www.npmjs.com/package/chewie)
[![dependencies](https://david-dm.org/yaas/chewie.svg)](https://david-dm.org/yaas/chewie)

Chewie is a Node.js module that can be used in any skeleton build by any [static site generator](https://staticsitegenerators.net/). It supports approach for documentation that is contradictory to main documentation trend called [single source publishing](https://en.wikipedia.org/wiki/Single_source_publishing). Chewie makes it possible to have the content distributend in different locations, we could name it `distributed source publishing`.

What does it mean in practice. You can imagine your product consists of 40 different documentation topics. You can document them all in one portal using static site generator, but the content keep in 40 different repositories and managed by different teams using [git](https://git-scm.com/).

## Table of Contents

* [Installation](#installation)
* [Usage](#usage)
 * [Quick Start](#quick-start)
 * [Create Documentation](#create-documentation)
 * [How to Release](#how-to-release)
* [Development](#development)
* [License](#license)
* [Defects and Feedback](#defects-and-feedback)
* [Contribution](#contribution)
* [Credits](#credits)

## Installation

```
npm install chewie
```

## Usage

### Quick Start

One of many tools, that you can use, is for example gulp.js. To use chewie with gulp.js, in the gulp file add:

```
const chewie = require('chewie');
```

### Create Documentation

```
sudo npm install -g jsdoc
jsdoc -r src -d documentation
```

Open index.html under apidocs/documentation

### How to Release

You need to have proper NPM permissions to release this project. Run this command to release:

```
npm run release
```

NOTE: This command increments the package version by 0.0.1 (patch). To release new minor or major version, modify `bump-version` script in the `package.json` file. Replace `patch` with `minor` or `major`.



## Development

* To run all tests, use the following command:  
  ```
  DOCU_PROVIDER=GIT NODE_ENV=master npm run test-unit && npm run test-integration
  ```

* To run just one specific test, use one of the following command:

  ```
  DOCU_PROVIDER=GIT NODE_ENV=master ./node_modules/mocha/bin/mocha --harmony_shipping test/unit/NAME_OF_THE_UNIT_TEST.spec.js
  ```

  ```
  DOCU_PROVIDER=GIT NODE_ENV=master ./node_modules/mocha/bin/mocha --timeout 40000 --harmony_shipping test/integration/NAME_OF_THE_INTEGRATION_TEST.spec.js
  ```

## License

Copyright (c) 2014 [SAP SE](http://www.sap.com) or an SAP affiliate company. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License here: [LICENSE](LICENSE)

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

## Defects and Feedback

Use [the Github issue tracker](../../issues) for now.

## Contribution

Read the [CONTRIBUTING](CONTRIBUTING.md) so you know exactly how to contribute to this project.

## Credits

<p align="center">

[![YaaS](https://github.com/YaaS/sample-yaas-repository/blob/master/YaaS.png)](https://yaas.io)

<p align="center">
:heart: from the GitHub team @ YaaS
