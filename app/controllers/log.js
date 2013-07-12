// Expose `LogController`
module.exports = LogController;


/**
 * Constructor
 */
function LogController() {}


/**
 * Initialize Logger.
 *
 * Logged ONLY works in the development environment.
 * @param {Object} init Bootstrap object for Controller classes.
 */
LogController.prototype.initLogger = function initLogger(c) {
  var env = app.settings.env || false;
  if (env && env === 'development') {
    var acomplish = c.req.acomplish || false;
    if (!acomplish) {
      c.req.acomplish = {log: []};
    } else {
      c.req.acomplish.log = c.req.acomplish.log || [];
    }
  } else {
    c.req.acomplish = {log: false};
  }
  c.next();
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
LogController.prototype.logToWindow = function logToWindow(msg) {
  if (Object.prototype.toString.call(msg) === '[object Array]') {
    msg = msg.join(' ');
  }
  if (req.acomplish.log) {
    var msg = '<strong>Debug Message</strong>: <em>' + msg + '</em>';
    req.acomplish.LogControllerpush(msg);
  }
}