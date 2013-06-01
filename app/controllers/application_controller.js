// Require `authorization` controller
load('authorization');


// Init `before` filters - order is important.
before('protect from forgery', function () {
  protectFromForgery('4f66d4b328383823a9acefbc03891493c2b60366f');
});
before(initLogger);
before(loadPassport);
before(use('loadRoles'));
before(use('loadAbilities'));


// Publish methods for use in other controllers.
publish('loadAuthor', loadAuthor);
publish('getAssociated', getAssociated);


/**
 * TODO: This should be named loadUser, or loadUserPassport.
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
 * Convienience method for loading Author, Posts and Comments
 */
function loadAuthor() {
  this.author = null;
  if (this.userId)
    this.author = {
      name: this.userName,
      id: this.userId
  };
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

/**
 * Initialize Logger.
 * Logged ONLY works in the development environment.
 */
function initLogger() {
  var env = app.settings.env || false;
  if (env && env === 'development') {
    var acomplish = req.acomplish || false;
    if (!acomplish) {
      req.acomplish = {log: []};
    } else {
      req.acomplish.log = req.acomplish.log || [];
    }
  } else {
    req.acomplish = {log: false};
  }
  next();
}

/**
 * Logs a message to the app window.
 * @param {*} msg String or Array of messages.
 */
function logToWindow(msg) {
  if (Object.prototype.toString.call(msg) === '[object Array]') {
    msg = msg.join(' ');
  }
  if (req.acomplish.log) {
    var msg = String('<strong>Debug Message</strong>: <em>' + msg + '</em>');
    req.acomplish.log.push(msg);
  }
}