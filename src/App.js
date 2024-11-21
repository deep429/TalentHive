import { useEffect } from 'react';
import './App.css';
import Home from './components/Home';
import About from './components/Aboutpage';
import Login from './components/LoginPage';
import SignUp from './components/SignUp';
import Forgot from './components/ForgotPasswordPage';
import WebFont from 'webfontloader';
import { Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';

const clientId = '807683035814-jhd5tkkio32lhdaq04b2h63kdceoohnn.apps.googleusercontent.com'; // Replace with your actual Client ID

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
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<Forgot />} />
      </Routes>
    </GoogleOAuthProvider>
  );
}

export default App;