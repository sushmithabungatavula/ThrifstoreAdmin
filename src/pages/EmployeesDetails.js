// src/pages/EmployeeDetails.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './EmployeeDetails.css';

/* -----------------------------------------------------------
   Config – adapt once if the server URL changes
----------------------------------------------------------- */
const API_BASE =  'http://localhost:3000/api';

/* -----------------------------------------------------------
   Helpers
----------------------------------------------------------- */
const generateEmployeeId = () =>
  `emp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

const blankEmployee = {
  employee_id: '',
  name: '',
  email: '',
  phone: '',
  role: '',
  /* vendor_id gets injected just before submit */
  status: 'active',
};

export default function EmployeeDetails() {
  const [employees,   setEmployees]   = useState([]);
  const [formData,    setFormData]    = useState(blankEmployee);
  const [editingId,   setEditingId]   = useState(null);   // null → add-mode
  const [formVisible, setFormVisible] = useState(false);

  /* ---------------- FETCH ALL EMPLOYEES ------------------ */
  useEffect(() => { fetchEmployees(); }, []);

  const fetchEmployees = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/employee`);
      setEmployees(data);
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  /* ------------------- ADD / EDIT FORM ------------------- */
  const openAddForm = () => {
    setFormData({
      ...blankEmployee,
      employee_id: generateEmployeeId(),
    });
    setEditingId(null);
    setFormVisible(true);
  };

  const openEditForm = (emp) => {
    setFormData(emp);
    setEditingId(emp.employee_id);
    setFormVisible(true);
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    // Inject vendor_id just before hitting the API
    const vendor_id = localStorage.getItem('vendor_id') || '';
    const payload   = { ...formData, vendor_id };

    try {
      if (editingId) {
        await axios.put(`${API_BASE}/employee/${editingId}`, payload);   // UPDATE
      } else {
        await axios.post(`${API_BASE}/employee`,        payload);        // ADD
      }
      closeFormAndRefresh();
    } catch (err) {
      console.error('Save failed:', err);
    }
  };

  const deleteEmployee = async (id) => {
    if (!window.confirm('Delete this employee?')) return;
    try {
      await axios.delete(`${API_BASE}/employee/${id}`);
      fetchEmployees();
    } catch (err) {
      console.error('Error deleting employee:', err);
    }
  };

  const closeFormAndRefresh = () => {
    setFormVisible(false);
    setEditingId(null);
    setFormData(blankEmployee);
    fetchEmployees();
  };

  /* ------------------------ RENDER ------------------------ */
  return (
    <div className="employee-details-page">
      {/* ------ Page Header ------ */}
      <div className="page-bar">
        <h2>Employee Details</h2>
        <button className="add-btn" onClick={openAddForm}>Add Employee</button>
      </div>

      {/* ------ Add / Edit Form ------ */}
      {formVisible && (
        <form className="emp-form" onSubmit={onSubmit}>
          <h3>{editingId ? `Update Employee: ${editingId}` : 'Add New Employee'}</h3>

          <div className="grid">
            <div>
              <label>Name</label>
              <input
                name="name"
                value={formData.name}
                onChange={onChange}
                required
              />
            </div>

            <div>
              <label>Email</label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={onChange}
                required
              />
            </div>

            <div>
              <label>Phone</label>
              <input
                name="phone"
                value={formData.phone}
                onChange={onChange}
                required
              />
            </div>

            <div>
              <label>Role</label>
              <input
                name="role"
                value={formData.role}
                onChange={onChange}
                required
              />
            </div>

            <div>
              <label>Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={onChange}
                required
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn save">
            {editingId ? 'Update' : 'Save'}
          </button>
          <button type="button" className="btn cancel" onClick={closeFormAndRefresh}>
            Cancel
          </button>
        </form>
      )}

      {/* ------ Employees Table ------ */}
      <table className="employee-table">
        <thead>
          <tr>
            <th>ID</th><th>Name</th><th>Email</th><th>Phone</th>
            <th>Role</th><th>Vendor</th><th>Status</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <tr key={emp.employee_id}>
              <td>{emp.employee_id}</td>
              <td>{emp.name}</td>
              <td>{emp.email}</td>
              <td>{emp.phone}</td>
              <td>{emp.role}</td>
              <td>{emp.vendor_id}</td>
              <td>{emp.status}</td>
              <td>
                <button
                  className="action-btn edit"
                  onClick={() => openEditForm(emp)}
                >
                  Edit
                </button>{' '}
                <button
                  className="action-btn delete"
                  onClick={() => deleteEmployee(emp.employee_id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
 
