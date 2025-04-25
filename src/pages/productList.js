import React, { useState, useEffect, useContext } from 'react';
import styled, { keyframes } from 'styled-components';
import axios from 'axios';
import { LoginContext } from '../context/loginContext';
import ReactPaginate from 'react-paginate';
import { useDropzone } from 'react-dropzone';

const ProductList = () => {
  const { vendorInfo } = useContext(LoginContext);
  const vendorId = localStorage.getItem('vendorId');

  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage] = useState(10);

  const [showUploadContainer, setShowUploadContainer] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewItem, setViewItem] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');

  const [editItemData, setEditItemData] = useState({
    categoryId: '',  
    name: '',
    brand: '',
    size: '',
    color: '',
    item_condition: '',
    cost_price: 0,
    selling_price: 0,
    stock_quantity: 0,
    imageURL: '',
    description: '',
    review: 0,
  });

  const [uploadedImages, setUploadedImages] = useState([]); // For handling uploaded images
  const [imagePreviews, setImagePreviews] = useState([]);
  const [categories, setCategories] = useState([]);

  const fetchItemsByVendor = async (vendorId) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/vendor/${vendorId}/items`);
      if (Array.isArray(response.data)) {
        setItems(response.data);
        setFilteredItems(response.data);
      }
    } catch (error) {
      console.error('Error fetching items by vendor:', error);
    }
  };

  useEffect(() => {
    const vendorId = localStorage.getItem('vendorId');
    if (vendorId) {
      fetchItemsByVendor(vendorId);
    }
  }, [vendorId, currentPage]);


  const fetchCategories = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/vendor-categories/categories/vendor/${vendorId}`);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };
  
  useEffect(() => {
    if (vendorId) {
      fetchCategories();
    }
  }, [vendorId]);

  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
  };

  const handleViewItem = (item) => {
    setViewItem(item);
    setShowViewModal(true);
  };

  const handleItemUpdate = (item) => {
    setEditItemData(item);
    setUploadedImages(item.imageURL ? [item.imageURL] : []); // Pre-fill with existing images if editing
    setShowEditModal(true);
  };

  const handleItemDelete = async (itemId) => {
    try {
      await axios.delete(`http://localhost:3000/api/item/deleteitem/${itemId}`);
      const vendorId = localStorage.getItem('vendorId');
      fetchItemsByVendor(vendorId);
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleItemSave = async () => {
    const newItem = { ...editItemData, imageURL: uploadedImages.join(',') };
    try {
      await axios.put(`http://localhost:3000/api/item/updateitem/${editItemData.item_id}`, newItem);
      const vendorId = localStorage.getItem('vendorId');
      fetchItemsByVendor(vendorId);
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };
  
  const handleItemAdd = async () => {
    const newItem = { ...editItemData, vendor_id: vendorId };
    try {
      await axios.post('http://localhost:3000/api/item/additem', newItem);
      const vendorId = localStorage.getItem('vendorId');
      fetchItemsByVendor(vendorId);
      setShowUploadContainer(false);
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };
  
  const handleAddItemClick = () => {
    setEditItemData({
      categoryId: '', // reset the category
      name: '',
      brand: '',
      size: '',
      color: '',
      item_condition: '',
      cost_price: 0,
      selling_price: 0,
      stock_quantity: 0,
      imageURL: '',
      description: '',
      review: 0,
    });
    setViewItem(null);
    setUploadedImages([]);
    setShowUploadContainer(true);
  };


// Replace handleImageUpload and useDropzone with new implementation
const onDrop = (acceptedFiles) => {
  setUploadedImages((prev) => [...prev, ...acceptedFiles]);

  const previews = acceptedFiles.map((file) =>
    Object.assign(file, {
      preview: URL.createObjectURL(file),
    })
  );
  setImagePreviews((prev) => [...prev, ...previews]);
};

const { getRootProps, getInputProps, isDragActive } = useDropzone({
  onDrop,
  accept: 'image/*',
});

// Updated removeImage function
const removeImage = (index) => {
  const removedFile = imagePreviews[index];
  URL.revokeObjectURL(removedFile.preview);

  setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  setImagePreviews((prev) => prev.filter((_, i) => i !== index));
};

// Add uploadImages function
const uploadImages = async () => {
  if (uploadedImages.length === 0) {
    alert('No product images to upload.');
    return;
  }

  try {
    const uploadPromises = uploadedImages.map(async (file) => {
      const formData = new FormData();
      formData.append('image', file);
      const response = await axios.post(
        'http://localhost:3000/upload_product_image/thriftStoreImageUpload',
        formData,

      );
      return response.data.imageUrl;
    });

    const urls = await Promise.all(uploadPromises);
    const validUrls = urls.filter((url) => url !== null);
    
    const existingUrls = editItemData.imageURL ? editItemData.imageURL.split(',') : [];
    const allUrls = [...existingUrls, ...validUrls].join(',');

    setEditItemData(prev => ({
      ...prev,
      imageURL: allUrls,
    }));
    
    setUploadedImages([]);
    setImagePreviews([]);
    alert('Product images uploaded successfully!');
  } catch (error) {
    console.error('Error uploading product images:', error);
    alert('One or more product images failed to upload.');
  }
};


  const paginatedItems = () => {
    const offset = currentPage * itemsPerPage;
    return filteredItems.slice(offset, offset + itemsPerPage);
  };

  return (
    <Container>
      <Main>
        <ContentWrapper>
          <SearchInput
            type="text"
            placeholder="Search items..."
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <FiltersContainer>
            <AddButton onClick={handleAddItemClick}>Add Item</AddButton>
          </FiltersContainer>

          {/* Products rendered in table-like rows */}
          <TableContainer>
            <TableHeader>
              <HeaderCell>Image</HeaderCell>
              <HeaderCell>Name</HeaderCell>
              <HeaderCell>Price</HeaderCell>
              <HeaderCell>Stock</HeaderCell>
              <HeaderCell>Actions</HeaderCell>
            </TableHeader>
            {paginatedItems().map((item) => (
              <ProductRow key={item.item_id}>
                <ImageCell>
                  <ProductImg src={item.imageURL || ''} alt={item.name} />
                </ImageCell>
                <TextCell>{item.name}</TextCell>
                <TextCell>$ {item.selling_price}</TextCell>
                <TextCell>{item.stock_quantity}</TextCell>
                <ActionsCell>
                  <ButtonGroupVertical>
                    <ViewButton onClick={() => handleViewItem(item)}>
                      View
                    </ViewButton>
                    <EditButton onClick={() => handleItemUpdate(item)}>
                      Edit
                    </EditButton>
                    <DeleteButton onClick={() => handleItemDelete(item.item_id)}>
                      Delete
                    </DeleteButton>
                  </ButtonGroupVertical>
                </ActionsCell>
              </ProductRow>
            ))}
          </TableContainer>

          <PaginateContainer>
            <UpdatedReactPaginate
              previousLabel="Previous"
              nextLabel="Next"
              pageCount={Math.ceil(filteredItems.length / itemsPerPage)}
              onPageChange={handlePageClick}
              containerClassName="pagination-container"
              activeClassName="active"
              pageClassName="pagination-item"
              previousClassName="previous-button"
              nextClassName="next-button"
            />
          </PaginateContainer>
        </ContentWrapper>
      </Main>

      {/* Add/Edit Item Modal */}
      {(showUploadContainer || showEditModal) && (
  <Modal onClick={(e) => e.stopPropagation()}>
    <ModalTitle>{showUploadContainer ? 'Add Item' : 'Edit Item'}</ModalTitle>
    
    <InputRowGroup>
      <InputRow>
        <Label>Name:</Label>
        <Input
          type="text"
          value={editItemData.name}
          onChange={(e) => setEditItemData({ ...editItemData, name: e.target.value })}
        />
      </InputRow>
      <InputRow>
        <Label>Brand:</Label>
        <Input
          type="text"
          value={editItemData.brand}
          onChange={(e) => setEditItemData({ ...editItemData, brand: e.target.value })}
        />
      </InputRow>
    </InputRowGroup>

    <InputRowGroup>
      <InputRow>
        <Label>Size:</Label>
        <Input
          type="text"
          value={editItemData.size}
          onChange={(e) => setEditItemData({ ...editItemData, size: e.target.value })}
        />
      </InputRow>
      <InputRow>
        <Label>Color:</Label>
        <Input
          type="text"
          value={editItemData.color}
          onChange={(e) => setEditItemData({ ...editItemData, color: e.target.value })}
        />
      </InputRow>
    </InputRowGroup>


    {/* Keep other input rows as single column */}
    <InputRow>
      <Label>Price:</Label>
      <Input
        type="number"
        value={editItemData.selling_price}
        onChange={(e) => setEditItemData({ ...editItemData, selling_price: e.target.value })}
      />
    </InputRow>

          <InputRow>
            <Label>Description:</Label>
            <Input
              type="text"
              value={editItemData.description}
              onChange={(e) =>
                setEditItemData({ ...editItemData, description: e.target.value })
              }
            />
          </InputRow>
          <InputRow>
            <Label>Category:</Label>
            <Select 
              value={editItemData.categoryId} 
              onChange={(e) => setEditItemData({ ...editItemData, categoryId: e.target.value })}
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                // Use category.categoryId for the value
                <option key={category.categoryId} value={category.categoryId}>
                  {category.name}
                </option>
              ))}
            </Select>
          </InputRow>
          <InputRow>
  <Label>Images:</Label>
  <div {...getRootProps()}>
    <input {...getInputProps()} />
    <Dropzone>
      {isDragActive ? (
        <p>Drop images here...</p>
      ) : (
        <p>Drag & Drop your images here, or click to select files.</p>
      )}
    </Dropzone>
  </div>
  <PreviewContainer>
    {/* Existing images */}
    {editItemData.imageURL && 
     editItemData.imageURL.split(',').map((url, index) => (
      <ImagePreview key={`existing-${index}`}>
        <PreviewImg src={url} alt="existing preview" />
      </ImagePreview>
    ))}
    
    {/* New image previews */}
    {imagePreviews.map((file, index) => (
      <ImagePreview key={`new-${index}`}>
        <PreviewImg src={file.preview} alt="new preview" />
        <RemoveImageButton onClick={() => removeImage(index)}>
          Remove
        </RemoveImageButton>
      </ImagePreview>
    ))}
  </PreviewContainer>
  <PrimaryButton onClick={uploadImages} type="button">
    Upload Images
  </PrimaryButton>
</InputRow>
          <ButtonsRow>
            <PrimaryButton onClick={showUploadContainer ? handleItemAdd : handleItemSave}>
              {showUploadContainer ? 'Add Item' : 'Save Changes'}
            </PrimaryButton>
            <PrimaryButton
              onClick={() =>
                showUploadContainer ? setShowUploadContainer(false) : setShowEditModal(false)
              }
            >
              Cancel
            </PrimaryButton>
          </ButtonsRow>
        </Modal>
      )}

      {/* View Item Modal */}
      {showViewModal && (
        <Modal onClick={(e) => e.stopPropagation()}>
          <ModalTitle>View Item</ModalTitle>
          <ul>
            <ListItem>Name: {viewItem.name}</ListItem>
            <ListItem>Brand: {viewItem.brand}</ListItem>
            <ListItem>Price: $ {viewItem.selling_price}</ListItem>
            <ListItem>Description: {viewItem.description}</ListItem>
            <ListItem>Stock: {viewItem.stock_quantity}</ListItem>
          </ul>
          <PrimaryButton onClick={() => setShowViewModal(false)}>Close</PrimaryButton>
        </Modal>
      )}
    </Container>
  );
};

