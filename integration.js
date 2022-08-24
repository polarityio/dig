const async = require('async');
/**
 * Note that we are using af forked version of  node-dig-dns to fix a bug in exception handling that prevented
 * us from easily catching exceptions thrown by the the dig process is spawned.  This prevented us from easily
 * being able to tell when the dig executable was missing.  With the fork it's much easier to catch this error
 * and report it back to the user.
 *
 * Here is a PR for our fix on the main project: https://github.com/StephanGeorg/node-dig-dns/pull/22
 *
 * If the PR gets merged and released we should switch back to the main project.
 */
const dig = require('node-dig-dns');
let Logger;

function startup(logger) {
  Logger = logger;
}

/**
 * Creates an empty answer response object.  We use this object format to make it easier to display the data in our template.
 * @param entity
 * @returns {{A: {searched: boolean, results: *[]}, TXT: {searched: boolean, results: *[]}, __order: string[], SOA: {searched: boolean, results: *[]}, NS: {searched: boolean, results: *[]}, CNAME: {searched: boolean, results: *[]}, MX: {searched: boolean, results: *[]}, AAAA: {searched: boolean, results: *[]}}|{__order: string[], PTR: {searched: boolean, results: *[]}}}
 */
function getBlankAnswer(entity) {
  // IP Addresses can only do reverse DNS lookups which is of type PTR
  if (entity.isIP) {
    return {
      PTR: {
        results: [],
        searched: true
      },
      // since objects do not have a defined order to the keys, this array is used to
      // access the answer objects in the correct order.  We sort this so that answers
      // with data come first.
      __order: ['PTR']
    };
  }

  return {
    A: {
      results: [],
      searched: false
    },
    AAAA: {
      results: [],
      searched: false
    },
    CNAME: {
      results: [],
      searched: false
    },
    MX: {
      results: [],
      searched: false
    },
    TXT: {
      results: [],
      searched: false
    },
    NS: {
      results: [],
      searched: false
    },
    SOA: {
      results: [],
      searched: false
    },
    // since objects do not have a defined order to the keys, this array is used to
    // access the answer objects in the correct order.  We sort this so that answers
    // with data come first.
    __order: ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'SOA']
  };
}

function doLookup(entities, options, cb) {
  Logger.trace({ entities }, 'entities');
  let lookupResults = [];

  async.each(
    entities,
    (entity, next) => {
      // If the private IP only option is set ignore non private IP addresses
      if (options.privateIpOnly && entity.isIP && !entity.isPrivateIP) {
        Logger.trace('Ignore non-private IP ' + entity.value);
        return next(null);
      }

      const digOptions = [];
      const answers = getBlankAnswer(entity);

      if (entity.isIP) {
        digOptions.push('-x', entity.value);
      } else {
        options.queryTypes.forEach((type) => {
          digOptions.push(type.value, entity.value);
          answers[type.value].searched = true;
        });
        // If no query type is specified default to A record query
        if (options.queryTypes.length === 0) {
          digOptions.push('A', entity.value);
          answers['A'].searched = true;
        }
      }

      if (options.dns.length > 0) {
        digOptions.push(`@${options.dns}`);
      }

      Logger.trace({ digOptions }, 'dig command');

      dig(digOptions)
        .then((result) => {
          Logger.trace({ result }, 'Direct Dig Result');

          if (isMiss(result, options)) {
            Logger.trace(`Lookup for ${entity.value} is a miss`);
            lookupResults.push({
              entity,
              data: null
            });
          } else {
            const formattedAnswer = result.answer
              ? sortAnswers(
                  result.answer.reduce((accum, answer) => {
                    accum[answer.type].results.push(answer);
                    return accum;
                  }, answers)
                )
              : answers;
            const totalAnswers = result.answer ? result.answer.length : 0;

            lookupResults.push({
              entity,
              data: {
                summary: _getSummaryTags(formattedAnswer, result.authority, totalAnswers),
                details: {
                  ...result,
                  answer: formattedAnswer,
                  totalAnswers
                }
              }
            });
          }
          next(null);
        })
        .catch((err) => {
          Logger.error(err);
          const errorObject = JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err)));
          Logger.error(errorObject);
          if (errorObject.message === 'spawn dig ENOENT') {
            next({
              detail: `Failed to run dig command. "dig" executable is likely not installed.`,
              PossibleFix:
                'Make sure you\'ve run the "sudo yum install bind-utils -y" cmd as described in the README.md',
              digOptions,
              err: errorObject
            });
          } else {
            lookupResults.push({
              entity,
              isVolatile: true,
              data: {
                summary: ['DNS Returned Error'],
                details: {
                  errorMessage:
                    typeof errorObject.message === 'string' ? errorObject.message : JSON.stringify(err, null, 4)
                }
              }
            });
            next(null);
          }
        });
    },
    (err) => {
      Logger.trace({ lookupResults }, 'lookupResults');
      cb(err, lookupResults);
    }
  );
}

