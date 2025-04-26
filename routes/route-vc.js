import express from 'express';
import {
  getFolders,
  getDatastores,
  getHosts
} from "../vmware/vc-operations.js";
import { adminNavItems } from '../config.js';
const router = express.Router();

router.get('/folder', async (req, res) => {
  try {
    const folders = await getFolders();
    res.render('admin.ejs', {
      navItems: adminNavItems,
      content: './content/vc/folder.ejs',
      folders
    })
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.get('/datastore', async (req, res) => {
  try {
    const datastores = await getDatastores();
    res.render('admin.ejs', {
      navItems: adminNavItems,
      content: './content/vc/datastore.ejs',
      datastores
    })
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/host', async (req, res) => {
  try {
    const hosts = await getHosts();
    res.render('admin.ejs', {
      navItems: adminNavItems,
      content: './content/vc/host.ejs',
      hosts
    })
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;