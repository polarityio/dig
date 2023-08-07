polarity.export = PolarityComponent.extend({
  details: Ember.computed.alias('block.data.details'),
  entity: Ember.computed.alias('block.entity'),
  message: '',
  polarityx: Ember.inject.service('polarityx'),
  results: '',
  submitAsPublic: false,
  tags: '',
  init() {
    if (!this.get('block._state')) {
      this.set('block._state', {});
      this.set('block._state.scanNotRun', true);
      this.set('block._state.isSubmitting', false);
      this.set('block._state.conflictingRunning', false);
    }
    this._super(...arguments);
  },
  actions: {
    submitUrl: function () {
      //Actually Trigger Scan
      this.set('message', 'Scanning');
      this.scan();

      this.set('block._state.errorMessage', '');
      this.set('block._state.isSubmitting', true);
      setTimeout(function () {
        document.getElementById('1').style.visibility = 'visible';
      }, 10);

      setTimeout(function () {
        document.getElementById('2').style.visibility = 'visible';
      }, 1000);

      setTimeout(function () {
        document.getElementById('3').style.visibility = 'visible';
      }, 2000);

      setTimeout(function () {
        document.getElementById('4').style.visibility = 'visible';
      }, 3000);

      setTimeout(function () {
        document.getElementById('5').style.visibility = 'visible';
      }, 4000);

      setTimeout(function () {
        document.getElementById('6').style.visibility = 'visible';
      }, 5000);

      setTimeout(function () {
        document.getElementById('7').style.visibility = 'visible';
      }, 6000);

      setTimeout(function () {
        document.getElementById('8').style.visibility = 'visible';
      }, 7000);
    },
    runOnDemandLookup: function () {
      this.polarityx.requestOnDemandLookup(
        this.get('scanResult').replace('http://nmap.org', '').replace(this.get('block.entity.value'), 'TARGET')
      );
    }
  },
  scan: function () {
    const payload = {
      action: 'scan',
      entity: this.get('block.entity.value')
    };

    this.sendIntegrationMessage(payload)
      .then((response) => {
        this.set('message', 'Displaying');
        this.set('scanResult', response.reply);
        this.set('showSuccessMessage', true);
      })
      .catch(function (err) {
        self.set('message', JSON.stringify(err, null, 2));
        this.set('message', 'Error');
      })
      .finally(() => {
        this.set('message', 'Complete');
        this.set('block._state.isSubmitting', false);
        this.set('block._state.scanNotRun', false);

        setTimeout(() => {
          if (!this.isDestroyed) {
            this.set('showSuccessMessage', false);
          }
        }, 2000);
      });
  }
});
