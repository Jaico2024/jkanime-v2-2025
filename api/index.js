const { createServer } = require('@vercel/node');
const express = require('express');
const next = require('next');

const app = express();

const router = require('../src/routes');

app.use(express.json());
app.use('/', router);

module.exports = app;
