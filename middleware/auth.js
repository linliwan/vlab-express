import { userSettings } from '../config.js';

export const isAuthenticated = (req, res, next) => {
  // console.log('Check the authentication status:', {
  //   isAuthenticated: req.isAuthenticated(),
  //   user: req.user,
  //   session: req.session,
  //   sessionID: req.sessionID
  // });
  if (req.isAuthenticated()) {
    return next();
  }
  // Save the original URL the user wants to access
  req.session.returnTo = req.originalUrl;
  // Redirect to the login page, rather than returning a JSON error
  res.redirect('/auth/login');
  // res.status(401).json({ error: 'Not authenticated' });
};

export const isAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role_id === userSettings.adminRoleId) {
    return next();
  }
  res.status(403).render('403');
};

export const isAdvantage = (req, res, next) => {
  if (req.isAuthenticated() && (req.user.role_id === userSettings.advantageRoleId || req.user.role_id === userSettings.adminRoleId)) {
    return next();
  }
  res.status(403).render('403');
};
