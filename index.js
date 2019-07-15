#!/usr/bin/env node
const mjml = require('mjml')
const express = require('express')
const argv = require('./lib/parse_args.js').argv
const { middleware, logger } = require('./lib/logging.js')
const graceful = require('node-graceful')

const app = express()
app.use(middleware)
app.post('/', (req, res) => {
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

const server = app.listen(argv.port, argv.host, () => {
  logger.info(`Starting server on port ${argv.port}`)
})

graceful.on('exit', (done, event, signal) => {
  logger.info(`Received ${signal} signal - exiting gracefully...`)
  server.close(done)
})
