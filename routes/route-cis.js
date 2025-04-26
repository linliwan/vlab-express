import express from 'express';
import {
  getAllCategories,
  getCategoryById
} from "../vmware/cis-operations.js";
import { adminNavItems } from '../config.js';

const router = express.Router();

router.get('/categories', async (req, res) => {
    try {   
        const category_list = await getAllCategories();
        
        // Use map to create a Promise array, and use Promise.all to wait for all Promises to complete
        const categories = await Promise.all(
            category_list.map(async category => {
                return await getCategoryById(category);
            })
        );
        res.render('admin.ejs', {
            navItems: adminNavItems,
            content: './content/vc/cis.ejs',
            categories
          });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;