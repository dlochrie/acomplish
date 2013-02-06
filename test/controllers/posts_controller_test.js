require('../test_helper.js').controller('posts', module.exports);

var sinon  = require('sinon');

function ValidAttributes () {
    return {
        title: '',
        content: '',
        desc: ''
    };
}

exports['posts controller'] = {

    'GET new': function (test) {
        test.get('/posts/new', function () {
            test.success();
            test.render('new');
            test.render('form.' + app.set('view engine'));
            test.done();
        });
    },

    'GET index': function (test) {
        test.get('/posts', function () {
            test.success();
            test.render('index');
            test.done();
        });
    },

    'GET edit': function (test) {
        var find = Post.find;
        Post.find = sinon.spy(function (id, callback) {
            callback(null, new Post);
        });
        test.get('/posts/42/edit', function () {
            test.ok(Post.find.calledWith('42'));
            Post.find = find;
            test.success();
            test.render('edit');
            test.done();
        });
    },

    'GET show': function (test) {
        var find = Post.find;
        Post.find = sinon.spy(function (id, callback) {
            callback(null, new Post);
        });
        test.get('/posts/42', function (req, res) {
            test.ok(Post.find.calledWith('42'));
            Post.find = find;
            test.success();
            test.render('show');
            test.done();
        });
    },

    'POST create': function (test) {
        var post = new ValidAttributes;
        var create = Post.create;
        Post.create = sinon.spy(function (data, callback) {
            test.strictEqual(data, post);
            callback(null, post);
        });
        test.post('/posts', {Post: post}, function () {
            test.redirect('/posts');
            test.flash('info');
            test.done();
        });
    },

    'POST create fail': function (test) {
        var post = new ValidAttributes;
        var create = Post.create;
        Post.create = sinon.spy(function (data, callback) {
            test.strictEqual(data, post);
            callback(new Error, post);
        });
        test.post('/posts', {Post: post}, function () {
            test.success();
            test.render('new');
            test.flash('error');
            test.done();
        });
    },

    'PUT update': function (test) {
        Post.find = sinon.spy(function (id, callback) {
            test.equal(id, 1);
            callback(null, {id: 1, updateAttributes: function (data, cb) { cb(null); }});
        });
        test.put('/posts/1', new ValidAttributes, function () {
            test.redirect('/posts/1');
            test.flash('info');
            test.done();
        });
    },

    'PUT update fail': function (test) {
        Post.find = sinon.spy(function (id, callback) {
            test.equal(id, 1);
            callback(null, {id: 1, updateAttributes: function (data, cb) { cb(new Error); }});
        });
        test.put('/posts/1', new ValidAttributes, function () {
            test.success();
            test.render('edit');
            test.flash('error');
            test.done();
        });
    },

    'DELETE destroy': function (test) {
        test.done();
    },

    'DELETE destroy fail': function (test) {
        test.done();
    }
};

