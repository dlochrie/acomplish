$(document).ready(function() {
	app._token = $('meta[name="csrf-token"]').attr('content');

	$('table.comments i.icon-flag').on('click', function(e) {
		e.preventDefault();
		var self = this;
		var id = $(self).closest('tr').attr('id');
		$.post('/admin/comments/' + id + '/unflag', { authenticity_token: app._token, Comment: { flagged: false } })
			.done(function(data) { $(self).closest('td').html('<em>False</em>'); })
	})
});