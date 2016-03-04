import Ember from 'ember';

export default Ember.Component.extend({

  classNames: ['row'],

  deleteEnabled: true,

  label: Ember.computed('node', 'ports', function() {
    let node = this.get('node');
    let macAddress = node ? node.getMacAddress(this.get('ports')): null;
    return macAddress || node.get('id');
  }),

  safeLabel: Ember.computed('label', function() {
    let label = this.get('label');
    return label ? label.replace(/[^A-Z0-9]/ig, '') : '';
  }),

  status: Ember.computed('node', function() {
    if (this.get('node.last_error')) {
      return 'Error';
    }

    if (Ember.isPresent(this.get('node.provision_state'))) {
      return 'node.provision_state';
    }

    return 'Free';
  }),

  powerOn: Ember.computed('node.power_state', function() {
    return this.get('node.power_state') === 'power on';
  }),

  introspectionTask: Ember.computed('node', 'introspectionTasks.@each', function() {
    return this.get('node').getIntrospectionTask(this.get('introspectionTasks'));
  }),

  foremanTask: Ember.computed('introspectionTasks.@each', 'foremanTasks.@each', function() {
    return this.get('node').getForemanTask(this.get('introspectionTasks'), this.get('foremanTasks'));
  }),

  isNodeReady: Ember.computed('node.properties.cpu', 'node.properties.memory_mb', 'node.properties.local_gb', function() {
    return this.get('node.ready');
  }),

  isNodeInspecting: Ember.computed('node.ready', 'foremanTask', 'foremanTask.state', 'foremanTask.result', function() {
    return !this.get('node.ready') &&
      this.get('foremanTask') &&
      this.get('foremanTask.state') === 'running' &&
      this.get('foremanTask.result') === 'pending';
  }),

  isNodeError: Ember.computed('isNodeReady', 'isNodeInspecting', 'foremanTask', 'foremanTask.state', 'foremanTask.result', function() {
    return !this.get('isNodeReady') && !this.get('isNodeInspecting') && this.get('foremanTask.result') === 'error';
  }),

  progressWidth: Ember.computed('foremanTask.progress', function() {
    let progressPercent = Math.floor((parseFloat(this.get('foremanTask.progress')) || 0) * 100);
    return `${progressPercent}%`;
  }),

  progressBarClass: Ember.computed('isNodeError', function() {
    if (this.get('isNodeError')) {
      return 'progress-bar progress-bar-danger osp-node-progress-bar';
    }
    return 'progress-bar osp-node-progress-bar';
  }),


  actions: {
    onDeleteClicked() {
      this.sendAction('deleteNode', this.get('node'), this.get('label'));
    }
  }

});
