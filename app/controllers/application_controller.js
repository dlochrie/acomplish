before('protect from forgery', function () {
	protectFromForgery('d388bac434929f9d4b5720e5cce934dbda710978');
});

before(loadUser);

publish('checkRole', checkRole);

function loadUser() {
	this.userName = null;
	if (session.passport.user) {		
		User.find(session.passport.user, function(err, user) {
			if (!err || user) {
        this.userName = user.displayName;
				/**
				 * Since Railway Passport is creating our Users for us,
				 * to include any other fields, we will check on first
				 * login. Non-elegant...
				 */ 

				if (user.created_at == null) {
					user.created_at = new Date;
					user.updated_at = new Date;
					user.roleId = 2; // Static, really bad
					user.save();
				}
        next();
      }
		}.bind(this));
	} else {
		next();
	}
}

function checkRole() {
  // Should check if the role is sufficient to Create/Update/Delete
  // Allowed Roles should be set in an array somewhere
  // TODO: THIS SHOULD CHECK FOR ROLE OF ADMIN!!!!
  if (session.passport.user) {
    User.find(session.passport.user, function(err, user) {
      if (!err) {
        next();
      } else {
        flash('error', 'You are not authorized for this action.');
        redirect('/');
      }
    });
  } else {
    flash('error', 'You are not authorized for this action.');
    redirect('/');
  }
}
