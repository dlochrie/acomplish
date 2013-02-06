require('../test_helper.js').controller('users', module.exports);

var sinon  = require('sinon');

function ValidAttributes () {
    return {
        name: '',
        createdAt: ''
    };
}

exports['users controller'] = {

    'GET new': function (test) {
        test.get('/users/new', function () {
            test.success();
            test.render('new');
            test.render('form.' + app.set('view engine'));
            test.done();
        });
    },

    'GET index': function (test) {
        test.get('/users', function () {
            test.success();
            test.render('index');
            test.done();
        });
    },

    'GET edit': function (test) {
        var find = User.find;
        User.find = sinon.spy(function (id, callback) {
            callback(null, new User);
        });
        test.get('/users/42/edit', function () {
            test.ok(User.find.calledWith('42'));
            User.find = find;
            test.success();
            test.render('edit');
            test.done();
        });
    },

    'GET show': function (test) {
        var find = User.find;
        User.find = sinon.spy(function (id, callback) {
            callback(null, new User);
        });
        test.get('/users/42', function (req, res) {
            test.ok(User.find.calledWith('42'));
            User.find = find;
            test.success();
            test.render('show');
            test.done();
        });
    },

    'POST create': function (test) {
        var user = new ValidAttributes;
        var create = User.create;
        User.create = sinon.spy(function (data, callback) {
            test.strictEqual(data, user);
            callback(null, user);
        });
        test.post('/users', {User: user}, function () {
            test.redirect('/users');
            test.flash('info');
            test.done();
        });
    },

    'POST create fail': function (test) {
        var user = new ValidAttributes;
        var create = User.create;
        User.create = sinon.spy(function (data, callback) {
            test.strictEqual(data, user);
            callback(new Error, user);
        });
        test.post('/users', {User: user}, function () {
            test.success();
            test.render('new');
            test.flash('error');
            test.done();
        });
    },

    'PUT update': function (test) {
        User.find = sinon.spy(function (id, callback) {
            test.equal(id, 1);
            callback(null, {id: 1, updateAttributes: function (data, cb) { cb(null); }});
        });
        test.put('/users/1', new ValidAttributes, function () {
            test.redirect('/users/1');
            test.flash('info');
            test.done();
        });
    },

    'PUT update fail': function (test) {
        User.find = sinon.spy(function (id, callback) {
            test.equal(id, 1);
            callback(null, {id: 1, updateAttributes: function (data, cb) { cb(new Error); }});
        });
        test.put('/users/1', new ValidAttributes, function () {
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

