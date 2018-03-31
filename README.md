# Noctis :new_moon: [![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)

Build bleeding-egde, isomorphic React applications with ease.

Isomorphic JavaScript applications are tough to setup. Either you buy into a framework like [Next.js](https://github.com/zeit/next.js), fork a boilerplate, or set things up yourself. Noctis is a tool that gives you the awesome developer experience of [create-react-app](https://github.com/facebook/create-react-app) and enhances it with the configuration needed for SSR. Everything else is up to you.

**Noctis comes with some features:**

* :fire: Hot Module Replacement for the client and auto restarts for the server. No manual reloads or restarts necessary
* Comes with ESNext (ES6+) JavaScript goodies (through `babel-preset-noctis`)
* It already uses S(CSS) Modules
* And all goodies from [create-react-app](https://github.com/facebook/create-react-app)

* [Creating an App](#creating-an-app) – How to create a new app.

## Quick Overview

```sh
npx create-noctis-app my-app
cd my-app
npm start
```

*([npx](https://medium.com/@maybekatz/introducing-npx-an-npm-package-runner-55f7d4bd282b) comes with npm 5.2+ and higher, see [instructions for older npm versions](https://gist.github.com/gaearon/4064d3c23a77c74a3614c498a8bb1c5f))*

Then open [http://localhost:3000/](http://localhost:3000/) to see your app.<br>

### Get Started Immediately

You **don’t** need to install or configure tools like Webpack or Babel.<br>
They are preconfigured and hidden so that you can focus on the code.

Just create a project, and you’re good to go.

## Creating an App

**You’ll need to have Node >= 8 on your local development machine** (but it’s not required on the server). You can use [nvm](https://github.com/creationix/nvm#installation) (macOS/Linux) to easily switch Node versions between different projects.

To create a new app, run a single command:

```sh
npx create-noctis-app my-app
```

*([npx](https://medium.com/@maybekatz/introducing-npx-an-npm-package-runner-55f7d4bd282b) comes with npm 5.2+ and higher, see [instructions for older npm versions](https://gist.github.com/gaearon/4064d3c23a77c74a3614c498a8bb1c5f))*

It will create a directory called `my-app` inside the current folder.<br>
Inside that directory, it will generate the initial project structure and install the transitive dependencies:

```
my-app
├── node_modules
├── package.json
├── .gitignore
├── public
│   └── favicon.ico
│   └── manifest.json
└── src
    └── client
        └── client.css
        └── client.js
    └── server
        └── render.js
        └── server.js
    └── shared
        └── App.css
        └── App.js
        └── App.test.js
        └── logo.svg
```

**That's it.** You don't need to worry about setting up multiple webpack configs or other build tools.<br>
Once the installation is done, you can open your project folder:

```sh
cd my-app
```

Inside the newly created project, you can run some built-in commands:

### `npm start` or `yarn start`

Runs the app in development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `npm test` or `yarn test`

Runs the test watcher (Jest) in an interactive mode.
By default, runs tests related to files changed since the last commit.

### `npm run build` or `yarn build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed.
