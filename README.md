<!-- Logo -->
<p align="center">
  <img width="50%" src="https://raw.githubusercontent.com/janjakubnanista/ts-type-checked/master/documentation/ts-type-checked.png"/>
</p>

<h1 align="center">
  ts-type-checked
</h1>

<p align="center">
  Automatic type checks for TypeScript
</p>

<!-- The badges section -->
<p align="center">
  <!-- Travis CI build status -->
  <a href="https://travis-ci.org/janjakubnanista/ts-type-checked"><img alt="Build Status" src="https://travis-ci.org/janjakubnanista/ts-type-checked.svg?branch=master"/></a>
  <!-- Fury.io NPM published package version -->
  <a href="https://www.npmjs.com/package/ts-type-checked"><img alt="NPM Version" src="https://badge.fury.io/js/ts-type-checked.svg"/></a>
  <!-- Shields.io dev dependencies status -->
  <a href="https://github.com/janjakubnanista/ts-type-checked/blob/master/package.json"><img alt="Dev Dependency Status" src="https://img.shields.io/david/dev/janjakubnanista/ts-type-checked"/></a>
  <!-- Snyk.io vulnerabilities badge -->
  <a href="https://snyk.io/test/github/janjakubnanista/ts-type-checked"><img alt="Known Vulnerabilities" src="https://snyk.io/test/github/janjakubnanista/ts-type-checked/badge.svg"/></a>
  <!-- Shields.io license badge -->
  <a href="https://github.com/janjakubnanista/ts-type-checked/blob/master/LICENSE"><img alt="License" src="https://img.shields.io/npm/l/ts-type-checked"/></a>
</p>

`ts-type-checked` provides you with TypeScript type guards generated based on your types. It is compatible with rollup, webpack and ttypescript based codebases (see [installation section](#installation) for more information).

## Why `ts-type-checked`

TypeScript is a powerful way of enhancing your application code at compile time but provides no runtime type guards. In other words there is no easy way of checking whether e.g.:

- The JSON object coming from your API really is of correct type
- The parameter / React component prop belongs to a `string` union, is a custom string or is of a specific object type
- The user input is of correct type

At this moment you need to write such type guards yourself, possible using techniques such as branding to help you out. The following example is of course made up but illustrates the problem quite well.

If you need to check whether an object is of type `ConfigA` or `ConfigB` you would need to write something like

```typescript
interface ConfigA {
  name: string;
  options: {
    sources: string[];
    // ...
  }
}

interface ConfigB {
  name: string;
  options: {
    interval: number;
    // ...
  }
}

type Config = ConfigA | ConfigB | string;

const isConfigA = (value: Config): value is ConfigA => {
  // At this point you need to check whether your value is a string
  // or if not whether it matches ConfigA or ConfigB
}

// And then repeat the process for all the types you need to check...
const isConfigB = (value: Config): value is ConfigB => {
  // ...
}
```

If you like your codebase clean like I do you will not be happy with plenty of hardcoded type guards with possibly lots of `as any` type casts in order to bypass TypeScript errors.

**That's where `ts-type-checked` comes in!** You can now delete all those manually written type guards and replace them with one liners!

```typescript
// !!!
const isConfigA = typeCheckFor<ConfigA>();
const isConfigB = typeCheckFor<ConfigA>();
```

Not only have you deleted code but your type guards became more generic! Previously you needed to be reasobaly sure that the argument for `isConfigA` and `isConfigB` is of type `Config`. With `ts-type-checked` your type guards accept `unknown` as an argument instead! **OMG!!!**

<a id="installation"></a>
## Installation

`ts-type-checked` is a TypeScript transformer - it generates the required type checks and injects them into your code at compile time. This comes at a small price - it only works with `webpack`, `rollup` or `ttypescript`. You can find all the required information and more down in the [Examples section](#examples).

<a id="examples"></a>
## Examples

<!-- TODO -->