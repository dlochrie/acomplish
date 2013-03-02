a complish
=================

##Description  

A ***COMP*** LISH

Yes, I know, *acomplish* is misspelled, but it is really a combination of:

* __Comp__ ound.js
* Pub __lish__
* __accomplish__

##Goals

* Provide a working example of using CompoundJS as a Blog / CMS
* Provide a Role-Based Management System for Posts, Users, and Comments
* Provide a working example of using CompoundJS with PassportJS, and Google as a Provider
* Provide a working example of using Compound with MySQL through JugglingDB
* Provide working examples of making page views with multiple models, and balancing Async
with Synchronous functionality.
* Provide a working example of using Unit Tests and Functional Tests (through Selenium, or a plugin TBD)
* [Maybe] Provide a working example of using sockets (socket.io) for Realtime Web
* [Maybe] Provide an example/workflow for dropping in Themes for your application 

##Comments
The Models only work with MySQL right now... see [this post](https://groups.google.com/forum/?fromgroups=#!topic/compoundjs/YxcIOKEqM8w).
This has to do with `__cachedRelations`... It's frustrating, if you know of an elegant solution, let me know.  

Another way of handling this is seeing: [http://book.mixu.net/ch7.html](http://book.mixu.net/ch7.html), particularly section
7.2.1 Control flow pattern #1: Series. Mikito Takada has some really insightful documentation on the asynchronous nature of
Node, and how we might solve this problem (or work nicely with this feature :-)).  

*Update*: See method `getAssociated` the *application_controller* for a useful way or handling associations. Again, if you know of a more elegant solution, let me know.  

##Components

* [Compound.JS](http://compoundjs.com/) (formally known as Railway) is built on the [ExpressJS](http://expressjs.com/) framework.
* Templates are using [ejs](https://github.com/visionmedia/ejs).
* ORM is [Juggling DB](https://github.com/1602/jugglingdb).
* This example is using [Twitter Bootstrap](http://twitter.github.com/bootstrap/) throughout, but not through a plugin.

##Models

(Currently):

* __Posts__: { BelongsTo: [ Users ], HasMany: [ Comments ] }
* __Comments__: { BelongsTo: [ Posts, Users ] }
* __Users__: { HasMany: [ Comments, Posts ], HABTM: [ Roles (through Memberships) ] }
* __Roles__: { HABTM: [ Users (through Memberships) ]}
* __Memberships__: { BelongsTo: [ Posts, Roles ] }

Maybe more to come, including __Photos__.

##Install

*TODO:* Add more instructions for how to configure a cloned app. 

1. Clone Repo  
    `git clone [this repo url]`

2. Install Modules  
    `[sudo] npm install -l`

3. Create DB (See DB Setup Below)  
    `compound db migrate`

4. Run Server  
    `node server.js` *OR* `forever server.js`


DB Setup (mysql)
----------------

	mysql> CREATE DATABASE acomplish;
	mysql> GRANT ALL PRIVILEGES ON acomplish.* TO "dbuser"@"localhost" IDENTIFIED BY "dbpasswd";
	mysql> FLUSH PRIVILEGES; 
	mysql> EXIT  
	  
##Contribute

Let me know if you would like to participate, or fork/pull. 

