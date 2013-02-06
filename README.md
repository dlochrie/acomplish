a complish
=================

##Description  

A ***COMP*** LISH

Yes, I know, *a complish* is misspelled, but it is really a combination of:

* **Comp**ound.js
* Pub**lish**

##Goals

* Provide a working example of using CompoundJS as a Blog / CMS
* Provide a Role-Based Management System for Posts, Users, and Comments
* Provide a working example of using CompoundJS with PassportJS, and Google as a Provider
* Provide a working example of using Compound with MySQL through JugglingDB
* Provide working examples of making page views with multiple models, and balancing Async
with Synchronous functionality.
* Provide a working example of using Unit Tests and Functional Tests (through Selenium, or a plugin TBD)
* Provide a working example of using sockets (socket.io) for Realtime Web

##Components

* [Compound.JS](http://compoundjs.com/) (formally known as Railway) is built on the [ExpressJS](http://expressjs.com/) framework.
* Templates are using [ejs](https://github.com/visionmedia/ejs).
* ORM is [Juggling DB](https://github.com/1602/jugglingdb).
* This example is using [Twitter Bootstrap](http://twitter.github.com/bootstrap/) throughout, but not through a plugin.

##Install

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
