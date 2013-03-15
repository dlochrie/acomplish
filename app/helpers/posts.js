module.exports = {
	fix: function () {
		console.log("helper", this);
		var content = this;
		content=content.replace(/<\s*br\/*>/gi, "\n"); // Replace breaks with new lines
		content=content.replace(/\n+\s*/gi, "\n"); // More than one new-line chars equals 1 new-lines
		content=content.replace(/\n+\s*/gi, "\n\n"); // More than one new-line chars equals 2 new-lines
		content=content.replace(/ {2,}/gi, " "); // 2 (or more) spaces equals a space - trim
		content=content.replace(/(.*?)\n/g, "<p>$1</p>\n"); // If text is ends in new line, then wrap in <p>
		return content;
	}
};