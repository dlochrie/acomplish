a complish
=================

##Description  

A ***COMP*** LISH

Yes, I know, *acomplish* is misspelled, but it is really a combination of:

* __Comp__ ound.js
* Pub __lish__

Compound + Publish = __acomplish__

##Goals

<table>
	<thead>
		<tr>
			<td>Goal</td>
			<td>Status</td>
			<td>Notes</td>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>Provide a working example of using CompoundJS as a Blog / CMS</td>
			<td>In Progress</td>
			<td>Much to Do</td>
		</tr>
		<tr>
			<td>Provide a Role-Based Management System for Posts, Users, and Comments</td>
			<td>It does this, kinda</td>
			<td>Much to Do</td>
		</tr>
		<tr>
			<td>Provide a working example of using CompoundJS with PassportJS, and Google as a Provider</td>
			<td>Working</td>
			<td>Need to add more providers, and mechanism for configuring these per each environment.</td>
		</tr>
		<tr>
			<td>Provide a working example of using Compound with MySQL through JugglingDB</td>
			<td>Working</td>
			<td></td>
		</tr>
		<tr>
			<td>Provide a working example of using Compound with Redis through JugglingDB</td>
			<td>Working</td>
			<td></td>
		</tr>		
		<tr>
			<td>
				Provide working examples of making page views with multiple models, and balancing Async
				with Synchronous functionality.
			</td>
			<td>Working</td>
			<td>Might need some work.</td>
		</tr>		
		<tr>
			<td>Provide a working example of using Unit Tests and Functional Tests (through Selenium, or a plugin TBD)</td>
			<td>In Progress</td>
			<td>Thinking Mocha for Unit Tests.</td>
		</tr>		
		<tr>
			<td>[Maybe] Provide a working example of using sockets (socket.io) for Realtime Web</td>
			<td>TBD</td>
			<td>Could be a spin-off down the line.</td>
		</tr>		
		<tr>
			<td>[Maybe] Provide an example/workflow for dropping in Themes for your application</td>
			<td>TBD</td>
			<td>Would be REALLY NICE!</td>
		</tr>		
		<tr>
			<td>Replace WYSIHTML5 with a MarkDown Text Editor?</td>
			<td>TBD</td>
			<td>Would be REALLY NICE!</td>
		</tr>		
	<tbody>
</table>

##Comments
Working with MySQL and Redis.  

For _model associations_, see [this post](https://groups.google.com/forum/?fromgroups=#!topic/compoundjs/YxcIOKEqM8w).
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

Maybe more to come, including __Photos__, see [Picsee](https://github.com/dlochrie/picsee).

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

###Thanks
 * [Anatoliy Chakkaev](https://github.com/1602), this is built on top of the CompoundJS Framework

##License
The MIT License (MIT)

Copyright (c) 2013 Daniel Lochrie

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
