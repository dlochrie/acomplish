var app,
  compound,
  request = require('supertest'),
  sinon = require('sinon');

/** 
  TODO: Please Satisfy the following:
    Owners should be able to access any controller#action.
    If a User is an Owner, ACL should stop validation.
    Members of a certain Role should be able to access controller#action they specifically have.
    Members of a certain Role should be able to access controller#action if they have the wildcard in an array.
    Members of a certain Role should be able to access controller#action if they have the wildcard as a string.
    If a User does NOT have the Ability to access a certain controller#action, they should be Rejected.
    Actions should be combined, so that all the Abilities a User has in a certain controller will be added.
    If a Wildcard is encountered for a specific controller, it should replace the entire array with an Array (or String?) with the Wildcard.
*/

function UserStub() {
  return {
    displayName: 'Test User',
    email: 'owner@email.com'
  };
}