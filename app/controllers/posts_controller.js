load('application');

before(loadPost, {only: ['show']});

action(function index() {
  this.title = 'Posts index';
  Post.all(function (err, posts) {
    render({
      posts: posts
    });
  });
});

action(function show() {
  this.title = this.post.title;
  var post = this.post;
  
  var viewModel = { post: post, comment: new Comment, commentor: null,
    author: null };
    
  var async = require('async');
  
  async.waterfall([
    function getAuthor(callback) {
      post.author(function(err, user) {
        if (err || !user) { callback(err); }
        if (user) { viewModel.author = user };
      });
      callback(null);
    },
    function getCommentor(callback) {
      if (session.passport.user) {
        User.find(session.passport.user, function (err, commentor) {
          if (err) { callback(err); }
          if (commentor) { viewModel.commentor = commentor; }
        });
      }
      callback(null);
    }
  ], function(err) {
    if (!err) {
      Comment.all({ where: { postId: params.id }, order: 'created_at' }, function(err, comments) {        
        viewModel.comments = comments || null;
        render({ viewModel: viewModel });
      });
    } else {
      redirect(path_to.posts());
    }
  });
});

function loadPost() {
  Post.find(params.id, function (err, post) {
    if (err || !post) {
      redirect(path_to.posts());
    } else {
      this.post = post;
      next();
    }
  }.bind(this));
}