/**
 * This should be called as Connect middleware, and 
 * extends the underlying CompoundJS framework.
 */
var dir = './config/acomplish/',
	files = require('fs').readdirSync(dir),
	cjson = require('cjson');

exports.init = function () {
	return function init(req, res, next) {
		var env = app.settings.env;
		var acomplish = {};
		files.forEach(function(conf) {
			var name = conf.replace(/\.[^/.]+$/, ""),
				data = cjson.load(dir + conf);
			if (name === 'settings') {
				acomplish[name] = data;
			} else {
				acomplish[name] = data[env];
			}
		});
		app.acomplish = acomplish;
		next(); 
	}.bind(this)
}