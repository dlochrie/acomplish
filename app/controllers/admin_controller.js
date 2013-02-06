load('application');

before(use('checkRole'));

action('index', function () {
  render({
    title: "Dashboard"
  });
});
