before('protect from forgery', function () {
  protectFromForgery('4f66d4b797766cca9acefbc03891493c2b60366f');
});

before(loadUser);

function loadUser() {
	this.userName = null;
	if (session.passport.user) {		
		User.find(session.passport.user, function(err, user) {
			if (!err || user) {
        this.userName = user.displayName;
        next();
      }
		}.bind(this));
	} else {
		next();
	}
}