function errorToPojo(err) {
  return err instanceof Error
    ? {
        ...err,
        name: err.name,
        message: err.message,
        stack: err.stack,
        detail: err.message ? err.message : err.detail ? err.detail : 'Unexpected error encountered'
      }
    : err;
}

function isMiss(result, options) {
  if (!result) {
    return true;
  }

  const totalAnswers = result.answer ? result.answer.length : 0;
  switch (options.resultsToShow.value) {
    case 'always':
      return false;
      break;
    case 'answerOrAuthority':
      return totalAnswers === 0 && !result.authority;
      break;
    case 'answerOnly':
      return totalAnswers === 0;
      break;
  }
}

/**
 * We sort the answers so that the record with the most data appears first and all query types that we already
 * searched go before query types that have not been searched yet.
 *
 * @param answers
 * @returns {*}
 */
function sortAnswers(answers) {
  answers.__order = answers.__order.sort((a, b) => {
    return answers[b].results.length - answers[a].results.length === 0
      ? // if there are the same number of results, put the searched answers first
        Number(answers[b].searched) - Number(answers[a].searched)
      : // Otherwise sort by the number of answers returned
        answers[b].results.length - answers[a].results.length;
  });
  return answers;
}

/**
 * Summary tags will always return the A record first if available.  If there is no A record
 * then it will return the first record with a result.
 *
 * @param answers
 * @param authority
 * @returns {string[]}
 * @private
 */
function _getSummaryTags(answers, authority, totalAnswers) {
  if (answers['A'] && answers['A'].results.length > 0) {
    let tags = [`A ${answers['A'].results[0].value}`];
    if (totalAnswers > 1) {
      tags.push(`+${totalAnswers - 1} answers`);
    }
    return tags;
  } else if (totalAnswers > 0) {
    const type = answers.__order[0];
    const value = answers[type].results[0].value;
    let tags = [`${type} ${type === 'MX' ? value.server : value}`];
    if (totalAnswers > 1) {
      tags.push(`+${totalAnswers - 1} answers`);
    }
    return tags;
  } else if (Array.isArray(authority)) {
    return [`Authority: ${authority[0][4]}`];
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
    case 'RUN_QUERY':
      const queryType = payload.type;
      const singleTypeOptions = {
        ...options,
        queryTypes: [
          {
            value: payload.type
          }
        ]
      };

      doLookup([payload.entity], singleTypeOptions, (err, lookupResults) => {
        if (err) {
          Logger.error({ err }, 'Error retrying lookup');
          cb(err);
        } else {
          cb(null, {
            authority: lookupResults[0].data.details.authority,
            answer: lookupResults[0].data.details.answer[payload.type],
            header: lookupResults[0].data.details.header
          });
        }
      });
      break;
      break;
  }
}

module.exports = {
  doLookup,
  startup,
  onMessage
};
