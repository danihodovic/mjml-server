#!/usr/bin/env node
const cluster = require('cluster');
const os = require('os');
const { logger } = require('./lib/logging.js');
const graceful = require('node-graceful');

if (cluster.isPrimary) {
  const numWorkers = os.availableParallelism();
  logger.info(`Starting ${numWorkers} workers`);

  for (let i = 0; i < numWorkers; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    logger.warn(`Worker ${worker.process.pid} died (${signal || code}) — restarting`);
    cluster.fork();
  });
} else {
  const { create } = require('./lib/server.js');
  const argv = require('./lib/parse_args.js').argv;

  const server = create(argv).listen(argv.port, argv.host, () => {
    logger.info(`Worker ${process.pid} listening on port ${argv.port}`);
  });

  graceful.on('exit', (done, event, signal) => {
    logger.info(`Worker ${process.pid} received ${signal} — exiting gracefully`);
    server.close(done);
  });
}
