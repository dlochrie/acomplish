var Application = require('./application.js');

module.exports = AuthorizationController;

function AuthorizationController(init) {
  Application.call(this, init);

  init.before('initializeAuthorization', function () {
    loggedIn = (session.user) ? true : false;
    acl = compound.acomplish.acl || false;
    cacheRoles = false;
    cacheAbilities = false;

    if (!acl) return next();

    systemRoles = acl.roles || [];
    if (acl.settings) {
      cacheRoles = (acl.settings.cacheRoles) ? true : false;
      cacheAbilities = (acl.settings.cacheAbilities) ? true : false;
    }
    next();
  });
}

require('util').inherits(MainController, Application);

/**
 * TODO: Remove - No Eval Does not need these
publish('authorize', authorize);
publish('loadRoles', loadRoles);
publish('loadAbilities', loadAbilities);
*/

/**
 * Verifies that a user has the permission to perform a
 * certain action on a certain controller.
 *
 * @param {Object} req (Compound) Request object.
 */
AuthorizationController.prototype.authorize = function authorize(req) {
  var actn = req.actionName,
    ctrl = req.controllerName,
    user = this.user;

  if (user.owner) return next();

  function reject() {
    flash('error', 'You are not authorized for this action.');
    redirect(path_to.root);
  }

  if (!loggedIn) {
    return reject();
  }

  /*
  console.log("ACL:\n", 'Does[', user.name, '] have the Ability to ' +
    '[', actn, '] in [', ctrl, '] ??');
  */

  var userAbilities = user.abilities || {};
  if (userAbilities[ctrl]) {
    if (userAbilities[ctrl][0] === "*") {
      return next();
    }
    if (-1 !== userAbilities[ctrl].indexOf(actn)) {
      return next();
    }
  }

  // No rules matched, User is NOT authorized.
  return reject();
}

/**
 * Load a User's Roles into the session. 
 * Load is skipped if 'cachedRoles' is set to 'true';
 */
AuthorizationController.prototype.loadRoles = function loadRoles() {
  if (!loggedIn) return next();
  if (cacheRoles && session.user.roles) return next();

  // As a security precaution, reset the user's roles.
  session.user.roles = [];
  Membership.all({
    where: {
      userId: session.user.id
    }
  }, 
  function getMemberships(err, memberships) {
    if (err) return next();

    function getRole(membership) {
      if (membership) {
        session.user.roles.push(membership.roleName);
        return getRole(memberships.shift());
      } else {
        next();
      }
    }

    getRole(memberships.shift())
  });
}

/**
 * Loads a User's Abilities based on the Role(s) they have.
 * Load is skipped if 'cachedAbilities' is set to 'true'.
 */
AuthorizationController.prototype.loadAbilities = function loadAbilities() {
  if (!loggedIn) return next();
  if (cacheAbilities && session.user.abilities) return next();

  var userRoles = session.user.roles,
    userAbilities = {};

  for (role in systemRoles) {
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