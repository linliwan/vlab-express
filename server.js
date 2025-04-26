import express from 'express';
import bodyParser from 'body-parser';
import routes from './routes/index.js';
import session from 'express-session';
import passport from 'passport';
import configurePassport from './middleware/configure-passport.js';
import { sessionConfig } from './config.js';

const app = express();
const port = 3100;

// Set the trust proxy, so that express correctly handles requests sent through the proxy
app.set('trust proxy', 1);
app.set('view engine', 'ejs');
app.set('views', './views');

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Configure the session middleware
app.use(session(sessionConfig));

// Configure the passport middleware
app.use(passport.initialize());
app.use(passport.session());
// Configure the passport strategy
configurePassport(passport);

app.use((req, res, next) => {
    // debug session information, only used in the development environment
    // console.log('收到请求，会话信息:');
    // console.log('请求路径:', req.path);
    // console.log('Cookie:', req.headers.cookie);
    // console.log('会话ID:', req.sessionID);
    // console.log('用户:', req.user ? `ID: ${req.user.id}, 邮箱: ${req.user.email}` : '未登录');
    // console.log('会话内容:', req.session);
    // Store the user information in res.locals, so it can be used in all views
    res.locals.authUser = req.user;
    next();
});

app.use('/', routes);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});