export default ProductList;

// ----- Styled Components (move these to top or a separate file) -----


export const Container = styled.div`
  padding: 30px;
  background: #f8f9fa;
  min-height: 100vh;
  font-family: 'Roboto', sans-serif;
`;

export const Main = styled.main`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const ContentWrapper = styled.div`
  width: 100%;
  max-width: 1200px;
  background: #fff;
  border-radius: 10px;
  padding: 30px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
`;

export const SearchInput = styled.input`
  padding: 12px 15px;
  width: 100%;
  border-radius: 30px;
  border: 1px solid #ced4da;
  margin-bottom: 20px;
  font-size: 1rem;
  &:focus {
    outline: none;
    border-color: #000000;
  }
`;

export const FiltersContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  margin-bottom: 25px;
`;

export const AddButton = styled.button`
  background: #000000;
  color: #ffffff;
  padding: 12px 25px;
  border: none;
  border-radius: 30px;
  font-size: 1rem;
  cursor: pointer;
  transition: transform 0.2s ease;
  &:hover {
    transform: scale(1.02);
  }
`;

export const TableContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export const TableHeader = styled.div`
  display: flex;
  padding: 15px 20px;
  background-color: #e9ecef;
  font-weight: bold;
  border-radius: 5px;
  margin-bottom: 10px;
`;

