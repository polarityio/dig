const async = require('async');
const dig = require('node-dig-dns');
let Logger;

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
              entity: entity,
              data: {
                summary: _getSummaryTags(result),
                details: result
              }
            });
          } else {
            lookupResults.push({
              entity: entity,
              data: null
            });
          }
          next(null);
        })
        .catch((err) => {
          Logger.error({ err, digOptions }, `Error running dig command on entity '${entity.value}'`);
          next({
            detail: `Error running dig command on entity ${entity.value}`,
            digOptions,
            err
          });
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

module.exports = {
  doLookup: doLookup,
  startup: startup
};
