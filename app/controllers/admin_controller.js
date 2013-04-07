load ('application');

before(use('requireAdmin'));

action('index', function () {
  render({
    title: "Dashboard"
  });
});
