'use strict'

const fetch = require('node-fetch')
const fs = require('fs')
const FormData = require('form-data')
const { Command } = require('commander')
const cliProgress = require('cli-progress')
const colors = require('colors')
const packageInfo = require('../package.json')

async function executeImport (options) {
  const {
    overrideExisting,
    type,
    filePath,
    interval,
    delimiter,
    updateOnlyEmptyFields,
    apiKey
  } = options

  if (!fs.existsSync(filePath)) {
    throw new Error(`file ${filePath} does not exist`)
  }

  console.log('[info] uploading file and submitting import request.')

  const form = new FormData()
  form.setBoundary('--------------------------515890814546601021194782')
  form.append('type', type)
  form.append('delimiter', delimiter)
  form.append('overrideExisting', `${overrideExisting}`)
  form.append('updateOnlyEmptyFields', `${updateOnlyEmptyFields}`)
  form.append('file', fs.createReadStream(filePath))

  const response = await fetch('https://api.connectif.cloud/imports', {
    method: 'POST',
    headers: {
      Authorization: `apiKey ${apiKey}`,
      ...form.getHeaders()
    },
    body: form
  })

  if (!response.ok) {
    throw new Error(`${response.status} - ${await response.text()}`)
  }

  const { id, total } = await response.json()

  console.log(`[info] import request successfully submitted with id ${id}. Now waiting for import completion.\n`)

  const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_grey)
  progressBar.start(total, 0)

  while (true) {
    const getResponse = await fetch(`https://api.connectif.cloud/imports/${id}`, {
      method: 'GET',
      headers: {
        Authorization: `apiKey ${apiKey}`
      }
    })
    if (!getResponse.ok) {
      throw new Error(`${getResponse.status} - ${await getResponse.text()}`)
    }
    const { success, errors, status, errorReportFileUrl } = await getResponse.json()
    progressBar.update(success + errors)

    if (status === 'finished') {
      progressBar.stop()
      console.log(colors.green('\n[info] import finished 🎉 🎉 🎉 🎉 🎉 🎉 🎉.'))
      console.log(`[info] ${success} of ${total} ${type} have been imported successfully.`)
      if (errors > 0) {
        console.log(colors.yellow(`[warn] ${errors} lines in the csv have validation errors. Check out more info downloading the error report at ${errorReportFileUrl}`))
      }
      return
    } else if (status === 'error') {
      progressBar.stop()
      throw new Error('import finished in error state')
    }
    await wait(interval)
  }
}

function wait (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

module.exports = function cli () {
  return new Command()
    .version(packageInfo.version)
    .name(packageInfo.name)
    .description(packageInfo.description)
    .requiredOption('-a, --apiKey <apiKey>', 'api key')
    .requiredOption('-d, --delimiter <delimiter>', 'csv delimiter', ',')
    .requiredOption('-t, --type <type>', 'import type (contacts or products)')
    .requiredOption('-u, --updateOnlyEmptyFields', 'update only existing fields', false)
    .requiredOption('-o, --overrideExisting', 'override contacts if existing', true)
    .requiredOption('-f, --filePath <filePath>', 'csv file path')
    .requiredOption('-i, --interval <interval>', 'interval in milliseconds to check for import progress', 2000)
    .action(executeImport)
}
