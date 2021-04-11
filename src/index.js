#!/usr/bin/env node

'use strict'

const cli = require('./cli')

cli().parseAsync(process.argv).catch(error => {
  console.error('error:'.red, error.message.red)
  process.exit(1)
})
