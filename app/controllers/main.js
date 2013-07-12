var Application = require('./application');

module.exports = MainController;

function MainController(init) {
  Application.call(this, init);
};

require('util').inherits(MainController, Application);

MainController.prototype.index = function index(c) {
  c.render({
    title: "main#index"
  });
}

MainController.prototype.contact = function contact(c) {
  c.render({
    title: "main#contact"
  });
}

MainController.prototype.about = function about(c) {
  c.render({
    title: "main#about"
  });
}