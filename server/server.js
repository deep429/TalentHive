const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const interviewScraper = require('./scraper');
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
    postedAt: { type: Date, default: Date.now },
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

// Add this helper method to your backend file
function createInterviewPrepEmail(studentName, jobTitle, companyName, resources) {
    return `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #6e48aa; padding: 20px; color: white; text-align: center;">
          <h1 style="margin: 0;">Interview Preparation Resources</h1>
        </div>
        <div style="padding: 20px; background-color: #f9f9f9;">
          <p>Dear ${studentName || 'Candidate'},</p>
          <p>Here are some resources to help you prepare for your interview for <strong>${jobTitle}</strong> at <strong>${companyName}</strong>:</p>
          
          <div style="background-color: white; border-radius: 5px; padding: 15px; margin: 15px 0;">
            <h3 style="color: #6e48aa; margin-top: 0;">Preparation Resources</h3>
            <ul style="padding-left: 20px;">
              ${resources.map(resource => `
                <li style="margin-bottom: 10px;">
                  ${resource.includes('http') ? 
                    `<a href="${resource.split(' ').pop()}" style="color: #6e48aa; text-decoration: none;">${resource}</a>` : 
                    resource}
                </li>
              `).join('')}
            </ul>
          </div>
          
          <p style="margin-bottom: 0;">Best of luck with your interview!</p>
        </div>
        <div style="background-color: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #666;">
          <p>You're receiving this email because you applied for a job through TalentHive.</p>
          <p>© ${new Date().getFullYear()} TalentHive. All rights reserved.</p>
        </div>
      </div>
    `;
  }
  

