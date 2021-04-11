# connectif-importer

[![Npm Version](https://badge.fury.io/js/connectif-importer.svg)](https://www.npmjs.com/package/connectif-importer)
[![Actions Status](https://github.com/francescorivola/connectif-importer/workflows/Node%20CI/badge.svg)](https://github.com/francescorivola/connectif-importer/actions)
[![CodeFactor](https://www.codefactor.io/repository/github/francescorivola/connectif-importer/badge)](https://www.codefactor.io/repository/github/francescorivola/connectif-importer)
[![codecov](https://codecov.io/gh/francescorivola/connectif-importer/branch/main/graph/badge.svg)](https://codecov.io/gh/francescorivola/connectif-importer)
[![Dependabot Status](https://api.dependabot.com/badges/status?host=github&repo=francescorivola/connectif-importer)](https://dependabot.com)
[![Docker Pulls](https://img.shields.io/docker/pulls/francescorivola/connectif-importer.svg)](https://hub.docker.com/r/francescorivola/connectif-importer)

A CLI to import your contacts and/or products to [Connectif Marketing Automation Platform](https://www.connectif.ai).

## Installation

Install the [NodeJs](https://nodejs.org) runtime.

Now, from your favorite shell, install the CLI by typing the following command:

```
$ npm install -g connectif-importer
```

## Usage

The usage documentation can be found running the CLI with the help flag:

```
$ connectif-importer --help
```

Output:

```
Usage: connectif-importer [options]

Command line interface to easily imports contacts or products csv file in Connectif Marketing Automation Platform.

Options:
  -V, --version                output the version number
  -a, --apiKey <apiKey>        api key
  -d, --delimiter <delimiter>  csv delimiter (default: ",")
  -t, --type <type>            import type (contacts or products)
  -u, --updateOnlyEmptyFields  update only existing fields (default: false)
  -o, --overrideExisting       override contacts if existing (default: true)
  -f, --filePath <filePath>    csv file path
  -i, --interval <interval>    interval in milliseconds to check for import progress (default: 2000)
  -h, --help                   display help for command
```

## Docker

In case you want to run the CLI using docker you can with the following commands:

The below will print the version of the CLI:
```
docker run --rm francescorivola/connectif-importer:latest
```

The below will run the CLI with the given options:
```
docker run --rm -v $(pwd)/file.csv:/home/node/file.csv francescorivola/connectif-importer:latest \
  --filePath=file.csv \
  --type=contacts \
  --apiKey=$CONNECTIF_API_KEY
```

## License

MIT