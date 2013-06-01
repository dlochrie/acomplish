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

