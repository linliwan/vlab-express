import pg from 'pg';
import { dbConfig, cis } from '../config.js';
import { createTag } from '../vmware/cis-operations.js';


const db = new pg.Client(dbConfig);

async function patchTag() {
  try {
    // Query which groups do not have tags
    const query1 = 'SELECT * FROM groups WHERE vmware_tag_id IS NULL OR vmware_tag_id = \'\'';
    const result1 = await db.query(query1);
    console.log(`These groups do not have tags: ${result1.rows}`);
    for (const group of result1.rows) {
      const tag = await createTag(cis.category_id, group.name);
      console.log(`Got tag: ${tag}`);
      const query2 = `UPDATE groups SET vmware_tag_id = '${tag}' WHERE id = ${group.id}`;
      await db.query(query2);
      console.log(`Updated group: ${group.id} vmware_tag_id to: ${tag}`);
    }
    console.log('Groups tagged successfully');
  } catch (error) {
    console.error('failed to patch tag', error);
  }
}

async function main() {
  try {
    await db.connect();
    await patchTag();
    console.log('All initialization operations completed');
  } catch (error) {
    console.error('Error during initialization:', error);
  } finally {
    await db.end();
  }
}

main();