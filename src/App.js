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
import UserTypeSelectionPage from './components/Auth/UserType';
import Recruiter from './components/Auth/Recuirter';
import Admin from './components/Auth/Admin';
import AdminDashboard from './components/JobPortal/AdminDashboard';
import RecruiterDashboard from './components/JobPortal/RecruiterDashboard';
import JobManagement from './components/JobPortal/JobManagement';
import JobApplication from './components/JobPortal/JobApplication';
import MyJobs from './components/JobPortal/JobPosting';
import Applications from './components/JobPortal/JobApplicationRecru';
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
        <Route path="/user" element={<UserTypeSelectionPage />} />
        <Route path="/recruiter" element={<Recruiter />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/recruiterdash" element={<RecruiterDashboard />} />
        <Route path="/admindash" element={<AdminDashboard />} />
        <Route path="/job-management" element={<JobManagement />} />
        <Route path="/job-application" element={<JobApplication />} />
        <Route path="/my-jobs" element={<MyJobs />} />
        <Route path="/applications" element={<Applications />} />

      </Routes>
    </GoogleOAuthProvider>
  );
}

export default App;