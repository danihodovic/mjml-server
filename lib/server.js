const express = require('express');
const bodyParser = require('body-parser');
const mjml = require('mjml');

const { logger, middleware: loggingMiddleware } = require('./logging.js');
const packageJson = require('../package.json');

const renderEndpoint = '/v1/render';

module.exports.create = (argv) => {
  const config = {
    keepComments: argv.keepComments,
    beautify: argv.beautify,
    minify: argv.minify,
    validationLevel: argv.validationLevel
  };

  logger.info('Using configuration:', config);

  const app = express();
  app.use(loggingMiddleware);
  app.use(bodyParser.text({ type: () => true }));
  app.post(renderEndpoint, (req, res) => {
    let html, errors;

    try {
      const result = mjml(req.body, config);
      ({ html, errors } = result);
    } catch (err) {
      logger.error(err);
      res.statusCode = 400;
      res.send({ message: 'Failed to compile mjml', ...err });
      return;
    }

    res.send({
      html,
      mjml: req.body,
      mjml_version: packageJson.dependencies.mjml,
      errors
    });
  });
  app.use((req, res) => {
    res.status(404).send({ message: `You're probably looking for ${renderEndpoint}` });
  });
  return app;
};
