const express = require('express');
const bodyParser = require('body-parser');
const mjml = require('mjml');
const mjml2json = require('mjml2json').default;
const json2mjml = require('json2mjml').default;

const { logger, middleware: loggingMiddleware } = require('./logging.js');
const packageJson = require('../package.json');

const renderEndpoint = '/v1/render';
const processJson2XmlEndpoint = '/v1/process/json/xml';
const processXml2JsonEndpoint = '/v1/process/xml/json';

function handleRequest (req, res) {
  let mjmlText;

  try {
    mjmlText = JSON.parse(req.body).mjml;
  } catch (err) {
    mjmlText = req.body;
  }

  try {
    mjmlText = json2mjml(JSON.parse(mjmlText));
  } catch (err) { }

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

function handleJson2XmlRequest (req, res) {
  let result;
  try {
    result = json2mjml(JSON.parse(req.body));
  } catch (err) {
    logger.error(err);
    res.statusCode = 400;
    res.send({ message: 'Failed to process json', ...err });
    return;
  }
  res.send(result);
}
function handleXml2JsonRequest (req, res) {
  let result;
  try {
    result = mjml2json(req.body);
  } catch (err) {
    logger.error(err);
    res.statusCode = 400;
    res.send({ message: 'Failed to process xml', ...err });
    return;
  }
  res.send(result);
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
  app.post(processJson2XmlEndpoint, handleJson2XmlRequest);
  app.post(processXml2JsonEndpoint, handleXml2JsonRequest);
  app.use((req, res) => {
    res.status(404).send({ message: `You're probably looking for ${renderEndpoint}` });
  });
  return app;
};
