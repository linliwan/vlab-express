import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { getUserByEmail, getUserById } from '../db/db-users.js';
import bcrypt from 'bcrypt';


export default function configurePassport() {
  passport.use('local', new LocalStrategy({ usernameField: 'email' },
    async function (email, password, done) {
      // console.log('Attempting to authenticate user:', email);
      try {
        const user = await getUserByEmail(email);
        // console.log('Database returned user information:', user);
        if (!user) {
          // console.log('User does not exist');
          return done(null, false, { message: 'User does not exist' });
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        // console.log('Password comparison result:', passwordMatch);
        if (passwordMatch) {
          // console.log('Authentication successful, returning user ID:', user.id);
          return done(null, { id: user.id });
        } else {
          // console.log('Authentication failed');
          return done(null, false, { message: 'Password is incorrect' });
        }
      } catch (error) {
        // console.error('Authentication process error:', error);
        return done(error);
      }
    }
  ));

  passport.serializeUser((user, done) => {
    // console.log('Serializing user:', user);
    done(null, user.id); 
    // This function determines which user information to store in the session
    // Here, only the user user.id is stored
    // When a user is authenticated, Passport calls the serializeUser function to convert the user information into a format that can be stored in the session.
    // This process simplifies the user object to a unique identifier for storage in the session.
  });

  passport.deserializeUser(async (id, done) => {
    // console.log('Deserializing user ID:', id);
    try {
      const user = await getUserById(id);
      // console.log('Deserializing user information:', user);
      done(null, user);
      // When a user sends a new request, the session ID in the cookie is sent to the server
      // The server uses this ID to retrieve the associated data from the session storage
      // Get the saved user ID from the session (req.session.passport.user)
      // This function uses the stored ID to retrieve the complete user information from the database and append it to the req.user object.
    } catch (error) {
      // console.error('Deserialization error:', error);
      done(error);
    }
  });
}

// Session storage is the sessionID -> userData mapping
// userData contains passport: { user: userId } information
// The cookie only stores the sessionID, not the userID directly

// This design has the following advantages:
  // Security: Sensitive user data is not sent to the client, reducing the risk of data leakage
  // Flexibility: The session data can be modified without affecting the client
  // Efficiency: Avoid transmitting the complete user object in each request, reducing bandwidth usage
  // Scalability: The session storage can be shared across different servers, enabling horizontal scaling