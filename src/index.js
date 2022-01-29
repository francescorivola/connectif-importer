#!/usr/bin/env node

import cli from './cli.js'

cli()
  .parseAsync(process.argv)
  .catch(error => {
    console.error('[error]'.red, error.message.red)
    process.exit(1)
  })
