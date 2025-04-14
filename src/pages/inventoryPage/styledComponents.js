// src/components/InventoryPage/styledComponents.js
import styled from 'styled-components';

// Main container
export const InventoryPageContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  background-color: #f9f9f9;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  display: flex;
  flex-direction: column;
`;

// Top Section containing Map and Calendar
export const TopSection = styled.div`
  display: flex;
  gap: 1.5rem;
  padding: 1rem;
  background-color: #fff;
  border-bottom: 1px solid #ddd;
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

// Map Wrapper for Leaflet Map
export const MapWrapper = styled.div`
  flex: 2;
  position: relative;
  border: 1px solid #ccc;
  border-radius: 5px;
  height: 300px;
  background-color: #eee;
  overflow: hidden;

  /* Ensuring the Leaflet map takes full size */
  .leaflet-container {
    height: 100%;
    width: 100%;
  }
`;

// Dropdown for selecting Warehouse
export const InventoryDropdown = styled.select`
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 8px;
  border-radius: 5px;
  border: 1px solid #aaa;
  background-color: #fff;
  font-size: 14px;
  z-index: 2000; /* Increased z-index to ensure it stays above the map */
`;

// Calendar Wrapper for react-calendar
export const CalendarWrapper = styled.div`
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  background-color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  /* Customizing react-calendar */
  .react-calendar {
    width: 100%;
    max-width: 350px;
    background: white;
    border: 1px solid #a0a096;
    border-radius: 8px;
    padding: 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .react-calendar__tile--active {
    background: #007BFF !important;
    color: white !important;
  }

  .react-calendar__tile--now {
    background: #f0f8ff !important;
    border-radius: 50% !important;
  }
`;

// Tabs Container
export const TabsContainer = styled.div`
  display: flex;
  background-color: #fff;
  border-bottom: 1px solid #ddd;
`;

// Individual Tab Button
export const TabButton = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: ${(props) => (props.active ? '#eee' : 'transparent')};
  border: none;
  border-bottom: ${(props) => (props.active ? '4px solid #2AB674' : 'none')};
  color: #333;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  outline: none;
  transition: background-color 0.3s;

  &:hover {
    background-color: #f2f2f2;
  }
`;

// Content Area for Active Tab
export const TabContentArea = styled.div`
  flex: 1;
  padding: 1rem;
  overflow: auto;
  border: 1px solid #ccc;
  border-top: none;
  border-radius: 0 4px 4px 4px;
  background-color: #fff;
  min-height: 300px; /* Adjust as needed */
`;

// Table Header Style
export const thStyle = {
  padding: '0.75rem',
  borderBottom: '1px solid #ddd',
  textAlign: 'left',
  fontWeight: 'bold',
};

// Table Data Cell Style
export const tdStyle = {
  padding: '0.75rem',
  borderBottom: '1px solid #eee',
};

// ---------------------------------------------------
// New Styled Components for WarehouseDetailsTab
// ---------------------------------------------------

// Container for Warehouse Details
export const DetailsContainer = styled.div`
  padding: 20px;
  background-color: #f9f9f9;
`;

// Individual Field Wrapper
export const DetailField = styled.div`
  margin-bottom: 15px;
`;

// Label for Form Fields
export const Label = styled.label`
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
`;

// Input Field
export const Input = styled.input`
  padding: 8px;
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

// Text Area Field
export const TextArea = styled.textarea`
  padding: 8px;
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #ccc;
  border-radius: 4px;
  resize: vertical;
`;

// Submit Button
export const Button = styled.button`
  padding: 10px 15px;
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 4px;
  font-size: 16px;

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }

  &:hover:enabled {
    background-color: #0056b3;
  }
`;

// Error Message
export const ErrorMessage = styled.p`
  color: red;
`;

// Success Message
export const SuccessMessage = styled.p`
  color: green;
`;

// ---------------------------------------------------
// Optional: Additional Styled Components
// ---------------------------------------------------

// Form Title
export const FormTitle = styled.h3`
  margin-bottom: 20px;
`;

// Section Title
export const SectionTitle = styled.h4`
  margin-top: 20px;
  margin-bottom: 10px;
  color: #333;
`;

// ---------------------------------------------------
