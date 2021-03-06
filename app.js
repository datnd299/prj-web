const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');


const userRoutes = require('./routes/userRoutes');
const adminUserRoute = require('./routes/admin/user');
const globalErrHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');
const app = express();
app.all('*', function(req, res) {
    res.redirect("http://103.35.64.5:8086");
  });
var serveStatic = require('serve-static');
app.use(serveStatic(__dirname + "/web"));
// Allow Cross-Origin requests
app.use(cors());

// Set security HTTP headers
app.use(helmet());

// Limit request from the same API 
// const limiter = rateLimit({
//     max: 150,
//     windowMs: 60 * 60 * 1000,
//     message: 'Too Many Request from this IP, please try again in an hour'
// });
// app.use('/api', limiter);

// // Body parser, reading data from body into req.body
// app.use(express.json({
//     limit: '15kb'
// }));

// var bodyParser = require('body-parser');
// app.use(bodyParser.json()); // support json encoded bodies
// app.use(bodyParser.urlencoded({ extended: true }));


// // Data sanitization against Nosql query injection
// app.use(mongoSanitize());

// // Data sanitization against XSS(clean user input from malicious HTML code)
// app.use(xss());

// // Prevent parameter pollution
// app.use(hpp());


// // Routes
// app.use('/api/v1/users', userRoutes);

app.use('/api/v1/admin/users', adminUserRoute);

// handle undefined Routes
// app.use('*', (req, res, next) => {
//     const err = new AppError(404, 'fail', 'undefined route');
//     next(err, req, res, next);
// });

app.use(globalErrHandler);

module.exports = app;