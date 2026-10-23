# PublicSquare JavaScript Elements

[![Version](https://img.shields.io/npm/v/@publicsquare/publicsquare-js.svg)](https://www.npmjs.org/package/@publicsquare/publicsquare-js)
[![Downloads](https://img.shields.io/npm/dm/@publicsquare/publicsquare-js.svg)](https://www.npmjs.org/package/@publicsquare/publicsquare-js)

The [PublicSquare](https://publicsquare.com/) JavaScript Elements SDK

## Installation

Using [Node Package Manager](https://docs.npmjs.com/)

```sh
npm install --save @publicsquare/publicsquare-js
```

Using [Yarn](https://classic.yarnpkg.com/en/docs/)

```sh
yarn add @publicsquare/publicsquare-js
```

Using [Bun](https://bun.sh/docs/cli/add)

```sh
bun add @publicsquare/publicsquare-js
```

## Documentation

For a complete list of options and examples, please refer to our [JavaScript Elements SDK docs](https://developers.publicsquare.com/sdks/web/javascript/)

## Usage

### Initialization

```javascript
import { PublicSquare } from '@publicsquare/publicsquare-js';

const psq = await new PublicSquare().init('<API Key>'); // replace with your Publishable API key
```