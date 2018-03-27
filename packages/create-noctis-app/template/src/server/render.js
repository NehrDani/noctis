import { readFileSync } from 'fs';
import React from 'react';
import { renderToString } from 'react-dom/server';
import App from '../shared/App';

const IS_DEV = process.env.NODE_ENV === 'development';
const PUBLIC_PATH = process.env.PUBLIC_PATH || '/';
const ASSET_MANIFEST = process.env.NOCTIS_ASSET_MANIFEST;

const assetManifest = IS_DEV ? {} : JSON.parse(readFileSync(ASSET_MANIFEST));
const client = IS_DEV
  ? `${PUBLIC_PATH}static/js/client.js`
  : `${assetManifest['client.js']}`;
const styles = IS_DEV
  ? '' // in DEV the css is hot loaded
  : `<link href="${assetManifest['client.css']}" rel="stylesheet" />`;

export default (req, res) => {
  res.status(200).send(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta name="theme-color" content="#000000">
    ${styles}
    <link rel="manifest" href="/public/manifest.json">
    <link rel="shortcut icon" href="/public/favicon.ico">
    <title>Noctis App</title>
  </head>
  <body>
    <div id="root">${renderToString(<App />)}</div>
    <script src="${client}"></script>
  </body>
</html>`);
};
