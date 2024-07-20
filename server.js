console.log('Server-side code running');

require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const PORT = process.env.PORT || 8080;
const multer = require('multer');
const upload = multer()
const cookieParser = require('cookie-parser');
const passport = require('passport');
const session = require('express-session');

const jwt = require('jsonwebtoken');
const UserModel = require('./models/userModel.js');

require('./controllers/passport-setup');

app.use(session({ secret: 'cats' }));
app.use(passport.initialize());
app.use(passport.session());

// static assets
app.use(express.static('public'));

// built-in middleware that handles urlencoded form data
app.use(express.urlencoded({ extended: true }));
// built-in middleware that handles json
app.use(express.json());
// middleware for cookies
app.use(cookieParser());

//routes
// use multer (specifying no uploads to form) to handle formData
app.use('/', upload.none(), require('./routes/user'));
app.use('/refresh', require('./routes/refresh'));

//function to check session login and send user with requests when logged in
function isLoggedIn(req, res, next) {
    req.user ? next() : res.sendStatus(401);
}


app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', (req, res, next) => {
    console.log('cb')
    passport.authenticate('google', async function(err, user) {
        if (err) { return err; }
        if (!user) { return res.redirect('/'); }
        const {username} = user;
        const {id} = user.google;
        //create JWTs here to use with other protected routes in API 
        const accessToken = jwt.sign(
            { id, username },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '30s' }
        );
        const refreshToken = jwt.sign(
            { id, username },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '1d' }
        );
        await UserModel.findOneAndUpdate({ username: username }, { refreshToken: refreshToken });
        //create secure cookie with refresh token
        res.cookie('access_token', accessToken, {
            httpOnly: true,
            sameSite: 'strict',
            secure: true,
            maxAge: 30 * 1000
        });
        res.cookie('refresh_token', refreshToken, {
            httpOnly: true, //accessible only by web server 
            sameSite: 'None', //http or https
            secure: true, //cross-site cookie, (DISABLED FOR THUNDERCLIENT)
            maxAge: 24 * 60 * 60 * 1000 //cookie expiry; matches rT
        });
        //send access token with username to frontend
        res.status(200).redirect('/');
        //json({ 'message': `${username} logged in` })
    })(req, res, next) //passport.authenticate() is not being used as middleware, therefore pass in req, res, next
})


app.get('/authorized', isLoggedIn, (req, res) => {
    res.sendFile('public/authorized.html', { root: __dirname });
})

app.get('/google/logout', (req, res) => {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
})

//my mongo database url
const DB_URL = process.env.DB_URL;
const DB_PASSWORD = process.env.DB_PASSWORD;

mongoose.connect(`mongodb://node-express-mongodb:${DB_PASSWORD}@node-express-mongodb.mongo.cosmos.azure.com:10255/?ssl=true&retrywrites=false&maxIdleTimeMS=120000&appName=@node-express-mongodb@`, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => app.listen(PORT, () => console.log(`Server running on port: ${PORT}`)))
    .catch((error) => console.log(error.message))


app.get('^/$|/index(.html)?', (req, res) => {
    res.sendFile('public/index.html', { root: __dirname }); // is this required still??? (examine later)
});
/*
app.all('*', (req, res) => {
    res.status(404)
    if (req.accepts('html')) {
        res.sendFile('public/404.html', {root: __dirname});
    } else if (req.accepts('json')) {
        res.json({ message: '404 Not Found' })
    } else {
        res.type('txt').send('404 Not Found')
    }
})
*/



