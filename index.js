#!/usr/bin/env node
const { logger } = require('./lib/logging.js')
const graceful = require('node-graceful')

const { create } = require('./lib/server.js')
const argv = require('./lib/parse_args.js').argv

const server = create(argv).listen(argv.port, argv.host, () => {
  logger.info(`Starting server on port ${argv.port}`)
})

graceful.on('exit', (done, event, signal) => {
  logger.info(`Received ${signal} signal - exiting gracefully...`)
  server.close(done)
})
