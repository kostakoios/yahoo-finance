'use strict';
require('dotenv').config();
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const yahooRoutes = require('./routes/yahoo');
const version = require('./package.json').version;

//#region Constants
const TITLE = 'Finance Crawler API Gateway';
const PORT = 1991;
const HOST = '0.0.0.0';

const options = {
  failOnErrors: false,
  definition: {
    openapi: '3.0.0',
    info: {
      title: TITLE,
      version: version,
    },
  },
  apis: ['./routes/*.js'], // files containing annotations as above
};

const openapiSpecification = swaggerJsdoc(options);

//#region Handlers
process.on("uncaughtException", (reason, p) => {
  console.log(`Possibly Unhandled Exception at: Promise , ${p}, reason: , ${reason}`);
});

process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', reason.stack || reason);
  // Recommended: send the information to sentry.io
  // or whatever crash reporting service you use
});


process.on('beforeExit', code => {
  // Can make asynchronous calls
  setTimeout(() => {
    console.log(`Process will exit with code: ${code}`);
    process.exit(code);
  }, 100);
});

process.on('exit', code => {
  // Only synchronous calls
  console.log(`Process exited with code: ${code}`);
});
//#endregion



// App
const app = express();

app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpecification));
app.use('/api/v1/yahoo', yahooRoutes);

app.get('/', (req, res) => {
  res.send(`${TITLE} - ${version}`);
});

// Start the server and listen on port 1990
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

