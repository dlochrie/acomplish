before('protect from forgery', function () {
  protectFromForgery('4f66d4b797766cca9acefbc03891493c2b60366f');
});

before(loadPassport);

publish('loadAuthor', loadAuthor);
publish('getAssociated', getAssociated);

function loadPassport() {
	this.userName = false;
	this.userId = false;
	this._loggedIn = false;
	if (session.passport.user) {
		User.find(session.passport.user, function(err, user) {
			if (!err || user) {
        this.userName = user.displayName;
				this.userId = user.id;
				this._loggedIn = true;
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

function getAssociated(models, assoc, multi, modelName, cb) {
	var results = [];
	
	function async(model, assoc, callback) {		
		model = (multi) ? model[modelName] : model;
		model[assoc](function (err, assoc) {
			callback(assoc);
		})
	}
	
	function series(model) {
		if (model) {
			async(model, assoc, function (result) {
				var obj = {};
				
				if (!multi) 
					obj[modelName] = model;
				else
					obj = model;
					
				obj[String(assoc)] = result;
				results.push(obj);
				return series(models.shift());
			});
		} else {
			return cb(results);
		}
	}
	
	series(models.shift());
}