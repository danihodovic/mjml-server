const express = require('express')
const bodyParser = require('body-parser')
const mjml = require('mjml')

const { logger, middleware: loggingMiddleware } = require('./logging.js')

const renderEndpoint = '/v1/render'

module.exports.create = (argv) => {
  const app = express()
  app.use(loggingMiddleware)
  app.use(bodyParser.text({ type: '*/*' }))
  app.post(renderEndpoint, (req, res) => {
    try {
      const result = mjml(req.body, {
        keepComments: argv.keepComments,
        beautify: argv.beautify,
        minify: argv.minify,
        validationLevel: argv.validationLevel
      })
      res.send(result)
    } catch (err) {
      logger.error('Failed to compile mjml', err)
      res.statusCode = 400
      res.send('Encountered an error while compiling mjml. Check your server logs')
    }
  })
  app.use((req, res) => {
    res.status(404).send(`You're probably looking for ${renderEndpoint}`)
  })
  return app
}
