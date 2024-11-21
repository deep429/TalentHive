import { useEffect } from 'react';
import './App.css';
import Home from './components/Home';
import About from './components/Aboutpage';
import Login from './components/LoginPage';
import SignUp from './components/SignUp';
import Forgot from './components/ForgotPasswordPage';
import ExploreFeatures from "./components/ExploreFeatures";
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
      </Routes>
    </GoogleOAuthProvider>
  );
}

export default App;