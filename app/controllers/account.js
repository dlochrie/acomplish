var Application = require('./application');

module.exports = AccountController;

function AccountController(init) {
  Application.call(this, init);
}

require('util').inherits(AccountController, Application);


AccountController.prototype.login = function login(c) {
  c.render({title: "Login"});
}

AccountController.prototype.logout = function logout(c) {
  c.req.logOut();
  c.session.user = false;
  c.flash('info', 'You are now logged out.');
  c.redirect('/'); 
}

AccountController.prototype.register = function register(c) {
  this.title = 'Create New Local Account';
  this.user = new c.User;
  c.render();
}

AccountController.prototype.create = function create(c) {
  var user = c.req.body.User;
  user.created_at = new Date; // Should SQL/Redis Default this date?
  user.updated_at = new Date; // Should SQL/Redis Default this date?
  c.User.create(user, function (err, user) {
    c.respondTo(function (format) {
      format.json(function () {
        if (err) {
          c.send({
            code: 500,
            error: user && user.errors || err
          });
        } else {
          c.send({
            code: 200,
            data: user.toObject()
          });
        }
      });
      format.html(function () {
        if (err) {
          c.flash('error', 'The account cannot be created. Please try again');
          c.render('register', {
            user: user,
            title: 'Create New Local Account'
          });
        } else {
          c.flash('info', 'Account created');
          c.redirect(c.pathTo.root);
        }
      });
    });
  });
}