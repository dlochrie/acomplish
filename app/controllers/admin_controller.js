load ('application');


before(use('authorize'));


action('index', function () {
  render({
    title: "Dashboard"
  });
});
