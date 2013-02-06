load('application');
before(last_five_comments, {only: ['index']});


action('index', function () {
    this.title = 'Testing Site Home Page';   
    Post.all({order: 'created_at desc'}, function (err, posts) {
      render({
        posts: posts  
      });
    });
});

action('about', function() {
	this.title = 'about this site';
	render();
});

action('contact', function() {
	this.title = 'contact us';
	render();
});

function last_five_comments() {
  Comment.all({ order: 'created_at desc', limit: 5 }, function (err, comments) {
    if (err || !comments) {
      this.comments = null;
      next();
    } else {
      this.comments = comments;
      next();
    }
  }.bind(this));
}
