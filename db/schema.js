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
  property('userId', String);
  property('content', Text);
  property('desc', String);
  property('created_at', Date);
  property('updated_at', Date);
});

var User = define('User', function () {
	property('displayName', String);
  property('roleId', String);
	property('email', String, { index: true });
	property('googleId', String, { index: true });
	property('githubId', String, { index: true });
	property('signatureId', String, { index: true });
	property('linkedinId', String, { index: true });
	property('created_at', Date);
  property('updated_at', Date);
});

var Role = define('Role', function() {
  property('name', String);
  property('desc', String);
  property('created_at', Date);
  property('updated_at', Date);
});

var Comment = define('Comment', function () {
	property('content', Text);
  property('postId', String);
  property('userId', String);
  property('userName', String);
  property('flagged', Boolean);
  property('active', Boolean);
  property('created_at', Date);
  property('updated_at', Date);
});
