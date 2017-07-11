[![Build Status](https://travis-ci.org/YaaS/chewie.svg?branch=master)](https://travis-ci.org/YaaS/chewie)
[![npm version](https://badge.fury.io/js/chewie.svg)](https://badge.fury.io/js/chewie)
[![npm](https://img.shields.io/npm/dm/chewie.svg)](https://www.npmjs.com/package/chewie)
[![npm](https://img.shields.io/npm/dt/chewie.svg)](https://www.npmjs.com/package/chewie)
[![dependencies](https://david-dm.org/yaas/chewie.svg)](https://david-dm.org/yaas/chewie)

Chewie is a Node.js module that you can use in a skeleton build with any [static site generator](https://staticsitegenerators.net/). It supports a different approach to documentation, unlike the [single source publishing](https://en.wikipedia.org/wiki/Single_source_publishing) documentation trend. With Chewie, you can distribute your content in different locations, essentially making it `distributed source publishing`.

What does this mean in practice? Imagine your product consists of forty different documentation topics. Using Chewie, you can document them all in one portal using a static site generator, but keep the content in forty different repositories, each managed by different teams using [git](https://git-scm.com/).

## Table of contents

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

### Quick start

To use chewie with gulp.js, add the following to the gulp file:

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

To release a Chewie project, run this command:

```
npm run release
```

<div class="panel note"> To release a Chewie project, you need proper NPM permissions. </div>

<div class="panel note"> This command increments the package version by 0.0.1 (patch). To release a new minor or major version, modify the `bump-version` script in the `package.json` file. Replace `patch` with `minor` or `major`. </div>

## Development

* To run all the tests, use the following command:  
  ```
  DOCU_PROVIDER=GIT NODE_ENV=master npm run test-unit && npm run test-integration
  ```

* To run just one specific test, use one of the following commands:

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

## Defects and feedback

To offer feedback or report issues, use the [Github issue tracker](../../issues).

## Contribution

To learn how you can contribute to this project, see the [CONTRIBUTING](CONTRIBUTING.md) document.

## Credits

[![YaaS](https://github.com/YaaS/sample-yaas-repository/blob/master/YaaS.png)](https://yaas.io)

From your YaaS team.
