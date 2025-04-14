// components/SubCategorySelect.js
import React from 'react';
import styled from 'styled-components';

const SubCategorySelect = ({ categoryId, categories, subCategory, setSubCategory }) => {
  const selectedCategory = categories.find((c) => c._id === categoryId);
  const hasSubCategories = selectedCategory?.subCategories?.length > 0;

  if (!hasSubCategories) return null;

  return (
    <Row>
      <Label>Sub-Category:</Label>
      <Select
        value={subCategory}
        onChange={(e) => setSubCategory(e.target.value)}
      >
        <option value="">Select Sub-Category</option>
        {selectedCategory.subCategories.map((sub) => (
          <option key={sub._id} value={sub._id}>
            {sub.name}
          </option>
        ))}
      </Select>
    </Row>
  );
};

export default SubCategorySelect;
