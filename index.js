const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
    res.send('Express Test');
});

//404 error handling
app.use(function(req, res, next) {
  next(); //404 error handling
});

//global error handling
app.use(function(err, req, res, next) {
    /*
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
  res.status(err.status || 500);
  res.render('error');
  */
    
});


app.listen(port, () => {
    console.log(`Listening...`);
});
