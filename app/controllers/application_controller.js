// Require `authorization` controller
load('authorization');
load('log');


// Init `before` filters - order is important.
before('protect from forgery', function () {
  protectFromForgery('4f66d4b328383823a9acefbc03891493c2b60366f');
});
before(loadPassport);
before(use('loadRoles'));
before(use('loadAbilities'));
before(use('initLogger'));


// Publish methods for use in other controllers.
publish('loadAuthor', loadAuthor);
publish('getAssociated', getAssociated);


/**
 * TODO: This should be named loadUser, or loadUserPassport,
 * and multiple Passports should be allowed for a user.
 */
function loadPassport() {
  var self = this;

  if (session.user) {
    self.user = session.user;
    return next();
  }

  self.user = false;
  session.user = false;

  if (session.passport.user) {
    User.find(session.passport.user, function (err, user) {
      if (!err || user) {
        session.user = {
          name: user.displayName,
          email: user.email,
          owner: checkOwner(user.email),
          id: user.id
        }
        self.user = session.user;
        next();
      }
    }.bind(self));
  } else {
    next();
  }
}

/**
 * Check if the user is an owner by verifying that their email is in 
 * the `settings.json`.
 *
 * @param email User's email address.
 */
function checkOwner(email) {
  var owners = compound.acomplish.settings.owners || false;
  if (!owners) return false;
  return owners.indexOf(email) !== -1;
}

/**
 * Convienience method for loading Author, Posts and Comments
 */
function loadAuthor() {
  this.author = null;
  if (session.user) {
    this.author = {
      name: session.user.name,
      id: session.user.id
    }
  }
  next();
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
function getAssociated(models, assoc, multi, modelName, cb) {
  var results = [];

  function makeAssoc(model, assoc, callback) {
    model = (multi) ? model[modelName] : model;
    model[assoc](function (err, assoc) {
      callback(assoc);
    })
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