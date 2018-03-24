import express from 'express';
import path from 'path';
import React from 'react';
import render from './render';

const app = express();
app.disable('x-powered-by');

app.use(
  '/static',
  express.static(path.join(process.cwd(), 'build/client/static'))
);
app.use('/', express.static('build/client'));

app.use(render);

app.listen(process.env.PORT || 3000);
