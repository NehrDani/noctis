#!/usr/bin/env node

const { Command } = require('commander')
const chalk = require('chalk')
const checkNodeVersion = require('../utils/checkNodeVersion')
const { name, version, engines } = require('../package.json')

// We need to check the node version here otherwise we may run into
// syntax errors
checkNodeVersion(engines)

const createApp = require('../utils/createApp')

const program = new Command(name)
program
  .version(version)
  .arguments('<project<directory')
  .usage(`${chalk.green('<project-directory>')} [options]`)
  .action(name =>
    createApp(name, program.verbose, program.useNpm, program.name())
  )
  .option('-v --verbose', 'print additional logs')
  .option('-i --info', 'print environment debug info')
  .option('--use-npm')
  .allowUnknownOption()
  .on('--help', () => {
    console.log(`    Only ${chalk.green('<project-directory>')} is required.`)
  })
  .parse(process.argv)
