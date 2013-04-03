module.exports = function (compound) {
	return [
		'ejs-ext',
		'jugglingdb',
		'seedjs',
		'co-assets-compiler'
	].map(require);
};

