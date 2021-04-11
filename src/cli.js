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

  console.log(`import request successfully submitted with id ${id}\n`.green)

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
    const { success, errors, status } = await getResponse.json()
    progressBar.update(success + errors)

    if (status === 'finished') {
      progressBar.stop()
      console.log(colors.green('\nSuccess 🎉 🎉 🎉 🎉 🎉 🎉 🎉'))
      console.log(`total ${type} to import`, total)
      console.log(`success ${type} imported`, success)
      console.log(`error ${type} imported`, errors)
      return
    } else if (status === 'error') {
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
