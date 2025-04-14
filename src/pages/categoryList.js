import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { LoginContext } from '../context/loginContext';

const CategoryList = () => {
  const [categories, setCategories] = useState([]); // will hold a nested tree
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [expandedCategoryIds, setExpandedCategoryIds] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);

  const { vendorId } = useContext(LoginContext);

  // For creating a new category
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    parentCategory: null, // parent's categoryId
  });

  // Helper function: Build a tree structure from flat category list
  const buildCategoryTree = (flatCategories) => {
    const categoryMap = {};
    flatCategories.forEach(cat => {
      categoryMap[cat.categoryId] = { ...cat, subCategories: [] };
    });
    const tree = [];
    flatCategories.forEach(cat => {
      if (cat.parentCategory) {
        if (categoryMap[cat.parentCategory]) {
          categoryMap[cat.parentCategory].subCategories.push(categoryMap[cat.categoryId]);
        } else {
          // If parent's not found, treat as root
          tree.push(categoryMap[cat.categoryId]);
        }
      } else {
        tree.push(categoryMap[cat.categoryId]);
      }
    });
    return tree;
  };

  // ===== 1. Fetch categories using vendor-specific endpoint and build tree =====
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          `https://thrifstorebackend.onrender.com/api/vendor-categories/categories/vendor/${vendorId}`
        );
        console.log('Fetched flat categories:', response.data);
        const tree = buildCategoryTree(response.data);
        console.log('Built category tree:', tree);
        setCategories(tree);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    if (vendorId) {
      fetchCategories();
    }
  }, [vendorId]);

  // ===== 2. Expand/Collapse categories =====
  const toggleExpand = (catId) => {
    if (expandedCategoryIds.includes(catId)) {
      setExpandedCategoryIds(expandedCategoryIds.filter((id) => id !== catId));
    } else {
      setExpandedCategoryIds([...expandedCategoryIds, catId]);
    }
  };

  // ===== 3. Select/Deselect categories =====
  const handleCheckboxChange = (catId) => {
    if (selectedCategoryIds.includes(catId)) {
      setSelectedCategoryIds(selectedCategoryIds.filter((id) => id !== catId));
    } else {
      setSelectedCategoryIds([...selectedCategoryIds, catId]);
    }
  };

  // ===== 4. Create a new category =====
  const handleSave = async () => {
    if (!newCategory.name.trim()) {
      alert('Category name is required.');
      return;
    }
    try {
      const body = {
        vendor_id: vendorId,
        categoryId: 'CAT-' + Date.now().toString(36).toUpperCase(),
        name: newCategory.name.trim(),
        description: newCategory.description.trim(),
        parentCategory: newCategory.parentCategory || null,
        productCount: 0,
      };

      await axios.post(
        'https://thrifstorebackend.onrender.com/api/vendor-categories/category',
        body
      );
      // Re-fetch and rebuild the category tree so the UI reflects the change
      const updatedResponse = await axios.get(
        `https://thrifstorebackend.onrender.com/api/vendor-categories/categories/vendor/${vendorId}`
      );
      setCategories(buildCategoryTree(updatedResponse.data));
      setShowAddForm(false);
      setNewCategory({ name: '', description: '', parentCategory: null });
    } catch (error) {
      console.error('Failed to create category:', error);
      alert('Failed to create category. Check console for details.');
    }
  };

  // ===== 5. Rename categories =====
  const handleRename = async () => {
    if (selectedCategoryIds.length === 0) {
      alert('Please select at least one category to rename.');
      return;
    }
    const newName = prompt('Enter the new name for the selected category(ies):');
    if (!newName) return;
    try {
      for (const catId of selectedCategoryIds) {
        await axios.patch(
          `https://thrifstorebackend.onrender.com/api/vendor-categories/category/${catId}/rename`,
          { name: newName.trim() }
        );
      }
      const response = await axios.get(
        `https://thrifstorebackend.onrender.com/api/vendor-categories/categories/vendor/${vendorId}`
      );
      setCategories(buildCategoryTree(response.data));
      setSelectedCategoryIds([]);
      alert('Category(ies) renamed successfully!');
    } catch (error) {
      console.error('Rename failed:', error);
      alert('Failed to rename category(ies). Check console for details.');
    }
  };

  // ===== 6. Update a category (requires exactly one selected) =====
  const handleUpdate = async () => {
    if (selectedCategoryIds.length !== 1) {
      alert('Please select exactly one category to update.');
      return;
    }
    const catId = selectedCategoryIds[0];
    // Find the category in the flat list; since we have a tree, you might need a recursive search
    const findCategory = (nodes, targetId) => {
      for (const node of nodes) {
        if (node.categoryId === targetId) return node;
        if (node.subCategories && node.subCategories.length) {
          const found = findCategory(node.subCategories, targetId);
          if (found) return found;
        }
      }
      return null;
    };
    const category = findCategory(categories, catId);
    if (!category) {
      alert('Selected category not found.');
      return;
    }
    const newName = prompt('Enter new name:', category.name);
    if (!newName) return;
    const newDescription = prompt('Enter new description:', category.description || '');
    const newParent = prompt(
      'Enter new parent categoryId (or leave blank for none):',
      category.parentCategory || ''
    );
    try {
      await axios.put(
        `https://thrifstorebackend.onrender.com/api/vendor-categories/category/${catId}`,
        {
          vendor_id: vendorId,
          name: newName,
          description: newDescription,
          parentCategory: newParent || null,
          productCount: category.productCount || 0,
        }
      );
      const updatedResp = await axios.get(
        `https://thrifstorebackend.onrender.com/api/vendor-categories/categories/vendor/${vendorId}`
      );
      setCategories(buildCategoryTree(updatedResp.data));
      setSelectedCategoryIds([]);
      alert('Category updated successfully.');
    } catch (err) {
      console.error(err);
      alert('Failed to update category.');
    }
  };

  // ===== 7. Delete categories =====
  const handleDelete = async () => {
    if (selectedCategoryIds.length === 0) {
      alert('No categories selected.');
      return;
    }
    for (const catId of selectedCategoryIds) {
      try {
        await axios.delete(
          `https://thrifstorebackend.onrender.com/api/vendor-categories/category/${catId}`
        );
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
    const updatedResponse = await axios.get(
      `https://thrifstorebackend.onrender.com/api/vendor-categories/categories/vendor/${vendorId}`
    );
    setCategories(buildCategoryTree(updatedResponse.data));
    setSelectedCategoryIds([]);
    alert(`Deleted categories: ${selectedCategoryIds.join(', ')}`);
  };

  // ===== 8. Render category tree recursively =====
  const renderCategoryTree = (categoryList, depth = 0) => {
    return categoryList.map((cat) => {
      const hasChildren = cat.subCategories && cat.subCategories.length > 0;
      const isExpanded = expandedCategoryIds.includes(cat.categoryId);
      return (
        <div key={cat.categoryId} style={{ ...styles.treeItem, marginLeft: depth * 20 }}>
          <div style={styles.treeRow}>
            {hasChildren ? (
              <button
                style={styles.expandButton}
                onClick={() => toggleExpand(cat.categoryId)}
              >
                {isExpanded ? '▼' : '►'}
              </button>
            ) : (
              <span style={styles.expandPlaceholder}></span>
            )}
            <input
              type="checkbox"
              style={styles.treeCheckbox}
              checked={selectedCategoryIds.includes(cat.categoryId)}
              onChange={() => handleCheckboxChange(cat.categoryId)}
            />
            <div style={styles.categoryDetails}>
              <span style={styles.categoryName}>{cat.name}</span>
              {cat.description && (
                <span style={styles.categoryDescription}>{cat.description}</span>
              )}
            </div>
          </div>
          {hasChildren && isExpanded && renderCategoryTree(cat.subCategories, depth + 1)}
        </div>
      );
    });
  };

  // ===== 9. Render the main component =====
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Manage Your Categories</h1>
        <p style={styles.subtitle}>
          The more specific your categories, the easier it is for your customers to find products.
        </p>
        <button style={styles.addButton} onClick={() => setShowAddForm(true)}>
          + Add New Category
        </button>
      </header>

      {/* Add Category Form */}
      <div
        style={{
          ...styles.addFormContainer,
          maxHeight: showAddForm ? '500px' : '0px',
          opacity: showAddForm ? 1 : 0,
          padding: showAddForm ? '20px' : '0px 20px',
          marginBottom: showAddForm ? '20px' : '0px',
        }}
      >
        {showAddForm && (
          <div style={styles.addForm}>
            <h2 style={styles.formTitle}>Add New Category</h2>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Category Name</label>
              <input
                type="text"
                name="name"
                value={newCategory.name}
                onChange={(e) =>
                  setNewCategory((prev) => ({ ...prev, name: e.target.value }))
                }
                style={styles.formInput}
                placeholder="Enter category name"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Description</label>
              <textarea
                name="description"
                value={newCategory.description}
                onChange={(e) =>
                  setNewCategory((prev) => ({ ...prev, description: e.target.value }))
                }
                style={styles.formTextarea}
                placeholder="Enter category description"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Parent Category</label>
              <select
                name="parentCategory"
                value={newCategory.parentCategory || ''}
                onChange={(e) =>
                  setNewCategory((prev) => ({
                    ...prev,
                    parentCategory: e.target.value || null,
                  }))
                }
                style={styles.formSelect}
              >
                <option value="">None (Top-Level)</option>
                {/*
                  Optionally, you might want to build a flat list of all categories from your tree.
                  For simplicity, here we assume the tree is shallow enough or you have another function to flatten it.
                */}
                {categories.map((cat) => (
                  <option key={cat.categoryId} value={cat.categoryId}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div style={styles.formActions}>
              <button style={styles.saveButton} onClick={handleSave}>
                Save
              </button>
              <button style={styles.cancelButton} onClick={() => setShowAddForm(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedCategoryIds.length > 0 && (
        <div style={styles.bulkActions}>
          {selectedCategoryIds.length === 1 && (
            <button style={styles.actionButton} onClick={handleUpdate}>
              Update
            </button>
          )}
          <button style={styles.actionButton} onClick={handleRename}>
            Rename
          </button>
          <button
            style={{ ...styles.actionButton, backgroundColor: '#E14D2A' }}
            onClick={handleDelete}
          >
            Delete
          </button>
        </div>
      )}

      {/* Category Tree */}
      <div style={styles.categoryTree}>
        {categories.length > 0 ? (
          <div>{renderCategoryTree(categories, 0)}</div>
        ) : (
          <div style={styles.noCategories}>No categories found.</div>
        )}
      </div>
    </div>
  );
};

// ===== Inline Styles (unchanged) =====
const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#faf9fc',
    fontFamily: 'Arial, sans-serif',
    padding: '20px',
  },
  header: {
    background: 'linear-gradient(45deg, #8B26C2, #D873F5)',
    color: '#fff',
    padding: '20px',
    borderRadius: '10px',
    marginBottom: '20px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    position: 'relative',
  },
  title: { margin: 0, fontSize: '1.8rem' },
  subtitle: { marginTop: '8px', fontSize: '1rem', lineHeight: 1.4 },
  addButton: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    backgroundColor: '#fff',
    color: '#8B26C2',
    border: 'none',
    padding: '10px 18px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold',
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
    transition: 'background-color 0.3s, color 0.3s',
  },
  bulkActions: {
    backgroundColor: '#fff',
    borderRadius: '10px',
    padding: '10px 20px',
    marginBottom: '20px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
    display: 'flex',
    gap: '10px',
  },
  actionButton: {
    backgroundColor: '#36A2EB',
    color: '#fff',
    border: 'none',
    padding: '8px 14px',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  treeItem: { marginBottom: '8px' },
  treeRow: {
    display: 'flex',
    alignItems: 'flex-start',
    backgroundColor: '#f9f9f9',
    border: '1px solid #eee',
    padding: '8px 12px',
    borderRadius: '6px',
    transition: 'background-color 0.3s',
  },
  expandButton: {
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    marginRight: '6px',
    fontSize: '1rem',
    color: '#666',
  },
  expandPlaceholder: { display: 'inline-block', width: '1em', marginRight: '6px' },
  treeCheckbox: { marginRight: '10px', marginTop: '2px', cursor: 'pointer' },
  categoryDetails: { display: 'flex', flexDirection: 'column' },
  categoryName: { fontSize: '1rem', fontWeight: 'bold', marginBottom: '3px', color: '#333' },
  categoryDescription: { fontSize: '0.85rem', fontStyle: 'italic', color: '#666', lineHeight: 1.3 },
  addFormContainer: {
    backgroundColor: '#fff',
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
    overflow: 'hidden',
    transition: 'max-height 0.5s ease, opacity 0.5s ease, padding 0.5s ease, margin-bottom 0.5s ease',
  },
  addForm: { display: 'flex', flexDirection: 'column' },
  formTitle: { margin: '0 0 15px 0', fontSize: '1.5rem', color: '#333' },
  formGroup: { marginBottom: '15px' },
  formLabel: { display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' },
  formInput: { width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '1rem' },
  formTextarea: { width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '1rem', resize: 'vertical', minHeight: '80px' },
  formSelect: { width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '1rem', backgroundColor: '#fff', appearance: 'none' },
  formActions: { display: 'flex', justifyContent: 'flex-end', gap: '10px' },
  saveButton: { backgroundColor: '#28A745', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', transition: 'background-color 0.3s' },
  cancelButton: { backgroundColor: '#DC3545', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', transition: 'background-color 0.3s' },
};

export default CategoryList;
