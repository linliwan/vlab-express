import express from 'express';
import vm from './route-vm.js';
import vc from './route-vc.js';
import admin from './route-admin.js';
import cis from './route-cis.js';
import cron from './route-cron.js';
import vlab from './route-vlab.js';
import auth from './route-auth.js';
import { isAuthenticated, isAdmin, isAdvantage } from '../middleware/auth.js';
const router = express.Router();

router.get('/', async (req, res) => {
    if (req.user) {
        res.redirect('/vlab');
    } else {
        res.render('index');
    }
})

router.use('/auth', auth);
router.use('/vlab', isAuthenticated, vlab);
router.use('/vm', isAuthenticated, vm);

router.use('/vc', isAdvantage, vc);
router.use('/admin', isAdvantage, admin);
router.use('/cis', isAdvantage, cis);
router.use('/cron', isAdvantage, cron);

// 404 route - placed after all other routes
router.use((req, res, next) => {
    res.status(404).render('404', { 
        title: 'Page Not Found',
        message: 'The page you are looking for does not exist.' 
    });
});
export default router;