export const HeaderCell = styled.div`
  flex: 1;
  text-align: center;
`;

export const ProductRow = styled.div`
  display: flex;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #dee2e6;
  transition: background-color 0.3s;
  &:hover {
    background-color: #f1f3f5;
  }
`;

export const ImageCell = styled.div`
  flex: 0 0 80px;
  text-align: center;
`;

export const ProductImg = styled.img`
  width: 70px;
  height: 70px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #ced4da;
`;

export const TextCell = styled.div`
  flex: 1;
  text-align: center;
  font-size: 1rem;
`;

export const ActionsCell = styled.div`
  flex: 0 0 120px;
  text-align: center;
`;

export const ButtonGroupVertical = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const ViewButton = styled.button`
  padding: 8px 15px;
  background: #000000;
  color: #fff;
  border: none;
  border-radius: 30px;
  font-size: 0.9rem;
  cursor: pointer;
`;

export const EditButton = styled(ViewButton)`
  background: #333333;
`;

export const DeleteButton = styled(ViewButton)`
  background: #dc3545;
`;

export const Modal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  background: #fff;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
  z-index: 1100;
  overflow-y: auto;
`;

export const ModalTitle = styled.h2`
  margin-bottom: 25px;
  text-align: center;
  color: #1e1e1e;
`;

export const InputRowGroup = styled.div`
  display: flex;
  gap: 15px;
  width: 100%;
  > div {
    flex: 1;
  }
