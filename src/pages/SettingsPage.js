
import React from 'react';

// import every individual settings section
import StoreDetailsPage       from './settings/StoreDetailsPage';
import LocationsPage          from './settings/LocationsPage';
import ShippingDeliveryPage   from './settings/ShippingDeliveryPage';
import PaymentsPage           from './settings/PaymentsPage';
import CheckoutPage           from './settings/CheckoutPage';
import StoreNotificationsPage from './settings/StoreNotificationsPage';
import './SettingsPage.css';           


export default function SettingsPage() {
  return (
    <div className="settings-page">
      <StoreDetailsPage />
      <LocationsPage />
      <ShippingDeliveryPage />
      <PaymentsPage />
      <CheckoutPage />
      <StoreNotificationsPage />
    </div>
  );
}
