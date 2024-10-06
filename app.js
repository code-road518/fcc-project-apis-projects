var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const dns = require('node:dns')
var app = express();


const multer = require('multer')
const upload = multer({ dest: './uploads/' })

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');


const enableCORS = function (req, res, next) {
  if (!process.env.DISABLE_XORIGIN) {
    const allowedOrigins = ["https://www.freecodecamp.org"];
    const origin = req.headers.origin;
    if (!process.env.XORIGIN_RESTRICT || allowedOrigins.indexOf(origin) > -1) {
      console.log(req.method);
      res.set({
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers":
          "Origin, X-Requested-With, Content-Type, Accept",
      });
    }
  }
  next();
};

app.use(enableCORS)
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());


app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', indexRouter);

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  // res.send('hahahh')
  res.sendFile(__dirname + '/views/index.html');
});

// exercise-tracker
app.use('/api/users', usersRouter);

// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({ greeting: 'hello API' });
});

// header parse
app.get('/api/whoami', function (req, res) {
  res.json({
    ipaddress: req.connection.remoteAddress,
    language: req.headers['accept-language'],
    software: req.headers['user-agent'],
  })
})

// file-metadata-microservice
app.route('/api/fileanalyse').post(upload.single('upfile'), function (req, res) {
  const file = req.file
  console.log('posttt fifif--', file)
  //   {
  //     "name": "npm.png",
  //     "type": "image/png",
  //     "size": 506
  // }
  res.json({ name: file.originalname, type: file.mimetype, size: file.size })
})

// url-shortener-microservice
let num = 1000
const shorturlObj = {
  1000: 'https://forum.freecodecamp.org/'
}
app.post('/api/shorturl', function (req, res) {
  // console.log('post url ----', req.body)
  const { url } = req.body
  console.log('url--', url)
  const rr = new URL(url)
  dns.lookup(rr.hostname, function (err, address) {
    console.log('eeer---', err)
    if (err) {
      res.json({ error: 'invalid url' })
    } else {
      res.json({ original_url: url, short_url: ++num })
      shorturlObj[num] = url
    }
  })

}).get('/api/shorturl/:shortId?', function (req, res) {
  const { shortId } = req.params
  if (shorturlObj[shortId]) {
    res.redirect(shorturlObj[shortId])
  } else {
    res.json({
      "error": "No short URL found for the given input"
    })
  }
})

// Timestamp server
app.get('/api/:date?', function (req, res) {

  if (req.params.date === undefined) {
    const date = new Date()
    const unix = date.getTime()
    const utc = date.toUTCString()
    res.json({ unix, utc })
    return
  }

  const num = Number(req.params.date)
  let date = new Date(num)
  if (isNaN(num)) {
    date = new Date(req.params.date)
  }
  console.log('params---', typeof req.params.date)

  if (date.toString() === 'Invalid Date') {
    res.json({ error: "Invalid Date" })
  } else {

    const unix = date.getTime()
    const utc = date.toUTCString()
    res.json({ unix, utc })
  }
})


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  // res.render('error');
  res.send(err)
});

module.exports = app;
