const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
require('dotenv').config({path: '../.env' });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/profile-pictures', express.static(path.join(__dirname, 'profile-pictures')));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jobPortal', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

// Define Job Schema
const jobSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    studentName: { type: String, required: true },
    jobTitle: { type: String, required: true },
    companyName: { type: String, required: true },
    keywords: { type: [String], required: true },
    jobDescription: { type: String, required: true },
    salaryRange: { type: String, required: true },
    jobType: { type: String, required: true },
    requiredQualifications: { type: String, required: true },
    undergraduationPercentage: { type: Number, required: true },
    xiiPercentage: { type: Number, required: true },
    xPercentage: { type: String, required: true },
    location: { type: String, required: true },
    postedAt: { type: Date, default: Date.now },

});

// Create Job Model
const Job = mongoose.model('Job', jobSchema);

// Define Application Schema
const applicationSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    studentName: { type: String, required: true },
    jobTitle: { type: String, required: true },
    companyName: { type: String, required: false },
    resumeUrl: { type: String, required: false },
    profilePictureUrl: { type: String, required: false },
    email: { type: String, required: true },
});

// Create Application Model
const Application = mongoose.model('Application', applicationSchema);

// Define Resume Schema
const resumeSchema = new mongoose.Schema({
    userId: String,
    filename: String,
    path: String,
    uploadDate: { type: Date, default: Date.now },
});

const Resume = mongoose.model('Resume', resumeSchema);

// Define User Schema
const userSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    displayName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    photoURL: { type: String, required: false },
    rollNo: { type: String, required: false },
});

// Create User Model
const User = mongoose.model('User', userSchema);

// Define ProfilePicture Schema
const profilePictureSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    filename: { type: String, required: true },
    path: { type: String, required: true },
    uploadDate: { type: Date, default: Date.now },
});

const ProfilePicture = mongoose.model('ProfilePicture', profilePictureSchema);

// Multer Configuration for resume storage
const resumeStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `resume-${uniqueSuffix}${path.extname(file.originalname)}`);
    },
});

const uploadResume = multer({ storage: resumeStorage });

// Multer Configuration for profile picture storage
const profilePictureStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, 'profile-pictures');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const filename = `profile-${uniqueSuffix}${path.extname(file.originalname)}`;
        cb(null, filename);
    },
});

const uploadProfilePicture = multer({
    storage: profilePictureStorage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedFileTypes = /jpeg|jpg|png/;
        const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedFileTypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb('Error: Images only (jpeg, jpg, png)!');
        }
    },
}).single('avatar');

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com', // Replace with your SMTP host
    port: 587, // Typically 587 for TLS or 465 for SSL
    secure: false, // Use true if port is 465 (SSL)

    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS, 
    },
});

// Endpoint to post a new job
app.post('/api/jobs', async (req, res) => {
    const {
        userId,
        studentName,
        jobTitle,
        companyName,
        keywords,
        jobDescription,
        salaryRange,
        jobType,
        requiredQualifications,
        undergraduationPercentage,
        xiiPercentage,
        xPercentage,
        location,
    } = req.body;

    if (!userId || !studentName || !jobTitle || !companyName || !keywords || !jobDescription ||
        !salaryRange || !jobType || !requiredQualifications || !undergraduationPercentage ||
        !xiiPercentage || !xPercentage || !location) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const newJob = new Job({
        userId,
        studentName,
        jobTitle,
        companyName,
        keywords,
        jobDescription,
        salaryRange,
        jobType,
        requiredQualifications,
        undergraduationPercentage,
        xiiPercentage,
        xPercentage,
        location,
        postedAt: new Date(),
    });

    try {
        await newJob.save();
        res.status(201).json({ success: true, message: 'Job posted successfully.', job: newJob });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to post job.' });
    }
});

// Endpoint to get all jobs
app.get('/api/jobs', async (req, res) => {
    try {
        const jobs = await Job.find().sort({ postedAt: -1 });
        res.status(200).json(jobs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to retrieve jobs.' });
    }
});

// Endpoint to delete a job by ID
app.delete('/api/jobs/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const deletedJob = await Job.findByIdAndDelete(id);
        if (!deletedJob) {
            return res.status(404).json({ success: false, message: 'Job not found.' });
        }
        res.status(200).json({ success: true, message: 'Job deleted successfully.' });
    } catch (error) {
        console.error('Error deleting job:', error);
        res.status(500).json({ success: false, message: 'Failed to delete job.' });
    }
});

