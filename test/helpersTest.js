const { assert } = require('chai');

const { checkData } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "sarah@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('checkData', function() {
  it('should return a user with a valid email', () => {
    const user = checkData('sarah@example.com', testUsers);
    assert.equal(user, testUsers.userRandomID);
  });
  it('should return undefined when the email doesn\'t exist', () => {
    const user = checkData('ghostperson@example.com', testUsers);
    assert.equal(user, undefined);
  });
});