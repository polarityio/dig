polarity.export = PolarityComponent.extend({
  details: Ember.computed.alias('block.data.details'),
  activeTab: 'authority',
  init: function () {
    this._super(...arguments);
    if (this.details.totalAnswers > 0) {
      this.set('activeTab', 'answer');
    } else if (this.details.authority) {
      this.set('activeTab', 'authority');
    } else {
      this.set('activeTab', 'headers');
    }

    const types = this.get('details.answer.__order');
    types.forEach((type) => {
      if (this.get(`details.answer.${type}.results.length`) > 0) {
        this.set(`details.answer.${type}.__show`, true);
      }
    });
  },
  actions: {
    changeTab: function (tabName) {
      this.set('activeTab', tabName);
    },
    toggleAnswerType: function (type) {
      this.toggleProperty(`details.answer.${type}.__show`);
      if (this.get('block.entity.isDomain') && !this.get(`details.answer.${type}.searched`)) {
        // we don't have data for this query type yet
        const payload = {
          action: 'RUN_QUERY',
          type,
          entity: this.get('block.entity')
        };
        this.set(`details.answer.${type}.__searching`, true);
        this.set(`details.answer.${type}.__error`, '');
        this.sendIntegrationMessage(payload)
          .then((result) => {
            this.set(`details.answer.${type}.results`, result.answer.results);
            this.set('details.totalAnswers', this.get('details.totalAnswers') + result.answer.results.length);
            if (result.authority) {
              const currentAuthority = this.get('details.authority');
              if (Array.isArray(currentAuthority)) {
                this.set('details.authority', currentAuthority.concat(result.authority));
              } else {
                this.set(`details.authority`, result.authority);
              }
            }

            if (result.header) {
              const currentHeader = this.get('details.header');
              result.header.push('\n');
              this.set('details.header', result.header.concat(currentHeader));
            }
            this.set(`details.answer.${type}.searched`, true);
          })
          .catch((err) => {
            this.set(`details.answer.${type}.__error`, JSON.stringify(err, null, 4));
          })
          .finally(() => {
            this.set(`details.answer.${type}.__searching`, false);
          });
      }
    },
    retryLookup: function () {
      this.set('running', true);
      this.set('errorMessage', '');
      const payload = {
        action: 'RETRY_LOOKUP',
        entity: this.get('block.entity')
      };
      this.sendIntegrationMessage(payload)
        .then((result) => {
          this.set('block.data', result.data);
        })
        .catch((err) => {
          // there was an error
          this.set('errorMessage', JSON.stringify(err, null, 4));
        })
        .finally(() => {
          this.set('running', false);
        });
    }
  },
  timezone: Ember.computed('Intl', function () {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  })
});
