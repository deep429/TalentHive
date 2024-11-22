import { useEffect } from 'react';
import './App.css';
import Home from './components/Home';
import About from './components/About/Aboutpage';
import Login from './components/Auth/LoginPage';
import SignUp from './components/Auth/SignUp';
import Forgot from './components/Auth/ForgotPasswordPage';
import Dashboard from './components/JobPortal/Dashboard';
import ExploreFeatures from "./components/About/ExploreFeatures";
import EditProfile from './components/JobPortal/EditProfile';
import WebFont from 'webfontloader';
import { Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';

const clientId = process.env.REACT_APP_CLIENT_ID; // Replace with your actual Client ID

function App() {
  useEffect(() => {
    WebFont.load({
      google: {
        families: ['Pacifico', 'Poppins']
      }
    });
  }, []);

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <Routes>
        console.log("running  ")
        
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<Forgot />} />
        <Route path="/features" element={<ExploreFeatures />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/edit-profile" element={<EditProfile />} />
      </Routes>
    </GoogleOAuthProvider>
  );
}

export default App;