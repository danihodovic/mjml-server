const yargs = require('yargs')

module.exports.argv = yargs
  .option('host', {
    demandOption: false,
    default: '0.0.0.0',
    describe: 'Server host',
    type: 'string'
  })
  .option('port', {
    demandOption: false,
    default: '15500',
    describe: 'Server port',
    type: 'number'
  })
  .option('keep-comments', {
    demandOption: false,
    default: true,
    describe: 'Keep comments in the HTML output',
    type: 'boolean'
  })
  .option('beautify', {
    demandOption: false,
    default: false,
    describe: 'Beautify the HTML output',
    type: 'boolean'
  })
  .option('minify', {
    demandOption: false,
    default: false,
    describe: 'Minify the HTML output',
    type: 'boolean'
  })
  .option('validation-level', {
    demandOption: false,
    default: 'soft',
    describe: 'Available values for the validator',
    type: 'string',
    choices: ['strict', 'soft', 'skip']
  })
  .argv
