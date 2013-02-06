load('application');

before(loadPost, {only: ['show', 'edit', 'update', 'destroy']});
before(use('checkRole'));

action('new', function () {
		this.title = 'New post';
		this.post = new Post;
		render();
});

action(function create() {
	req.body.Post.created_at = new Date;
	req.body.Post.userId = session.passport.user;
	Post.create(req.body.Post, function (err, post) {
		if (err) {
			flash('error', 'Post can not be created');
			render('new', {
				post: post,
				title: 'New post'
			});
		} else {
			flash('info', 'Post created');
			redirect(path_to.admin_posts());
		}
	});
});

action(function index() {
	this.title = 'Posts index';
	Post.all(function (err, posts) {
		render({
			posts: posts
		});
	});
});

action(function show() {
	this.title = 'Post Management';
  var post = this.post;
	
  // TODO:
  // PLEASE SEE THE OTHER POSTS CONTROLLER FOR ASYNC STRUCTURE!
  
	var async = require('async');
	async.waterfall([
		function getAuthor(callback) {
			post.author(function(err, user) {
				callback(err,user)
			});
		},
	], function(err, result) {
		if (!err) {
			author = result;
			Comment.all({ where: { postId: params.id }, order: 'created_at' }, function(err, comments) {
				render({ comments: comments });
			});
		} else {
			redirect(path_to.posts());
		}
	});
});

action(function edit() {
	this.title = 'Post edit';
	render();
});

action(function update() {
	body.Post.updated_at = new Date;
	body.Post.userId = session.passport.user;
	this.post.updateAttributes(body.Post, function (err) {
		if (!err) {
			flash('info', 'Post updated');
			redirect(path_to.admin_post(this.post));
		} else {
			flash('error', 'Post can not be updated');
			this.title = 'Edit post details';
			render('edit');
		}
	}.bind(this));
});

action(function destroy() {
	this.post.destroy(function (error) {
		if (error) {
			flash('error', 'Can not destroy post');
		} else {
			flash('info', 'Post successfully removed');
		}
		send("'" + path_to.admin_posts() + "'");
	});
});

function loadPost() {
	Post.find(params.id, function (err, post) {
		if (err || !post) {
			redirect(path_to.admin_posts());
		} else {
			this.post = post;
			next();
		}
	}.bind(this));
}
