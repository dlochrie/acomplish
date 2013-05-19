/**
 * This should be called as Connect middleware, and 
 * extends the underlying CompoundJS framework.
 */
var dir = './config/acomplish/',
	files = require('fs').readdirSync(dir),
	cjson = require('cjson');

exports.init = function (compound) {
	var env = compound.app.settings.env;
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

	compound.acomplish = acomplish;
	return compound;
}