import express from 'express';
import { getAllCategories } from '../db/db-categories.js';
import { getAllLabs, getLabById, getAssignementsByGroupId } from '../db/db-labs.js';
import { getClonedVmsByLabIdUserId, getClonedVmsByUserId } from '../db/db-clonedvm.js';
import { userSettings } from '../config.js';
const router = express.Router();

router.get('/', async (req, res) => {
    const category = parseInt(req.query.category);
    const groupId = req.user.group_id;
    try {
        const categories = await getAllCategories();
        let labs = await getAllLabs();
        labs = labs.filter(lab => lab.id !== userSettings.manualLabId);
        const assignments = await getAssignementsByGroupId(groupId);
        if (category) {
            labs = labs.filter(lab => lab.category_id === category);
        }
        
        res.render('lablist.ejs', {
            labs,
            category,
            categories,
            assignments,
            currentPage: 'home'
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
})

router.get('/lab/:id', async (req, res) => {
    const category = parseInt(req.query.category);
    let userId = req.user.id;
    const labId = parseInt(req.params.id);
    try {
        const categories = await getAllCategories();
        const lab = await getLabById(labId);
        const vmList = await getClonedVmsByLabIdUserId(labId, userId);
        res.render('lab.ejs', {
            lab, 
            vmList, 
            categories,
            category
        });
    } catch (error) {
        console.error('Error fetching lab:', error);
        res.status(500).json({ error: 'Failed to fetch lab' });
    }
})

router.get('/listvms', async (req, res) => {
    try {
        let userId = req.user.id;
        const vms = await getClonedVmsByUserId(userId);
        const categories = await getAllCategories();
        res.render('listvms.ejs', {
            categories,
            vms,
            currentPage: 'listvms'
        });
    } catch (error) {
        console.error('Error fetching vmList:', error);
        res.status(500).json({ error: 'Failed to fetch vmList' });  
    }
})
export default router;