import Ember from 'ember';
import NeedsDeploymentMixin from "../../mixins/needs-deployment-mixin";
import {
  AllValidator,
  PresenceValidator,
  AlphaNumericDashUnderscoreValidator
} from '../../utils/validators';

export default Ember.Controller.extend(NeedsDeploymentMixin, {

  deployments: Ember.computed.alias('applicationController.model'),
  selectedRhevEngine: Ember.computed.alias("deploymentController.model.discovered_host"),
  rhevIsSelfHosted: Ember.computed.alias("deploymentController.model.rhev_is_self_hosted"),

  hostNamingScheme: Ember.computed.alias("deploymentController.model.host_naming_scheme"),
  customPreprendName: Ember.computed.alias("deploymentController.model.custom_preprend_name"),

  namingOptions: ['Freeform', 'MAC address', 'hypervisorN', 'Custom scheme'],

  isFreeform: Ember.computed('hostNamingScheme', function() {
    return (this.get('hostNamingScheme') === 'Freeform');
  }),

  isMac: Ember.computed('hostNamingScheme', function() {
    return (this.get('hostNamingScheme') === 'MAC address');
  }),

  isCustomScheme: Ember.computed('hostNamingScheme', function() {
    return (this.get('hostNamingScheme') === 'Custom scheme');
  }),

  isHypervisorN: Ember.computed('hostNamingScheme', function() {
    return (this.get('hostNamingScheme') === 'hypervisorN');
  }),

  availableHosts: Ember.computed('deployingHosts', 'allDiscoveredHosts.[]', 'hypervisorModelIds.[]', function() {
    let allDiscoveredHosts = this.get('allDiscoveredHosts');

    if (Ember.isEmpty(allDiscoveredHosts)) {
      return [];
    }

    let deployingHosts = this.get('deployingHosts');

    return allDiscoveredHosts.filter(host => {
      let hostId = host.get('id');
      let isEngine = hostId === this.get('selectedRhevEngine.id');
      let isDeploying = deployingHosts.any(deployingHost => deployingHost.get('id') === hostId);

      return !isEngine && !isDeploying;
    });
  }),

  // same as Engine. TODO. put it mixin
  filteredHosts: Ember.computed('availableHosts.[]', 'searchString', 'isStarted', function(){
    var searchString = this.get('searchString');
    var rx = new RegExp(searchString, 'gi');
    var availableHosts = this.get('availableHosts');

    if (this.get('isStarted')) {
      return this.get('model');
    } else if (availableHosts.get('length') > 0) {
      return availableHosts.filter(function(record) {
        return record.get('name').match(rx) ||
          record.get('memory_human_size').match(rx) ||
          record.get('disks_human_size').match(rx) ||
          record.get('subnet_to_s').match(rx) ||
          record.get('mac').match(rx);
      });
    } else {
      return availableHosts;
    }
  }),

  hypervisorModelIds: Ember.computed('model.[]', 'selectedRhevEngine', function() {
    if (this.get('model')) {
      var allIds = this.get('model').getEach('id');
      return allIds.removeObject(this.get('selectedRhevEngine').get('id'));
    } else {
      return [];
    }
  }),

  cntSelectedHypervisorHosts: Ember.computed.alias('hypervisorModelIds.length'),

  hostInflection: Ember.computed('cntSelectedHypervisorHosts', function() {
    return this.get('cntSelectedHypervisorHosts') === 1 ? 'host' : 'hosts';
  }),

  isAllChecked: Ember.computed('availableHosts.[]', 'cntSelectedHypervisorHosts', function() {
    return (this.get('cntSelectedHypervisorHosts') === this.get('availableHosts.length'));
  }),

  hypervisorBackRouteName: Ember.computed('rhevIsSelfHosted', function() {
    if (this.get('rhevIsSelfHosted')) {
      return 'rhev-setup';
    } else {
      return 'engine.discovered-host';
    }
  }),

  hostnameValidity: Ember.Object.create({
    updated: Date.now(),
    state: Ember.Object.create()
  }),
  disableNextOnHypervisor: Ember.computed(
    'hypervisorModelIds',
    'hostnameValidity.updated',
    function() {
      if(this.get('hypervisorModelIds').get('length') === 0) {
        return true;
      }

      let vState = this.get('hostnameValidity').get('state');
      let trackedHostIds = Object.keys(vState);
      return trackedHostIds.length === 0 ||
        !trackedHostIds
          .filter((hostId) => this.get('hypervisorModelIds').contains(hostId))
          .map((k) => vState.get(k))
          .reduce((previousAreTrue, currentValue) => previousAreTrue && currentValue, true);
    }
  ),

  customPrefixValidator: AllValidator.create({
    validators: [
      PresenceValidator.create({}),
      AlphaNumericDashUnderscoreValidator.create({})
    ]
  }),

  actions: {

    setCheckAll() {
      this.get('model').setObjects([]);
      this.get('model').addObjects(this.get('availableHosts'));
    },

    setUncheckAll() {
      this.get('model').setObjects([]);
    },

    openNamingSchemeModal() {
      this.set('openModalNamingScheme', true);
    },

    cancelNamingScheme() {
      this.get('deploymentController.model').rollbackAttributes();
    },

    saveNamingScheme() {
      this.get('deploymentController.model').save();
    },

    setIfHostnameInvalid(isInvalid, hostId) {
      this.get('hostnameValidity').get('state').set(hostId, !isInvalid);
      this.get('hostnameValidity').set('updated', Date.now());
    },
    setSelectValue(fieldName, selectionValue) {
      this.get('deploymentController').set(fieldName, selectionValue);
    }
  }
});
