var app = getApp(),
  compound = app.compound,
  controller = require('../../app/controllers/authorization_controller');

describe('AuthorizationController', function() {

  beforeEach(function (done) {
    app = getApp();
    compound = app.compound;
    compound.on('ready', function () {
      done();
    });
  });

  it('should reject an authorized user', function (done) {
    var req = {actionName: 'index', controllerName: 'admin'};
    var locals = {
      user: {owner: false}, 
      loggedIn: true
    };

    this.compound = compound;
    //var c = compound.controllerBridge.getInstance.
    call(this, 'AuthorizationController');
  });

  it('should always authorize an owner', function (done) {
    /*
    var req = {actionName: 'index', controllerName: 'admin'};
    var locals = {
      user: {owner: true}, 
      loggedIn: true
    };

    controller._buffer.authorize.call(this, req, function() {
      throw('This User is Unauthorized')
    });
    */
    done();
  });

});