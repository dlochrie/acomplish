module.exports = {
	toHumanDate: function (date) {
		if (!date) return 'N/A';
		try { date = date.toUTCString();	} catch (e) {}
		return date;
	},

	toShortDate: function (date) {
		if (!date) return 'N/A';
		try { date = date.toLocaleDateString();	} catch (e) {}
		return date;	
	}
};