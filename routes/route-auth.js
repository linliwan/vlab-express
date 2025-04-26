import express from 'express';
import passport from 'passport';
import bcrypt from 'bcrypt';
import { isAuthenticated } from '../middleware/auth.js';
import { resetUserPasswords, getUserByEmail } from '../db/db-users.js';

const router = express.Router();

router.get('/login', (req, res) => {
    // If the user is already logged in, redirect to the profile page
    if (req.isAuthenticated()) {
        return res.redirect('/auth/profile');
    }
    
    // Unlogged users show the login page
    res.render('login');
});

// Login route handled by passport
router.post('/login', (req, res, next) => {
    // Check the request body
    if (!req.body.email || !req.body.password) {
        return res.status(400).json({
            success: false,
            message: 'Email and password cannot be empty'
        });
    }

    passport.authenticate('local', (err, user, info) => {
      // Handle errors
      if (err) {
        // console.error('Login error:', err);
        return res.status(500).json({
          success: false,
          message: 'Server error, please try again later'
        });
      }
      
      // Authentication failed
      if (!user) {
        // console.log('认证失败:', info);
        return res.status(401).json({
          success: false,
          message: info?.message || 'Username or password is incorrect'
        });
      }
      
      // Authentication successful, login the user
      req.login(user, (loginErr) => {
        if (loginErr) {
          // console.error('Login session error:', loginErr);
          return res.status(500).json({
            success: false,
            message: 'Login failed, please try again later'
          });
        }

        // console.log('Login successful:', user.id);
        // Get and use the saved redirect path
        const returnTo = req.session.returnTo || '/';
        delete req.session.returnTo;
        
        return res.json({ 
          success: true, 
          redirect: returnTo 
        });
      });
    })(req, res, next);
});

// When a POST request is received at the /login path
// First execute the passport.authenticate('local') middleware
// The middleware attempts to verify the user credentials
// If authentication fails, the middleware handles the response (default redirects or returns 401)
// If authentication succeeds, the middleware sets req.user and calls next(), continuing to the next step
// If authentication succeeds, the (req, res) => {...} callback function is executed
// At this point, req.user contains the authenticated user's information
// You can use this information to send a successful response


// Logout route handled by passport
router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ error: 'logout failed' });
        }
        res.render('login');
    });
});

router.get('/profile', isAuthenticated, async (req, res) => {
    res.render('profile');
});

// Handle password modification
router.post('/change-password', isAuthenticated, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;
        
        // Check the request parameters
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password and new password cannot be empty'
            });
        }
        
        // Get the full user information (includes password hash)
        const user = await getUserByEmail(req.user.email);
        
        // Ensure the user exists and has a password
        if (!user || !user.password) {
            // console.error('User not found or password field is empty:', userId);
            return res.status(400).json({
                success: false,
                message: 'Unable to verify current password, please contact the administrator'
            });
        }
        
        // console.log('用户信息:', { id: user.id, hasPassword: !!user.password });
        
        // Verify the current password
        try {
            const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isPasswordValid) {
                return res.status(400).json({
                    success: false,
                    message: 'Current password is incorrect'
                });
            }
        } catch (compareError) {
            // console.error('Password comparison error:', compareError);
            return res.status(500).json({
                success: false,
                message: 'Password verification failed, please try again later'
            });
        }
        
        // Update the password
        const updateResult = await resetUserPasswords([userId], newPassword);
        
        if (!updateResult || updateResult.rowCount === 0) {
            return res.status(500).json({
                success: false,
                message: 'Password update failed'
            });
        }
        
        return res.json({
            success: true,
            message: 'Password updated successfully'
        });
    } catch (error) {
        // console.error('Password update error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error, please try again later'
        });
    }
});

export default router;

