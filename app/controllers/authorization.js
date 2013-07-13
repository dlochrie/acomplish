// Expose `Authorization Controller`
module.exports = Authorization;


/**
 * @param {Object} init Initial bootstrap object for Contollers.
 * @constructor
 */
function Authorization(init) {
  init.before(function(ctl) {
    initialize(ctl);
  });
}


/**
 * Initializes Authorization Components.
 * 
 * @param {Object} c Controller Instance.
 */
function initialize(c) {
  var app = c.res.app,
    compound = app.compound,
    locals = c.locals;

  locals.loggedIn = (c.session.user) ? true : false;
  var acl = compound.acomplish.acl || false;
  var cacheRoles = false;
  var cacheAbilities = false;

  if (!acl) return c.next();

  locals.systemRoles = acl.roles || [];
  if (acl.settings) {
    locals.cacheRoles = (acl.settings.cacheRoles) ? true : false;
    locals.cacheAbilities = (acl.settings.cacheAbilities) ? true : false;
  }
  c.next();  
}


/**
 * Verifies that a user has the permission to perform a
 * certain action on a certain controller.
 *
 * @param {Object} req (Compound) Request object.
 */
Authorization.authorize = function authorize(req) {
  var actn = req.actionName,
    ctrl = req.controllerName,
    user = req.locals.user;

  if (user.owner) return req.next();

  function reject() {
    req.flash('error', 'You are not authorized for this action.');
    req.redirect(req.pathTo.root);
  }

  if (!req.locals.loggedIn) {
    return reject();
  }

  /*
  console.log("ACL:\n", 'Does[', user.name, '] have the Ability to ' +
    '[', actn, '] in [', ctrl, '] ??');
  */

  var userAbilities = user.abilities || {};
  if (userAbilities[ctrl]) {
    if (userAbilities[ctrl][0] === "*") {
      return req.next();
    }
    if (-1 !== userAbilities[ctrl].indexOf(actn)) {
      return req.next();
    }
  }

  // No rules matched, User is NOT authorized.
  return reject();
}

/**
 * Load a User's Roles into the session. 
 * Load is skipped if 'cachedRoles' is set to 'true';
 */
Authorization.loadRoles = function loadRoles(c) {
  var locals = c.locals;
  if (!locals.loggedIn) return c.next();
  if (c.locals.cacheRoles && c.session.user.roles) return c.next();

  // As a security precaution, reset the user's roles.
  c.session.user.roles = [];
  c.Membership.all({where: {userId: session.user.id}}, 
  function getMemberships(err, memberships) {
    if (err) return c.next();

    function getRole(membership) {
      if (membership) {
        c.session.user.roles.push(membership.roleName);
        return getRole(memberships.shift());
      } else {
        c.next();
      }
    }

    getRole(memberships.shift())
  });
}

/**
 * Loads a User's Abilities based on the Role(s) they have.
 * Load is skipped if 'cachedAbilities' is set to 'true'.
 */
Authorization.loadAbilities = function loadAbilities(c) {
  var locals = c.locals;
  if (!locals.loggedIn) return c.next();
  if (c.locals.cacheAbilities && c.session.user.abilities) return c.next();

  var userRoles = session.user.roles,
    userAbilities = {};

  for (role in locals.systemRoles) {
    if (userRoles.indexOf(role) !== -1) {
      var abilities = systemRoles[role].abilities;
      abilities.forEach(function (ability) {
        var ctrl = ability.controller;
        if (userAbilities[ctrl]) {
          if (userAbilities[ctrl].indexOf('*') !== -1) return '*';
          userAbilities[ctrl] = merge(userAbilities[ctrl]
            .concat(ability.actions));
        } else {
          userAbilities[ctrl] = ability.actions;
        }
      });
    }
  }
  session.user.abilities = userAbilities;
  next();
}

/**
 * Util method for merging an array by removing duplicates.
 *
 * @param {Array} array Array to merge.
 */
function merge(array) {
  var a = array.concat();
  for (var i = 0; i < a.length; ++i) {
    for (var j = i + 1; j < a.length; ++j) {
      if (a[i] === a[j])
        a.splice(j--, 1);
    }
  }
  return a;
}