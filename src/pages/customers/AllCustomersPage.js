import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AllCustomersPage.css';
import { FaSearch, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import axios from 'axios';

function AllCustomersPage() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilterOpen, setDateFilterOpen] = useState(false);
  const [sortOption, setSortOption] = useState('Most Orders');

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/customers');
        setCustomers(response.data);
      } catch (error) {
        console.error('Error fetching customers:', error);
      }
    };
    fetchCustomers();
  }, []);

  const handleRowClick = (customerId) => {
    navigate(`/Customer/CustomerOverviewPage?cid=${customerId}`);
  };

  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleStatusFilter = (status) => setStatusFilter(status);
  const handleSortOptionChange = (e) => setSortOption(e.target.value);
  const toggleDateFilter = () => setDateFilterOpen((prev) => !prev);

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'All' ? true : c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="all-customers-page">
      <div className="header-section">
        <h1>ALL CUSTOMERS</h1>
        <p className="subtitle">
          Manage your eco-conscious buyers, see purchase history, and track loyalty.
        </p>
      </div>

      <div className="filters-container">
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by name, email…"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        <div className="status-filters">
          {['All', 'Active', 'Inactive'].map((status) => (
            <button
              key={status}
              onClick={() => handleStatusFilter(status)}
              className={statusFilter === status ? 'active' : ''}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="date-filter">
          <button onClick={toggleDateFilter} className="date-filter-toggle">
            Date Joined {dateFilterOpen ? <FaChevronUp /> : <FaChevronDown />}
          </button>
          {dateFilterOpen && (
            <div className="date-range-selector">
              <label>
                From:
                <input type="date" />
              </label>
              <label>
                To:
                <input type="date" />
              </label>
            </div>
          )}
        </div>

       
      </div>

      <div className="customers-table-wrapper">
        <table className="customers-table">
          <thead>
            <tr>
              <th>Name / Email</th>
              <th>Phone</th>
              <th>Location</th>
              <th>Date Joined</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((customer) => (
              <tr
                key={customer.id}
                onClick={() => handleRowClick(customer.id)}
                className="customer-row"
              >
                <td>
                  <div className="name-email">
                    <span className="customer-name">{customer.name}</span>
                    <span className="customer-email">{customer.email}</span>
                  </div>
                </td>
                <td>{customer.phone}</td>
                <td>{customer.address}</td>
                <td>{customer.registration_date}</td>
                <td className={customer.status === 'Active' ? 'status-active' : 'status-inactive'}>
                  {customer.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button disabled>&lt;</button>
        <span> Page 1 of 1 </span>
        <button disabled>&gt;</button>
      </div>
    </div>
  );
}

export default AllCustomersPage;
