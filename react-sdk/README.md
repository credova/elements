# PublicSquare React Elements

[![Version](https://img.shields.io/npm/v/@publicsquare/elements-react.svg)](https://www.npmjs.org/package/@publicsquare/elements-react)
[![Downloads](https://img.shields.io/npm/dm/@publicsquare/elements-react.svg)](https://www.npmjs.org/package/@publicsquare/elements-react)

A thin React wrapper for [PublicSquare](https://publicsquare.com/) JavaScript Elements SDK.

## Installation

Using [Node Package Manager](https://docs.npmjs.com/)

```sh
npm install --save @publicsquare/elements-react
```

Using [Bun](https://bun.sh/docs/cli/add)

```sh
bun add @publicsquare/elements-react
```

Using [pnpm](https://pnpm.io/cli/add)

```sh
pnpm add @publicsquare/elements-react
```

Using [Yarn](https://classic.yarnpkg.com/en/docs/)

```sh
yarn add @publicsquare/elements-react
```

## Documentation

For a complete list of options and examples, please refer to our [React Elements SDK docs](https://developers.publicsquare.com/sdks/web/react/)

## Usage

### Initialization

Initializing the SDK is done via calling the `usePublicSquare` hook with parameters:

```jsx
import {
  PublicSquareProvider,
  CardElement,
  usePublicSquare,
} from '@publicsquare/publicsquare-react';

const App = () => {
  return (
    <PublicSquareProvider apiKey={apiKey}> // Publishable API Key
      <MyComponent />
    </PublicSquareProvider>
  );
};

const MyComponent = () => {
  const { publicSquare } = usePublicSquare();

  return <CardElement id="cardInput" />;
};
```