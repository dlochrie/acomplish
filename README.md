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
			<td>See "ACL - Authorization" heading.</td>
			<td>Working</td>
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

For _model associations_, see [this post](https://groups.google.com/forum/?fromgroups=#!topic/compoundjs/YxcIOKEqM8w),
and [this post](https://groups.google.com/forum/?fromgroups=#!searchin/compoundjs/view$20model/compoundjs/NeQX7zxRKw4/Zc0DeTk4X-AJ).
Associated/Related models cannot be accessed _en masse_, but only individually. If you know of an elegant solution, 
without adding to the controller, but allowing for multiple relations in a view, let me know.  

Another way of handling this is seeing: [http://book.mixu.net/ch7.html](http://book.mixu.net/ch7.html), particularly section
7.2.1 Control flow pattern #1: Series. Mikito Takada has some really insightful documentation on the asynchronous nature of
Node, and how we might solve this problem (or work nicely with this feature :-)).  

*Update*: See method `getAssociated` the *application_controller* for a useful way or handling associations. 
Again, if you know of a more elegant solution, let me know.  

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

##ACL - Authorization

ACL (Access Control List) is managed by a JSON file, should you provide it. 
Right now, ACL is configured by a JSON file, and not through a DB Resource, but
that feature could come in time.

The format for your ACL file looks like:

    env
      settings
        cachedRoles
        cachedAbilities
      roles
        key
          displayName
          description
          abilities

And the JSON example:

    {
      "development": {
        "settings": {
          "cacheRoles": "true",
          "cacheAbilities": "true"
        },
        "roles": {
          "admin": {
            "displayName": "Admin",
            "description": "Admins can do anything",
            "abilities": [{
              "controller": "posts",
              "actions": [
                "create",
                "update",
                "delete"
              ]
            }]
          }
        }
      }
    }

Authorization is determined by a User's Abilities. Abilities are a combination
of a `controller` and `actions` on that controller. The wildcard `*` adds all
actions that a controller has. Note, actions no not necessarily equal access to 
a _page_, but to that _action_, which makes authorization useful for RESTful 
requests as well.

You can provide as many Roles as you want, and each Role can have multiple
abilities. If a User has multiple Roles with overlapping Abilities, they 
are combined, and the User gets the Sum of all the Abilities.   

*Ex.*

    User 
      Role: Commentor
      Abilities: 
        Controller: Comments
        Actions: Create, Edit 
      Role: Moderator
      Abilities: 
        Controller: Comments
        Actions: Delete

In the example above, the User will be able to Create, Edit, and Delete on the 
Comments Controller.

###ACL Usage

To use `authorization` in a controller, you must load the `authorization` 
controller first:

    load('authorization');

...and then use it like:

    before(use('authorize'));

You have 3 choices:

1. Use `authorization` everywhere
2. Use `authorization` on all actions on a controller
3. Use `authorization` on specific actions in a controller

*Everywhere*:
In the `application_controller` add the following line near the top: 
    
    before(use('authorize'));


*All Controller Actions*:
In any controller, add the following line near the top**:

    before(use('authorize'));


*Specific Controller Actions*:
In any controller, add the following line near the top**:

    before(use('authorize'), only: ['destroy', 'create']);

**Remember to `load('authorization')` at the top of you controller to use it.


###Cached Roles / Abilities
Use the cache at your own discretion. What it basically means is that if you


##Install

*TODO:* Add more instructions for how to configure a cloned app. 
*TODO:* Update based on new JSON confs scheme.

1. Clone Repo  
    `git clone [this repo url]`

2. Install Modules  
    `[sudo] npm install -l`

3. Set up confs, see `config/acomplish.json`.

4. Create DB (See DB Setup Below)  
    `compound db migrate`

5. Run Server  
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
