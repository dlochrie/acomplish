load('application');

var getAssociated = use('getAssociated');

action(function index() {
	this.title = 'Comments index';
	Comment.all({ include: ['author', 'post']}, function (err, comments) {
		getAssociated(comments, 'author', false, 'comment', function (results) {
			getAssociated(results, 'post', true, 'comment', function (results) {
				switch (params.format) {
					case "json":
						send({
							code: 200,
							data: results
						});
						break;
					default:
						render({
							results: results
						});
				}
			})
		});
	});
});