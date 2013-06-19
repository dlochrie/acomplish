// Publish methods for use in other controllers.
publish('initLogger', initLogger);
publish('logToWindow', logToWindow);


/**
 * Initialize Logger.
 *
 * Logged ONLY works in the development environment.
 * TODO: Make this work in other environments.
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
 * Logs message(s) to the app window. Can be stacked.
 *
 * Usage: 
 * -- assume `load('log');` is in the application (or intended) controller
 * -- assume `before(use('initLogger'));` in in application (or intended) 
 * controller
 *
 * ...Somewhere near top of a controller (global var):
 *   var logToWindow = use('logToWindow');
 *
 * ...In a method/action:
 *   logToWindow('Hello, World!');
 *
 * ...In a before filter:
 *   before(function() {
 *     logToWindow('Hello, World!');
 *     next();
 *   });
 *
 * @param {*} msg String or Array of messages.
 */
function logToWindow(msg) {
  if (Object.prototype.toString.call(msg) === '[object Array]') {
    msg = msg.join(' ');
  }
  if (req.acomplish.log) {
    var msg = '<strong>Debug Message</strong>: <em>' + msg + '</em>';
    req.acomplish.log.push(msg);
  }
}