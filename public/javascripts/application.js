var app = {};

$(document).ready(function() {
	app._token = $('meta[name="csrf-token"]').attr('content');

	$('div.comment a.flag').on('click', function(e) {
		e.preventDefault();
		var self = this;
		var id = $(self).attr('data-id');
		$('#flag-comment-modal').modal({ show: true, remote: '/comments/' + id + '/flag_form' });
	});

	$('#flag-comment-submit').on('click', function(e) {
		e.preventDefault();	
		var fields = $('#flag-comment-form').serializeArray();
		var comment = {};
		var token;
		$(fields).each(function(k, v) {
			var name = v.name;
			var val = v.value;
			if (name === 'authenticity_token') return token = val;
			comment[name] = val;
		});
		var params = { authenticity_token: token, Comment: comment };
		$.post('/comments/' + comment.id + '/flag', params)
			.done(function(data) { app.toggleCommentFlag(comment.id); })
			.fail(function(err) { /* TODO: handle error */ })
			.always($('#flag-comment-modal').modal('hide'))
	});
});

app.toggleCommentFlag = function(id) {
	$('div#comment-' + id + ' span.comment-status')
		.html('<i class="icon-flag icon-white"></i></span>')
		.addClass('badge badge-important');
}