import React, { useState } from 'react';
import './App.css';
import { LanguageProvider } from './context/LanguageContext';
import Navigation from './components/Navigation';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RoleSelectionPage from './pages/RoleSelectionPage';
import UserRegistrationPage from './pages/UserRegistrationPage';
import VendorRegistrationPage from './pages/VendorRegistrationPage';
import UserDashboard from './pages/UserDashboard';
import VendorDashboard from './pages/VendorDashboard';

function App() {
  const [currentPage, setCurrentPage] = useState('landing-page');
  const [currentUser, setCurrentUser] = useState(null);

  return (
    <LanguageProvider>
      <div className="App">
        <Navigation 
          setCurrentPage={setCurrentPage} 
          user={currentUser}
          setCurrentUser={setCurrentUser}
        />
        
        {currentPage === 'landing-page' && (
          <LandingPage setCurrentPage={setCurrentPage} />
        )}
        
        {currentPage === 'login-page' && (
          <LoginPage 
            setCurrentPage={setCurrentPage} 
            setCurrentUser={setCurrentUser}
          />
        )}
        
        {currentPage === 'role-selection-page' && (
          <RoleSelectionPage setCurrentPage={setCurrentPage} />
        )}
        
        {currentPage === 'user-registration-page' && (
          <UserRegistrationPage 
            setCurrentPage={setCurrentPage} 
            setCurrentUser={setCurrentUser}
          />
        )}
        
        {currentPage === 'vendor-registration-page' && (
          <VendorRegistrationPage 
            setCurrentPage={setCurrentPage} 
            setCurrentUser={setCurrentUser}
          />
        )}
        
        {currentPage === 'user-dashboard' && (
          <UserDashboard 
            setCurrentPage={setCurrentPage} 
            user={currentUser}
          />
        )}
        
        {currentPage === 'vendor-dashboard' && (
          <VendorDashboard 
            setCurrentPage={setCurrentPage} 
            user={currentUser}
          />
        )}
      </div>
    </LanguageProvider>
  );
}

export default App;