`;

export const InputRow = styled.div`
  margin-bottom: 15px;
`;

export const Label = styled.label`
  display: block;
  font-size: 1rem;
  margin-bottom: 8px;
  color: #495057;
`;

export const Input = styled.input`
  width: 100%;
  padding: 10px 15px;
  font-size: 1rem;
  border: 1px solid #ced4da;
  border-radius: 30px;
  &:focus {
    outline: none;
    border-color: #000000;
  }
`;

export const Select = styled.select`
  width: 100%;
  padding: 10px 15px;
  font-size: 1rem;
  border: 1px solid #ced4da;
  border-radius: 30px;
`;

export const ButtonsRow = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 20px;
  gap: 15px;
`;

export const PrimaryButton = styled.button`
  padding: 10px 25px;
  background: #000000;
  color: #fff;
  border: none;
  border-radius: 30px;
  font-size: 1rem;
  cursor: pointer;
  transition: transform 0.2s ease;
  &:hover {
    transform: scale(1.03);
  }
`;

export const Dropzone = styled.div`
  border: 2px dashed #000000;
  padding: 30px;
  border-radius: 10px;
  text-align: center;
  color: #1e1e1e;
  cursor: pointer;
  margin-bottom: 15px;
  transition: background 0.3s ease;
  &:hover {
    background: #e9ecef;
  }
`;

export const PreviewContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
`;

export const ImagePreview = styled.div`
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #ced4da;
`;

export const PreviewImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export const RemoveImageButton = styled.button`
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(220,53,69, 0.9);
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  font-size: 0.75rem;
  cursor: pointer;
`;

export const ListItem = styled.li`
  font-size: 0.95rem;
  color: #495057;
  margin-bottom: 5px;
`;

export const PaginateContainer = styled.div`
  margin-top: 30px;
  display: flex;
  justify-content: center;
`;

export const UpdatedReactPaginate = styled(ReactPaginate)`
  li {
    list-style: none;
    display: inline-block;
    margin: 0 5px;
    a {
      padding: 10px 15px;
      border-radius: 5px;
      border: 1px solid #ced4da;
      cursor: pointer;
      transition: all 0.2s ease;
      color: #495057;
      text-decoration: none;
    }
    &.active a {
      background-color: #000000;
      color: #fff;
      border-color: #000000;
    }
    a:hover {
      background-color: #000000;
      color: #fff;
    }
  }
`;