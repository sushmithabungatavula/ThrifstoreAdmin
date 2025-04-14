// Layout.js
import React from 'react';
import Sidebar from './sidebar.js';
import TopBar from './topbar.js';
import './layout.css';

function Layout({ children }) {
  return (
    <div className="layout">
      <TopBar />
      <div className="body">
        <Sidebar />
        <div className="content">{children}</div>
      </div>
    </div>
  );
}

export default Layout;
