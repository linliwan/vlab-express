import express from 'express';
import bodyParser from 'body-parser';
import routes from './routes/index.js';
import session from 'express-session';
import passport from 'passport';
import configurePassport from './middleware/configure-passport.js';
import { sessionConfig, redisConfig } from './config.js';

import { createClient } from 'redis';
import RedisStore from 'connect-redis';

const app = express();
const port = 3200;

// Create a Redis client
const redisClient = createClient({
  socket: {
    host: redisConfig.host,
    port: redisConfig.port
  },
  password: redisConfig.password
});

await redisClient.connect();

// Create a RedisStore instance
const store = new RedisStore({
  client: redisClient,
  prefix: 'vlab:sess:' // Optional, add a prefix for better distinction
});

// Configure sessionConfig, attach the store
sessionConfig.store = store;

// Use the session middleware
app.use(session(sessionConfig));

// Other settings remain the same
app.set('trust proxy', 1);
app.set('view engine', 'ejs');
app.set('views', './views');

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(passport.initialize());
app.use(passport.session());
configurePassport(passport);

app.use((req, res, next) => {
  res.locals.authUser = req.user;
  next();
});

app.use('/', routes);

app.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
});