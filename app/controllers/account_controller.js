load('application');


action('login', function () {
  render({
    title: "Login"
  });
});

action('logout', function() {
  req.logOut();
  session.user = false;
  flash('info', 'You are now logged out.');
  redirect('/'); 
});

action('register', function () {
  this.title = 'Create New Local Account';
  this.user = new User;
  render();
});

action('create', function() {
  var user = req.body.User;
  user.created_at = new Date; // Should SQL/Redis Default this date?
  user.updated_at = new Date; // Should SQL/Redis Default this date?
  User.create(user, function (err, user) {
    respondTo(function (format) {
      format.json(function () {
        if (err) {
          send({
            code: 500,
            error: user && user.errors || err
          });
        } else {
          send({
            code: 200,
            data: user.toObject()
          });
        }
      });
      format.html(function () {
        if (err) {
          flash('error', 'The account cannot be created. Please try again');
          render('register', {
            user: user,
            title: 'Create New Local Account'
          });
        } else {
          flash('info', 'Account created');
          redirect(pathTo.root);
        }
      });
    });
  });
});