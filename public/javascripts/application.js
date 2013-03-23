
/*
  Add your application's coffee-script code here
*/

var app = {};

$(document).ready(function() {
	app._token = $('meta[name="csrf-token"]').attr('content');

	$('div.comment a.flag').on('click', function(e) {
		e.preventDefault();
		var self = this;
		var id = $(self).attr('data-id');
		$.post('/comments/' + id + '/flag', { authenticity_token: app._token, Comment: { flagged: true } })
			.done(function(data) { $(self).html('<span class="pull-right badge badge-important comment">' +
				'<i class="icon-flag icon-white"></i></span>'); })
	})
});