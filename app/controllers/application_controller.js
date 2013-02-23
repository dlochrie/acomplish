before('protect from forgery', function () {
  protectFromForgery('4f66d4b797766cca9acefbc03891493c2b60366f');
});

before(loadPassport);

publish('loadAuthor', loadAuthor);

function loadPassport() {
	this.userName = null;
	this.userId = null;
	if (session.passport.user) {		
		User.find(session.passport.user, function(err, user) {
			if (!err || user) {
        this.userName = user.displayName;
				this.userId = user.id;
        next();
      }
		}.bind(this));
	} else {
		next();
	}
}

/**
 * Convienience method for loading Author, Posts and Comments
 */
function loadAuthor() {
	this.author = null;
	if (this.userId)
		this.author = { name: this.userName, id: this.userId };
	next();
}