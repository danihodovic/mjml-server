const express = require('express');
const bodyParser = require('body-parser');
const mjml = require('mjml');

const { logger, middleware: loggingMiddleware } = require('./logging.js');
const packageJson = require('../package.json');

const renderEndpoint = '/v1/render';

function handleRequest (req, res) {
  let mjmlText;

  try {
    mjmlText = JSON.parse(req.body).mjml;
  } catch (err) {
    mjmlText = req.body;
  }

  let result;
  try {
    result = mjml(mjmlText, req.app.get('mjmlConfig'));
  } catch (err) {
    logger.error(err);
    res.statusCode = 400;
    res.send({ message: 'Failed to compile mjml', ...err });
    return;
  }

  const { html, errors } = result;

  res.send({
    html,
    mjml: mjmlText,
    mjml_version: packageJson.dependencies.mjml,
    errors
  });
}

module.exports.create = (argv) => {
  const config = {
    keepComments: argv.keepComments,
    beautify: argv.beautify,
    minify: argv.minify,
    validationLevel: argv.validationLevel
  };

  logger.info('Using configuration:', config);

  const app = express();
  app.set('mjmlConfig', config);
  app.use(loggingMiddleware);
  app.use(bodyParser.text({
    type: () => true,
    limit: argv.maxBody
  }));
  app.post(renderEndpoint, handleRequest);
  app.use((req, res) => {
    res.status(404).send({ message: `You're probably looking for ${renderEndpoint}` });
  });
  return app;
};
