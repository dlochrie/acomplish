load('application');

before(loadComment, {
    only: ['show', 'edit', 'update', 'destroy']
    });

action('new', function () {
    this.title = 'New comment';
    this.comment = new Comment;
    render();
});

action(function create() {
    Comment.create(req.body.Comment, function (err, comment) {
        respondTo(function (format) {
            format.json(function () {
                if (err) {
                    send({code: 500, error: comment && comment.errors || err});
                } else {
                    send({code: 200, data: comment.toObject()});
                }
            });
            format.html(function () {
                if (err) {
                    flash('error', 'Comment can not be created');
                    render('new', {
                        comment: comment,
                        title: 'New comment'
                    });
                } else {
                    flash('info', 'Comment created');
                    redirect(path_to.comments);
                }
            });
        });
    });
});

action(function index() {
    this.title = 'Comments index';
    Comment.all(function (err, comments) {
        switch (params.format) {
            case "json":
                send({code: 200, data: comments});
                break;
            default:
                render({
                    comments: comments
                });
        }
    });
});

action(function show() {
    this.title = 'Comment show';
    switch(params.format) {
        case "json":
            send({code: 200, data: this.comment});
            break;
        default:
            render();
    }
});

action(function edit() {
    this.title = 'Comment edit';
    switch(params.format) {
        case "json":
            send(this.comment);
            break;
        default:
            render();
    }
});

action(function update() {
    var comment = this.comment;
    this.title = 'Edit comment details';
    this.comment.updateAttributes(body.Comment, function (err) {
        respondTo(function (format) {
            format.json(function () {
                if (err) {
                    send({code: 500, error: comment && comment.errors || err});
                } else {
                    send({code: 200, data: comment});
                }
            });
            format.html(function () {
                if (!err) {
                    flash('info', 'Comment updated');
                    redirect(path_to.comment(comment));
                } else {
                    flash('error', 'Comment can not be updated');
                    render('edit');
                }
            });
        });
    });
});

action(function destroy() {
    this.comment.destroy(function (error) {
        respondTo(function (format) {
            format.json(function () {
                if (error) {
                    send({code: 500, error: error});
                } else {
                    send({code: 200});
                }
            });
            format.html(function () {
                if (error) {
                    flash('error', 'Can not destroy comment');
                } else {
                    flash('info', 'Comment successfully removed');
                }
                send("'" + path_to.comments + "'");
            });
        });
    });
});

function loadComment() {
    Comment.find(params.id, function (err, comment) {
        if (err || !comment) {
            if (!err && !comment && params.format === 'json') {
                return send({code: 404, error: 'Not found'});
            }
            redirect(path_to.comments);
        } else {
            this.comment = comment;
            next();
        }
    }.bind(this));
}
