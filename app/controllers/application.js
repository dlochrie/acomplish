var Log = require('./log'),
  Authorization = require('./authorization');


// Expose `Application Controller`
module.exports = Application;


/**
 * @constructor
 *
 * @param {Object} init Bootstrap object for Controller classes.
 */
function Application(init) {
  Log.call(this, init);

  init.before(function protectFromForgeryHook(ctl) {
    ctl.protectFromForgery('cd4877e99cdf086493a1e924ce4fef00607ee3b5');
  });

  init.before(loadPassport);

  init.before(function loadRolesAndAbilities(ctl) { 
    Authorization.loadRoles(ctl);
    //Authorization.loadAbilities(ctl);
    ctl.next();
  });
  
  init.before(function initLog(ctl) { 
    Log.initialize(ctl);
  });
};


/**
 * @param {Object} c Init Controller Object
 */
function loadPassport(c) {
  var self = this,
    session = c.session,
    locals = c.locals;

  if (session.user) {
    locals.user = session.user;
    return c.next();
  }

  locals.user = false;
  session.user = false;

  if (session.passport.user) {
    c.User.find(session.passport.user, function (err, user) {
      if (!err || user) {
        session.user = {
          name: user.displayName,
          email: user.email,
          owner: checkOwner(user.email),
          id: user.id
        }
        locals.user = session.user;
        c.next();
      }
    }.bind(self));
  } else {
    c.next();
  }
}

/**
 * Check if the user is an owner by verifying that their email is in 
 * the `settings.json`.
 *
 * @param email User's email address.
 */
function checkOwner(email) {
  var compound = this.app.compound;
  var owners = compound.acomplish.settings.owners || false;
  if (!owners) return false;
  return owners.indexOf(email) !== -1;
}

/**
 * Convienience method for loading Author, Posts and Comments
 */
Application.prototype.loadAuthor = function loadAuthor(c) {
  var session = c.session,
    locals = c.locals;
  locals.author = null;
  if (session.user) {
    locals.author = {
      name: session.user.name,
      id: session.user.id
    }
  }
  c.next();
}

/**
 * Joins associated models and allows them to be accessed like:
 * - user.role.name
 * - post.user.displayName
 *
 * @param {Array} models Collection of models.
 * @param {String} assoc Model that will be associated with `model` param
 * @param {Boolean} multi Indication that `models` contains more than one
 *     kind of model.	
 * @param {String} modelName Name of model to use if `multi` boolean is true.
 * @param {Function} cb Function to call when all associations have been made.
 */
Application.prototype.getAssociated = function getAssociated(
    models, assoc, multi, modelName, cb) {
  var results = [];

  function makeAssoc(model, assoc, callback) {
    model = (multi) ? model[modelName] : model;
    model[assoc](function (err, assoc) {
      callback(assoc);
    });
  }

  function findAssoc(model) {
    if (model) {
      makeAssoc(model, assoc, function (result) {
        var obj = {};
        if (!multi) {
          obj[modelName] = model;
        } else {
          obj = model;
        }
        obj[String(assoc)] = result;
        results.push(obj);
        return findAssoc(models.shift());
      });
    } else {
      return cb(results);
    }
  }

  findAssoc(models.shift());
}