var app,
  compound,
  request = require('supertest'),
  sinon = require('sinon');

/** 
 * TODO: User CREATION and EDITs should be tested, with PASSPORT
 * functionality.
 */
function UserStub() {
  return {
    displayName: '',
    email: ''
  };
}

describe('UserController', function () {
  beforeEach(function (done) {
    app = getApp();
    compound = app.compound;
    compound.on('ready', function () {
      done();
    });
  });

  /**
   * GET /users
   * Should render users/index.ejs
   */
  it('should render "index" template on GET /users', function (done) {
    request(app)
      .get('/users')
      .end(function (err, res) {
        res.statusCode.should.equal(200);
        app.didRender(/users\/index\.ejs$/i).should.be.true;
        done();
      });
  });

  /*
   * GET /users/:id/edit
   * Should access User#find and render users/edit.ejs
   */

  /*****************************************************************************
   * This Feature is not exposed to Users yet, so the test is disabled.
  it(
    'should access User#find and render "edit" template on GET /users/:id/edit',
    function (done) {
      var User = app.models.User;

      // Mock User#find
      User.find = sinon.spy(function (id, callback) {
        callback(null, new User);
      });

      request(app)
        .get('/users/42/edit')
        .end(function (err, res) {
          res.statusCode.should.equal(200);
          User.find.calledWith('42').should.be.true;
          app.didRender(/users\/edit\.ejs$/i).should.be.true;

          done();
        });
    });
*****************************************************************************/

  /*
   * GET /users/:id
   * Should render users/index.ejs
   */
  it('should access User#find and render "show" template on GET /users/:id',
    function (done) {
      var User = app.models.User;

      // Mock User#find
      User.find = sinon.spy(function (id, callback) {
        callback(null, new User);
      });

      request(app)
        .get('/users/42')
        .end(function (err, res) {
          res.statusCode.should.equal(200);
          User.find.calledWith('42').should.be.true;
          app.didRender(/users\/show\.ejs$/i).should.be.true;

          done();
        });
    });

});