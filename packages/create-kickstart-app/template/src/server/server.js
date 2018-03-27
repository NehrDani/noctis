import express from 'express';
import path from 'path';
import render from './render';

const app = express();
app.disable('x-powered-by');

app.use('/static', express.static(path.join(__dirname, '../client/static')));
app.use('/public', express.static(path.join(__dirname, '../')));

app.use(render);

app.listen(process.env.PORT || 3000);
