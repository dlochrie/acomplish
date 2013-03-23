/*
 db/schema.js contains database schema description for application models
 by default (when using jugglingdb as ORM) this file uses database connection
 described in config/database.json. But it's possible to use another database
 connections and multiple different schemas, docs available at

 http://railwayjs.com/orm.html

 Example of model definition:

 define('User', function () {
     property('email', String, { index: true });
     property('password', String);
     property('activated', Boolean, {default: false});
 });

 Example of schema configured without config/database.json (heroku redistogo addon):
 schema('redis', {url: process.env.REDISTOGO_URL}, function () {
     // model definitions here
 });

*/
var Post = define('Post', function() {
	property('title', String);
	property('body', Text);
	property('desc', String);
	property('created_at', Date);
	property('updated_at', Date);
	set('restPath', pathTo.posts);
});

var User = define('User', function () {
	property('displayName', String);
	property('email', String, { index: true });
	property('googleId', String, { index: true });
	property('githubId', String, { index: true });
	property('signatureId', String, { index: true });
	property('linkedinId', String, { index: true });
	property('created_at', Date);
 	property('updated_at', Date);
	set('restPath', pathTo.users);
});

var Role = define('Role', function() {
	property('name', String);
	property('desc', Text);
	property('created_at', Date);
	property('updated_at', Date);
});

var Membership = define('Membership', function() {
	property('created_at', Date);
	property('updated_at', Date);
	set('restPath', pathTo.memberships);
});

var Comment = define('Comment', function () {	
	property('body', Text);	
	property('displayName', String);
	property('active', Boolean);
	property('flagged', Boolean);
	property('reason', String);
	property('created_at', Date);
	property('updated_at', Date);
	set('restPath', pathTo.comments);
});