// Endpoint to post a new application
app.post('/api/apply', async (req, res) => {
    const { userId, studentName, jobTitle, companyName, resumeUrl, email } = req.body;

    try {
        // Save application details to database (if needed)
        const application = new Application({
            userId,
            studentName,
            jobTitle,
            companyName,
            resumeUrl,
            email,
        });
        await application.save();

        // Send email notification
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: `Job Application Confirmation: ${jobTitle}`,
            text: `Dear ${studentName},\n\nYou have successfully applied for the position of ${jobTitle} at ${companyName}.\n\nThank you for using our platform!\n\nBest regards,\nJob Portal Team`,
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'Application submitted and email sent successfully.' });
    } catch (error) {
        console.error('Error applying for job:', error);
        res.status(500).json({ message: 'Failed to apply for job or send email.' });
    }
});

// Endpoint to get all applications
app.get('/api/applications', async (req, res) => {
    try {
        const applications = await Application.find();
        res.status(200).json(applications);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to retrieve applications.' });
    }
});

// Endpoint to delete an application by ID
app.delete('/api/applications/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deletedApplication = await Application.findByIdAndDelete(id);
        if (!deletedApplication) {
            return res.status(404).json({ success: false, message: 'Application not found.' });
        }
        res.status(204).json();
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to delete application.' });
    }
});

// Endpoint to upload a resume
app.post('/api/upload-resume', uploadResume.single('resume'), async (req, res) => {
    try {
        const { userId } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const relativePath = path.join('uploads', req.file.filename); // Construct relative path

        const newResume = new Resume({
            userId,
            filename: req.file.filename,
            path: relativePath, // Store relative path
        });

        await newResume.save();
        res.status(201).json({ message: 'Resume uploaded successfully', path: relativePath });
    } catch (error) {
        console.error('Error uploading resume:', error);
        res.status(500).json({ message: 'Failed to upload resume', error: error.message });
    }
});

// Endpoint to get a resume by userId
app.get('/api/resume/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const resume = await Resume.findOne({ userId: userId }).sort({ uploadDate: -1 });

        if (!resume) {
            return res.status(404).json({ message: 'No resume found for this user' });
        }

        res.status(200).json({ resume: { path: resume.path } }); // Return only the relative path
    } catch (error) {
        console.error('Error fetching resume:', error);
        res.status(500).json({ message: 'Failed to fetch resume', error: error.message });
    }
});

app.delete('/api/delete-resume/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        // Fetch user's existing resume entry from database
        const userResume = await Resume.findOne({ userId });

        if (!userResume) {
            return res.status(404).json({ message: 'No existing resume found.' });
        }

        // Delete the physical file from server
        const filePath = path.join(__dirname, 'uploads', userResume.path);
        fs.unlink(filePath, (err) => {
            if (err) console.error('Error deleting file:', err);
        });

        // Remove database entry
        await Resume.deleteOne({ userId });

        res.status(200).json({ message: 'Old resume deleted successfully.' });
    } catch (error) {
        console.error('Error deleting old resume:', error);
        res.status(500).json({ message: 'Server error while deleting old resume.' });
    }
});

// Endpoint to update user profile
app.post('/api/update-profile', uploadProfilePicture, async (req, res) => {
    try {
        console.log('Request body:', req.body);
        console.log('Uploaded file:', req.file);

        const { userId, displayName, email, rollNo } = req.body;
        let photoURL = null; // Initialize photoURL

        if (!userId || !displayName || !email || !rollNo) {
            return res.status(400).json({ error: 'User ID, Display Name, Email, and Roll No are required' });
        }

        const updateData = {
            displayName: displayName,
            email: email,
            rollNo: rollNo
        };

        if (req.file) {
            const filename = req.file.filename;
            const newProfilePicture = new ProfilePicture({
                userId: userId,
                filename: filename,
                path: req.file.path,
                uploadDate: new Date(),
            });

            await newProfilePicture.save();
            updateData.photoURL = `/profile-pictures/${filename}`; // Set photoURL here
            photoURL = `/profile-pictures/${filename}`; // Also, set it for the response
        }

        // Find and update the user, or create a new one if it doesn't exist
        const user = await User.findOneAndUpdate({ userId: userId }, updateData, {
            upsert: true, // Create a new document if one isn't found
            new: true,     // Return the updated document
            setDefaultsOnInsert: true // Set schema defaults if inserting
        });

        res.status(200).json({ message: 'Profile updated successfully', photoURL: photoURL });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Failed to update profile', details: error.message });
    }
});

app.get('/api/update-profile', async (req, res) => {
    try {
        const profiles = await User.find().sort({ displayName: 1 }); // Sorting by name
        res.status(200).json(profiles);
    } catch (error) {
        console.error('Error fetching profiles:', error);
        res.status(500).json({ message: 'Failed to fetch profiles', error: error.message });
    }
});

app.get('/api/update-profile/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        // Find the user in the database
        const user = await User.findOne({ userId });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({
            userId: user.userId,
            displayName: user.displayName,
            email: user.email,
            rollNo: user.rollNo,
            photoURL: user.photoURL || null
        });

    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: 'Failed to fetch profile', details: error.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
