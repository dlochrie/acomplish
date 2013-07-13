var Application = require('./application'),
  Authorization = require('./authorization');


// Expose `Admin Controller`
module.exports = Admin;


/**
 * @param {Object} init Initial bootstrap object for Contollers.
 * @constructor
 */
function Admin(init) {
  Application.call(this, init);
  Authorization.call(this, init);

  init.before(function authorize(ctl) {
    Authorization.authorize(ctl)
  });
};


// Extends `Application` Controller
require('util').inherits(Admin, Application);


Admin.prototype.index = function index(c) {
  c.render({title: "Dashboard"});
};