import { moduleForModel, test } from 'ember-qunit';

moduleForModel('management-application', 'Unit | Serializer | management application', {
  // Specify the other units that are required for this test.
  needs: ['serializer:management-application']
});

// Replace this with your real tests.
test('it serializes records', function(assert) {
  var record = this.subject();

  var serializedRecord = record.serialize();

  assert.ok(serializedRecord);
});
