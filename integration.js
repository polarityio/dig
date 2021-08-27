const async = require('async');
const dig = require('node-dig-dns');
let Logger;

const NEED_TO_RUN_YUM_CMD_ERROR = (
  'Error\n    at parse (/app/polarity-server/integrations/dig/node_modules/node-dig-dns/' +
  'dist/index.js:42:11)\n    at Socket.<anonymous> (/app/polarity-server/integrations/dig/' +
  'node_modules/node-dig-dns/dist/index.js:91:37)\n    at Socket.emit (events.js:326:22)\n' +
  '    at endReadableNT (_stream_readable.js:1241:12)\n    at processTicksAndRejections ' +
  '(internal/process/task_queues.js:84:21)'
)
  .replace(/\s/g, '')
  .toLowerCase();

function startup(logger) {
  Logger = logger;
}

function doLookup(entities, options, cb) {
  Logger.info({ entities }, 'entities');
  let lookupResults = [];

  async.each(
    entities,
    (entity, next) => {
      let digOptions = [];

      // If the private IP only option is set ignore non private IP addresses
      if (options.privateIpOnly && !entity.isPrivateIP) {
        return next(null);
      }

      if (entity.isIP) {
        digOptions.push('-x');
      }
      digOptions.push(entity.value, 'ANY');
      if (options.dns.length > 0) {
        digOptions.push(`@${options.dns}`);
      }

      Logger.trace({ digOptions }, 'dig command');
      dig(digOptions)
        .then((result) => {
          Logger.info({ result }, 'lookupResults');
          if (result) {
            lookupResults.push({
              entity,
              data: {
                summary: _getSummaryTags(result),
                details: result
              }
            });
          } else {
            lookupResults.push({
              entity,
              data: null
            });
          }
          next(null);
        })
        .catch((err) => {
          const error = JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err)))
          const formattedStackMessage = error.stack.replace(/\s/g, '').toLowerCase();
          Logger.error(
            { error, digOptions },
            `Error running dig command on entity '${entity.value}'`
          );
          if (error.message || formattedStackMessage !== NEED_TO_RUN_YUM_CMD_ERROR) {
            lookupResults.push({
              entity,
              data: {
                summary: ['DNS Returned Error'],
                details: { errorMessage: error.message }
              }
            });
            next(null);
          } else {
            next({
              detail: `Error running dig command on entity ${entity.value}`,
              ...(formattedStackMessage === NEED_TO_RUN_YUM_CMD_ERROR &&
                !error.message && {
                  PossibleFix:
                    'Make sure you\'ve run the "sudo yum install bind-utils -y" cmd as described in the README.md'
                }),
              digOptions,
              err: error
            });
          }
        });
    },
    (err) => {
      cb(err, lookupResults);
    }
  );
}

function _getSummaryTags(result) {
  if (Array.isArray(result.answer)) {
    let tags = [`${result.answer[0].type} ${result.answer[0].value}`];
    if (result.answer.length > 1) {
      tags.push(`+${result.answer.length - 1} answers`);
    }
    return tags;
  } else if (Array.isArray(result.authority)) {
    return [`${result.authority[0][4]}`, `${result.authority[0][5]}`];
  }
  return ['No Answers'];
}


function onMessage(payload, options, cb) {
  switch (payload.action) {
    case 'RETRY_LOOKUP':
      doLookup([payload.entity], options, (err, lookupResults) => {
        if (err) {
          Logger.error({ err }, 'Error retrying lookup');
          cb(err);
        } else {
          cb(null, lookupResults[0]);
        }
      });
      break;
  }
}
module.exports = {
  doLookup,
  startup,
  onMessage
};