// Add this new endpoint before server start
app.post('/api/send-interview-prep', async (req, res) => {
  try {
    const { jobTitle, companyName, studentName, email } = req.body;
    
    if (!jobTitle || !companyName || !email) {
      return res.status(400).json({ message: 'Job title, company name, and email are required' });
    }

    const resources = await interviewScraper.getInterviewResources(jobTitle, companyName);

    // Prepare email with resources
    const mailOptions = {
      from: `${'TalentHive Career Support'} <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Interview Preparation Resources for ${jobTitle} at ${companyName}`,
      html: createInterviewPrepEmail(studentName, jobTitle, companyName, resources),
      headers: {
        'X-Priority': '3',
        'X-Mailer': 'TalentHive Interview Prep'
      }
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Interview preparation resources sent successfully' });
  } catch (error) {
    console.error('Error sending interview preparation:', error);
    res.status(500).json({ message: 'Failed to send interview preparation resources' });
  }
});

// Update the existing apply endpoint to include interview prep
app.post('/api/apply', async (req, res) => {
    const { userId, studentName, jobTitle, companyName, resumeUrl, email } = req.body;
  
    try {
      // Get user's profile picture URL if available
      let profilePictureUrl = null;
      const user = await User.findOne({ userId });
      if (user && user.photoURL) {
        profilePictureUrl = user.photoURL;
      }
  
      // Save application details to database
      const application = new Application({
        userId,
        studentName,
        jobTitle,
        companyName,
        resumeUrl,
        profilePictureUrl, // Now properly defined
        email,
      });
      await application.save();
  
      // Send application confirmation email
      const confirmationMail = {
        from: `${'TalentHive'} <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Job Application : ${jobTitle.substring(0, 50)} at ${companyName.substring(0,50)}`,
        text: `Dear ${studentName},\n\nThank you for applying to ${jobTitle} at ${companyName}.\n\nWe've received your application and will review it carefully. You'll hear from us if your qualifications match our needs.\n\nApplication details:\n- Position: ${jobTitle}\n- Company: ${companyName}\n\nFor your records, this application was submitted on ${new Date().toLocaleDateString()}.\n\nIf you have any questions, please reply to this email.\n\nBest regards,\n${'TalentHive'}`,
        headers: {
          'X-Priority': '3',
          'X-Mailer': 'TalentHive'
        }
      };
  
      await transporter.sendMail(confirmationMail);
  
      // Send interview preparation (in background)
      interviewScraper.getInterviewResources(jobTitle, companyName)
        .then(resources => {
          const prepMail = {
            from: `${'TalentHive Career Support'} <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `Interview Preparation Resources for ${jobTitle} at ${companyName}`,
            html: createInterviewPrepEmail(studentName, jobTitle, companyName, resources),
            headers: {
              'X-Priority': '3',
              'X-Mailer': 'TalentHive Interview Prep'
            }
          };
          return transporter.sendMail(prepMail);
        })
        .catch(err => console.error('Error sending interview prep:', err));
  
      res.status(200).json({ message: 'Application submitted and emails sent successfully.' });
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
// Endpoint to update user profile
app.post('/api/update-profile', uploadProfilePicture, async (req, res) => {
    try {
        console.log('Request body:', req.body);
        console.log('Uploaded file:', req.file);

        const { userId, displayName, email, rollNo } = req.body;
        let photoURL = null;

        if (!userId || !displayName || !email || !rollNo) {
            return res.status(400).json({ error: 'User ID, Display Name, Email, and Roll No are required' });
        }

        const updateData = {
            displayName: displayName,
            email: email,
            rollNo: rollNo
        };

        if (req.file) {
            // 1. Check for existing profile picture and delete it
            const existingProfilePic = await ProfilePicture.findOne({ userId });
            
            if (existingProfilePic) {
                // Delete the physical file from server
                const filePath = path.join(__dirname, 'profile-pictures', existingProfilePic.filename);
                fs.unlink(filePath, (err) => {
                    if (err) console.error('Error deleting old profile picture:', err);
                });
                
                // Remove database entry
                await ProfilePicture.deleteOne({ userId });
            }

            // 2. Save the new profile picture
            const filename = req.file.filename;
            const newProfilePicture = new ProfilePicture({
                userId: userId,
                filename: filename,
                path: req.file.path,
                uploadDate: new Date(),
            });

            await newProfilePicture.save();
            updateData.photoURL = `/profile-pictures/${filename}`;
            photoURL = `/profile-pictures/${filename}`;
        }

        // Find and update the user, or create a new one if it doesn't exist
        const user = await User.findOneAndUpdate({ userId: userId }, updateData, {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true
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

// Add this schema before your server starts
const placedStudentSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    studentName: { type: String, required: true },
    email: { type: String, required: true },
    rollNo: { type: String, required: false },
    profilePic: { type: String, required: false },
    placedAt: { type: Date, default: Date.now },
    companyName: { type: String, required: true },
    jobTitle: { type: String, required: true },
    package: { type: String, required: false }
});

const PlacedStudent = mongoose.model('PlacedStudent', placedStudentSchema);

// Endpoint to get unplaced students
app.get('/api/students/unplaced', async (req, res) => {
    try {
        // Get all regular users (non-admin)
        const allUsers = await User.find({
            email: { $not: /admin/ }
        });
        
        // Get all placed students
        const placedStudents = await PlacedStudent.find();
        const placedUserIds = placedStudents.map(student => student.userId);
        
        // Filter out placed students
        const unplacedStudents = allUsers.filter(user => 
            !placedUserIds.includes(user.userId)
        );
        
        // Format response
        const response = unplacedStudents.map(user => ({
            userId: user.userId,
            name: user.displayName,
            email: user.email,
            rollNo: user.rollNo || 'N/A',
            profilePic: user.photoURL || null
        }));
        
        res.status(200).json(response);
    } catch (error) {
        console.error('Error fetching unplaced students:', error);
        res.status(500).json({ 
            message: 'Failed to fetch unplaced students',
            error: error.message 
        });
    }
});

// Endpoint to mark student as placed
app.post('/api/students/mark-placed', async (req, res) => {
    try {
        const { userId, companyName, jobTitle, package } = req.body;
        
        // Validate required fields
        if (!userId || !companyName || !jobTitle) {
            return res.status(400).json({ 
                message: 'userId, companyName and jobTitle are required' 
            });
        }
        
        // Get user details
        const user = await User.findOne({ userId });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Check if already placed
        const existing = await PlacedStudent.findOne({ userId });
        if (existing) {
            return res.status(400).json({ 
                message: 'Student is already marked as placed' 
            });
        }
        
        // Create new placement record
        const newPlacement = new PlacedStudent({
            userId,
            studentName: user.displayName,
            email: user.email,
            rollNo: user.rollNo,
            profilePic: user.photoURL,
            companyName,
            jobTitle,
            package: package || 'Not disclosed',
            placedAt: new Date()
        });
        
        await newPlacement.save();
        
        res.status(201).json({
            message: 'Student marked as placed successfully',
            placement: newPlacement
        });
    } catch (error) {
        console.error('Error marking student as placed:', error);
        res.status(500).json({ 
            message: 'Failed to mark student as placed',
            error: error.message 
        });
    }
});

// Endpoint to get placed students
app.get('/api/students/placed', async (req, res) => {
    try {
        // Get all placed students and sort by most recent placement
        const placedStudents = await PlacedStudent.find().sort({ placedAt: -1 });
        
        // Format the response to match what your frontend expects
        const response = placedStudents.map(student => ({
            _id: student._id,
            userId: student.userId,
            name: student.studentName,
            email: student.email,
            rollNo: student.rollNo,
            profilePic: student.profilePic,
            company: student.companyName,
            position: student.jobTitle,
            package: student.package,
            placedAt: student.placedAt
        }));
        
        res.status(200).json(response);
    } catch (error) {
        console.error('Error fetching placed students:', error);
        res.status(500).json({ 
            message: 'Failed to fetch placed students',
            error: error.message 
        });
    }
});

// Add this to your backend (before app.listen)
app.get('/api/students/placed/export', async (req, res) => {
    try {
      const placedStudents = await PlacedStudent.find();
      
      // Create CSV headers
      let csv = 'Name,Email,Roll No,Company,Position,Package,Placed Date\n';
      
      // Add each student's data
      placedStudents.forEach(student => {
        csv += `"${student.studentName || ''}",` +
               `"${student.email || ''}",` +
               `"${student.rollNo || ''}",` +
               `"${student.companyName || ''}",` +
               `"${student.jobTitle || ''}",` +
               `"${student.package || ''}",` +
               `"${student.placedAt.toISOString() || ''}"\n`;
      });
      
      // Set response headers
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=placed-students.csv');
      
      // Send the CSV
      res.status(200).send(csv);
    } catch (error) {
      console.error('Export error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Endpoint to export unplaced students data as CSV
app.get('/api/students/unplaced/export', async (req, res) => {
    try {
        // Get all regular users (non-admin)
        const allUsers = await User.find({
            email: { $not: /admin/ }
        });
        
        // Get all placed students
        const placedStudents = await PlacedStudent.find();
        const placedUserIds = placedStudents.map(student => student.userId);
        
        // Filter out placed students
        const unplacedStudents = allUsers.filter(user => 
            !placedUserIds.includes(user.userId)
        ).map(user => ({
            name: user.displayName || '',
            email: user.email || '',
            rollNo: user.rollNo || 'N/A',
            userId: user.userId || ''
        }));

        // Create CSV headers
        let csv = 'Name,Email,Roll No,User ID\n';
        
        // Add each student's data
        unplacedStudents.forEach(student => {
            csv += `"${student.name}","${student.email}","${student.rollNo}","${student.userId}"\n`;
        });
        
        // Set response headers
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=unplaced-students.csv');
        
        // Send the CSV
        res.status(200).send(csv);
    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({ 
            message: 'Failed to export unplaced students',
            error: error.message 
        });
    }
});

// Add these endpoints before app.listen()

// Endpoint to get count of placed students
app.get('/api/students/placed/count', async (req, res) => {
    try {
        const count = await PlacedStudent.countDocuments();
        res.status(200).json({ count });
    } catch (error) {
        console.error('Error counting placed students:', error);
        res.status(500).json({ 
            message: 'Failed to count placed students',
            error: error.message 
        });
    }
});

// Endpoint to get count of unplaced students
app.get('/api/students/unplaced/count', async (req, res) => {
    try {
        // Get total non-admin users
        const totalUsers = await User.countDocuments({ email: { $not: /admin/ } });
        // Get count of placed students
        const placedCount = await PlacedStudent.countDocuments();
        // Unplaced count is total users minus placed users
        const unplacedCount = totalUsers - placedCount;
        
        res.status(200).json({ count: unplacedCount });
    } catch (error) {
        console.error('Error counting unplaced students:', error);
        res.status(500).json({ 
            message: 'Failed to count unplaced students',
            error: error.message 
        });
    }
});

// Endpoint to get placement statistics
app.get('/api/placement-stats', async (req, res) => {
    try {
        // Get total non-admin users
        const totalUsers = await User.countDocuments({ email: { $not: /admin/ } });
        // Get count of placed students
        const placedCount = await PlacedStudent.countDocuments();
        // Calculate unplaced count
        const unplacedCount = totalUsers - placedCount;
        // Calculate placement percentage
        const placementPercentage = totalUsers > 0 
            ? Math.round((placedCount / totalUsers) * 100) 
            : 0;

        res.status(200).json({
            placed: placedCount,
            unplaced: unplacedCount,
            total: totalUsers,
            percentage: placementPercentage
        });
    } catch (error) {
        console.error('Error fetching placement stats:', error);
        res.status(500).json({ 
            message: 'Failed to fetch placement statistics',
            error: error.message 
        });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
