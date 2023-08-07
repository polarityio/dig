'use strict';

const { execSync } = require('child_process');

let Logger;

function startup(logger) {
  Logger = logger;
}

const defaultValues = {
  scanType: '-sT',
  topPorts: 64,
  arguments: '-T4 -Pn',
  timeout: 30000
};

function doLookup(entities, options, cb) {
  let lookupResults = [];

  entities.forEach((entityObj) => {
    if (!options.privateIpOnly || (options.privateIpOnly && entityObj.isIP && entityObj.isPrivateIP)) {
      lookupResults.push({
        entity: entityObj,
        data: {
          summary: [`${options.topPorts} ports being ran against ${entityObj.value}`],
          details: {
            target: entityObj.value
          }
        }
      });
    }
  });

  cb(null, lookupResults);
}

function onMessage(message, options, cb) {
  if (message.action === 'scan') {
    this.scanTarget = message.entity;
    if (!this.scanTarget) {
      cb(null, {
        reply: `Please select an IP to scan first`
      });

      return;
    }

    const command = `nmap ${defaultValues.scanType} -top-ports ${options.topPorts} ${defaultValues.arguments} ${this.scanTarget}`;
    const output = execSync(command, { encoding: 'utf-8' });

    cb(null, {
      reply: output
    });
    return;
  }
}

module.exports = {
  startup,
  doLookup: doLookup,
  onMessage
};
