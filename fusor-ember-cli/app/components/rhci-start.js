import Ember from 'ember';

export default Ember.Component.extend({

  classNames: ['rhci-start-block'],

  setIsDisabledCfmeAndOpenshift: Ember.observer('isRhev', 'isOpenStack', function() {
    if (this.get('isRhev')) {
      this.set('isDisabledOpenShift', false);
      this.set('isDisabledCfme', false);
    } else if (this.get('isOpenStack')) {
      this.set('isDisabledOpenShift', true);
      this.set('isDisabledCfme', false);
      this.set('isOpenShift', false);
    } else {
      this.set('isOpenShift', false);
      this.set('isCloudForms', false);
      this.set('isDisabledOpenShift', true);
      this.set('isDisabledCfme', true);
    }
  }),

  reqDownloadLink: Ember.computed('isRhev', 'isOpenStack', 'isCloudForms', 'isOpenShift', function() {
    //TODO - (tech debt) Could be handled server-side. Rails could generate a text file using a template.
    //       This is the least impactful approach since we can just refer to different static files and
    //       and not require new routes and templates this close to release.
    let filenameArray = ['QCI_Requirements'];
    if (this.get('isRhev')) {
      filenameArray.push('rhv');
    }
    if (this.get('isOpenStack')) {
      filenameArray.push('osp');
    }
    if (this.get('isCloudForms')) {
      filenameArray.push('cfme');
    }
    if (this.get('isOpenShift')) {
      filenameArray.push('ose');
    }

    let filename = filenameArray.join('_');
    return `/fusor_ui/files/${filename}.txt`;
  }),

  // tagline names
  taglineRhev: "for Traditional Workloads",
  taglineOpenStack: "for Cloud Workloads",
  taglineCloudForms: "for Hybrid Cloud Management",
  taglineOpenShift: "for Private Platform as a Service",

  // desc
  descRhev: 'Complete enterprise virtualization management for servers and desktops on the same infrastructure',
  descOpenStack: 'Flexible, secure foundations to build a massively scalable private or public cloud',
  descCloudForms: 'Manage your virtual, private, and hybrid cloud infrastructures',
  descOpenShift: 'Develop, host, and scale applications in a cloud environment',

  actions: {
    saveAndCancelDeployment() {
      this.get('targetObject').send('saveAndCancelDeployment');
    },

    cancelAndDeleteDeployment() {
      this.get('targetObject').send('cancelAndDeleteDeployment');
    },

    cancelAndRollbackNewDeployment() {
      this.get('targetObject').send('cancelAndRollbackNewDeployment');
    }
  }
});
