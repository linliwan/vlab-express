import ApiClient from './api-client.js';

const client = new ApiClient();

export async function getAllTags() {
    try {
        const response = await client.get('/api/cis/tagging/tag');
        console.log(response);
        return response;
    } catch (error) {
        console.error('Failed to get all tags:', error.message);
        throw new Error('Failed to get all tags');
    }
}

export async function getAllCategories() {
    try {
        const response = await client.get('/api/cis/tagging/category');
        return response;
    } catch (error) {
        console.error('Failed to get all categories:', error.message);
        throw new Error('Failed to get all categories');
    }
}

export async function getTagById(tag_id) {
    try {
        const response = await client.get(`/api/cis/tagging/tag/${tag_id}`);
        return response;
    } catch (error) {
        console.error('Failed to get tag:', error.message);
        throw new Error('Failed to get tag');
    }
}

export async function getCategoryById(category_id) {
    try {
        const response = await client.get(`/api/cis/tagging/category/${category_id}`);
        return response;
    } catch (error) {
        console.error('Failed to get category:', error.message);
        throw new Error('Failed to get category');
    }
}

export async function createCategory(name) {
    const associable_types = ['VirtualMachine'];
    const cardinality = 'SINGLE';
    const category_id = '';
    const description = name;
    try {
        const response = await client.post('/api/cis/tagging/category', { associable_types, cardinality, category_id, description, name });
        return response;
    } catch (error) {
        console.error('Failed to create category:', error.message);
        throw new Error('Failed to create category');
    }
}

export async function createTag(category_id, name) {
    const description = name;
    try {
        const response = await client.post('/api/cis/tagging/tag', { category_id, description, name });
        return response;
    } catch (error) {
        console.error('Failed to create tag:', error.message);
        throw new Error('Failed to create tag');
    }
}

export async function deleteTag(tag_id) {
    try {
        const response = await client.delete(`/api/cis/tagging/tag/${tag_id}`);
        return response;
    } catch (error) {
        console.error('Failed to delete tag:', error.message);
        throw new Error('Failed to delete tag');
    }
}

export async function deleteCategory(category_id) {
    try {
        const response = await client.delete(`/api/cis/tagging/category/${category_id}`);
        return response;
    } catch (error) {
        console.error('Failed to delete category:', error.message);
        throw new Error('Failed to delete category');
    }
}

export async function attachTagToVM(vm_id, tag_id) {
    const body = {
        "object_id": {
            "id": `${vm_id}`,
            "type": "VirtualMachine"
        }
    }
    try {
        const response = await client.post(`/api/cis/tagging/tag-association/${tag_id}?action=attach`, body);
        console.log(response);
        return response;
    } catch (error) {
        console.error('Failed to add tag:', error.message);
        throw new Error('Failed to add tag');
    }
}

export async function listAttachedObjectsOnTags(tag_id) {
    const body = {
        "tag_ids": [ tag_id ]
    }
    try {
        const response = await client.post(`/api/cis/tagging/tag-association?action=list-attached-objects-on-tags`, body);
        let vm_ids = [];
        for (let item of response) {
            if (item) {
                for (let object_id of item.object_ids) {
                    if (object_id.type === 'VirtualMachine') {
                        vm_ids.push(object_id.id);
                    }
                }
            }
        }
        return vm_ids;
    } catch (error) {
        console.error('Failed to get tag associated objects:', error.message);
        throw new Error('Failed to get tag associated objects');
    }
}
