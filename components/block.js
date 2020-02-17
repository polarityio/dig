polarity.export = PolarityComponent.extend({
  details: Ember.computed.alias('block.data.details'),
  activeTab: 'authority',
  init: function(){
    this._super(...arguments);
    if(this.details.answer){
      this.set('activeTab', 'answer');
    }else if(this.details.authority){
      this.set('activeTab', 'authority');
    }else{
      this.set('activeTab', 'headers');
    }
  },
  actions: {
    changeTab: function(tabName) {
      this.set('activeTab', tabName);
    }
  },
  timezone: Ember.computed('Intl', function() {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  })
});
