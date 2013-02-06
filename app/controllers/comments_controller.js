load('application');

action(function create() {
  if (!session.passport.user)
    next();
    
  req.body.Comment.created_at = new Date;
  req.body.Comment.userId = session.passport.user;
  req.body.Comment.content = sanitizeComment(req.body.Comment.content);
  
  Comment.create(req.body.Comment, function (err, comment) {
    if (err) {
      flash('error', 'comment can not be created');
      render('new', {
        comment: comment,
        title: 'New comment'
      });
    } else {
      flash('info', 'comment created');
      redirect(path_to.post(req.body.Comment.postId));
    }
  });  
});

/**
 * See http://stackoverflow.com/questions/822452/strip-html-from-text-javascript
 * for reference to origin of this method
 */ 
function sanitizeComment(str) {
  str=str.replace(/<\s*br\/*>/gi, "\n"); // Replace breaks with new lines
  str=str.replace(/<\s*a.*href="(.*?)".*>(.*?)<\/a>/gi, " $2 (Link->$1) "); // Reformat links, removing tags but keeping reference
  str=str.replace(/<\s*\/*.+?>/ig, "\n"); // strip the rest of the HTML tags
  str=str.replace(/ {2,}/gi, " "); // 2 (or more) spaces equals a space - trim
  str=str.replace(/\n+\s*/gi, "\n\n"); // More than one new-line chars equals 2 new-lines
  str=str.replace(/\n/g, "<br />"); // Add the breaks again -- this *could* be a <p> replace.
  str=str.replace(/\*(.*?)\*/g, "<strong>$1</strong>"); // If text is wrapped in asterisks, then wrap in bold
  str=str.replace(/_(.*?)_/g, "<em>$1</em>"); // If text is wrapped in undescores, then wrap in italics
  return str;
}