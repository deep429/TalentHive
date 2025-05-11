import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Flex,
  VStack,
  HStack,
  Avatar,
  Badge,
  Spacer,
  Divider,
  Button,
  useToast,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Skeleton,
  IconButton,
  Collapse,
  Input,
  FormLabel,
  FormControl,
  
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FiLogOut, FiBriefcase, FiClipboard, FiSettings, FiExternalLink, FiChevronDown, FiChevronUp, FiUpload } from 'react-icons/fi';
import { auth } from '../Auth/firebase';

const Dashboard = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [user, setUser] = useState(null);
  const [backendUser, setBackendUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentJobs, setRecentJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [resumeUrl, setResumeUrl] = useState(null);
  const { isOpen: isFetchOpen, onOpen: onFetchOpen, onClose: onFetchClose } = useDisclosure();
  const [resumeFile, setResumeFile] = useState(null);
  const [appliedJobs, setAppliedJobs] = useState(new Set());
  const [isApplying, setIsApplying] = useState(false);
  const [profilePictureUrl, setProfilePictureUrl] = useState(null);

  // Auto-refresh interval in milliseconds (e.g., 5 minutes)
  const REFRESH_INTERVAL = 1000;

  useEffect(() => {
    const fetchUserProfile = async (userId) => {
      try {
        const response = await fetch(`http://localhost:5000/api/update-profile/${userId}`);
        if (response.ok) {
          const userData = await response.json();
          setBackendUser(userData);
          
          // Update profile picture URL
          if (userData.photoURL) {
            const fullUrl = userData.photoURL.startsWith('http') 
              ? userData.photoURL 
              : `http://localhost:5000${userData.photoURL}`;
            setProfilePictureUrl(fullUrl);
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await fetchUserProfile(currentUser.uid);
        fetchResume(currentUser.uid);
        fetchAppliedJobs(currentUser.uid);
        setLoading(false);
      } else {
        setLoading(false);
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/jobs', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) throw new Error('Failed to fetch jobs');
        const jobs = await response.json();
        setRecentJobs(jobs);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load recent jobs.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    };

    // Initial fetch
    fetchJobs();

    // Set up auto-refresh
    const refreshInterval = setInterval(fetchJobs, REFRESH_INTERVAL);

    // Clean up interval on component unmount
    return () => clearInterval(refreshInterval);
  }, [toast]);

  const fetchAppliedJobs = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/applications/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        const appliedJobIds = new Set(data.map(app => app.jobId));
        setAppliedJobs(appliedJobIds);
      }
    } catch (error) {
      console.error('Error fetching applied jobs:', error);
    }
  };

  const handleApplyJob = async () => {
    if (!selectedJob || isApplying) return;
    
    setIsApplying(true);
    try {
      if (appliedJobs.has(selectedJob._id)) {
        toast({
          title: 'Already Applied',
          description: `You've already applied for ${selectedJob.jobTitle}`,
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
        setSelectedJob(null);
        return;
      }

      const response = await fetch('http://localhost:5000/api/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          jobId: selectedJob._id,
          studentName: backendUser?.displayName || user.displayName,
          jobTitle: selectedJob.jobTitle,
          companyName: selectedJob.companyName,
          resumeUrl: resumeUrl,
          profilePictureUrl: profilePictureUrl || user.photoURL,
          email: user.email, 
        }),
      });

      if (!response.ok) throw new Error('Failed to apply for job');

      setAppliedJobs(prev => new Set(prev).add(selectedJob._id));

      toast({
        title: `Applied for ${selectedJob.jobTitle}`,
        description: 'Your application has been submitted successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setSelectedJob(null);
    } catch (error) {
      toast({
        title: 'Application Failed',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsApplying(false);
    }
  };

  const handleLogout = () => {
    auth.signOut();
    toast({
      title: 'Logged out successfully.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    navigate('/login');
  };

  const OpenEdit = () => {
    navigate('/edit-profile');
  };

  const fetchResume = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/resume/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        if (data.resume) {
          setResumeUrl(`http://localhost:5000/${data.resume.path}`);
        } else {
          setResumeUrl(null);
        }
      } else {
        console.error('Failed to fetch resume:', response.statusText);
        setResumeUrl(null);
      }
    } catch (error) {
      console.error('Error fetching resume:', error);
      setResumeUrl(null);
    }
  };

  const handleResumeUploadClick = () => {
    setUploadModalOpen(true);
  };

  const handleResumeFileChange = (e) => {
    setResumeFile(e.target.files[0]);
  };

  const handleResumeUpload = async () => {
    setIsUploading(true);
    try {
      if (resumeUrl) {
        const deleteResponse = await fetch(`http://localhost:5000/api/delete-resume/${user.uid}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!deleteResponse.ok) {
          throw new Error('Failed to delete old resume.');
        }
      }

      const formData = new FormData();
      formData.append('resume', resumeFile);
      formData.append('userId', user.uid);

      const uploadResponse = await fetch('http://localhost:5000/api/upload-resume', {
        method: 'POST',
        body: formData,
      });

      if (uploadResponse.ok) {
        toast({
          title: 'Resume Uploaded!',
          description: 'Your resume has been uploaded successfully.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        setUploadModalOpen(false);
        setResumeFile(null);
        fetchResume(user.uid);
      } else {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.message || 'Error uploading your resume.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload Failed',
        description: error.message || 'Network error or server issue.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) {
    return (
      <Box p={6}>
        <Skeleton height="40px" mb={4} />
        <Skeleton height="20px" mb={2} />
        <Skeleton height="20px" mb={2} />
        <Skeleton height="20px" mb={2} />
      </Box>
    );
  }

  return (
    <Flex minHeight="100vh" bg="gray.100">
      {/* Sidebar */}
      <Box w="20%" h="100vh" position="fixed" top="0" left="0" bgGradient="linear(to-b, purple.500, purple.700)" color="white" p={5} display="flex" flexDirection="column" justifyContent="space-between">
        <VStack spacing={6} align="start">
          <Flex align="center" onClick={OpenEdit} cursor="pointer">
            <Avatar 
              size="lg" 
              src={profilePictureUrl || user?.photoURL || '/default-profile.png'}
              name={backendUser?.displayName || user?.displayName}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/default-profile.png';
              }}
            />
            <Box ml={4}>
              <Text fontWeight="bold">{backendUser?.displayName || user?.displayName}</Text>
              <Text fontSize="sm">{user?.email}</Text>
            </Box>
          </Flex>
          <Divider borderColor="purple.400" />
          <Button leftIcon={<FiBriefcase />} variant="ghost" justifyContent="start" w="100%">
            Dashboard
          </Button>
          <Button leftIcon={<FiClipboard />} variant="ghost" justifyContent="start" w="100%" onClick={() => navigate('/job-application')}>
            Applications
          </Button>
          <Button leftIcon={<FiUpload />} variant="ghost" justifyContent="start" w="100%" onClick={handleResumeUploadClick}>
            Upload Your Resume
          </Button>
          {resumeUrl && (
            <Button leftIcon={<FiExternalLink />} variant="ghost" justifyContent="start" w="100%" as="a" href={resumeUrl} target="_blank" rel="noopener noreferrer">
              View Resume
            </Button>
          )}
          <Spacer />
          <Button leftIcon={<FiLogOut />} variant="ghost" justifyContent="start" w="100%" onClick={onOpen}>
            Logout
          </Button>
        </VStack>
      </Box>

      {/* Main Content */}
      <Box w="80%" p={6} ml="20%">
        <Heading mb={6} color="purple.700">
          Job Portal Dashboard
        </Heading>

        {/* Recent Jobs */}
        <Box mb={6}>
          <Heading size="md" mb={4}>
            Recent Job Listings
          </Heading>
          <VStack spacing={4} align="stretch">
            {recentJobs.length === 0 ? (
              <Text>No jobs available.</Text>
            ) : (
              recentJobs.map((job) => (
                <JobListItem 
                  key={job._id} 
                  job={job} 
                  onApply={() => setSelectedJob(job)}
                  isApplied={appliedJobs.has(job._id)}
                />
              ))
            )}
          </VStack>
        </Box>
      </Box>

      {/* Apply Confirmation Modal */}
      <Modal isOpen={!!selectedJob} onClose={() => setSelectedJob(null)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Apply for {selectedJob?.jobTitle}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {appliedJobs.has(selectedJob?._id) ? (
              <Text>You've already applied for this position at {selectedJob?.companyName}.</Text>
            ) : !resumeUrl ? (
              <Text>
                You need to upload a resume before applying. 
                <Button variant="link" colorScheme="purple" ml={2} onClick={() => {
                  setSelectedJob(null);
                  handleResumeUploadClick();
                }}>
                  Upload Resume Now
                </Button>
              </Text>
            ) : (
              <Text>Are you sure you want to apply for this job at {selectedJob?.companyName}?</Text>
            )}
          </ModalBody>
          <ModalFooter>
            {!appliedJobs.has(selectedJob?._id) && resumeUrl && (
              <Button 
                colorScheme="purple" 
                mr={3} 
                onClick={handleApplyJob}
                isLoading={isApplying}
                loadingText="Applying..."
              >
                Apply
              </Button>
            )}
            <Button variant="ghost" onClick={() => setSelectedJob(null)}>
              {appliedJobs.has(selectedJob?._id) ? 'Close' : 'Cancel'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Logout Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Logout</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Are you sure you want to log out?</Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="red" mr={3} onClick={handleLogout}>
              Logout
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Upload Resume Modal */}
      <Modal isOpen={uploadModalOpen} onClose={() => setUploadModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Upload Your Resume</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel htmlFor="resume">Choose File (PDF or DOC)</FormLabel>
              <Input 
                type="file" 
                id="resume" 
                accept=".pdf,.doc,.docx" 
                onChange={handleResumeFileChange} 
                p={1}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button 
              colorScheme="purple" 
              mr={3} 
              onClick={handleResumeUpload} 
              isLoading={isUploading} 
              disabled={!resumeFile}
            >
              Upload
            </Button>
            <Button variant="ghost" onClick={() => setUploadModalOpen(false)}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

const JobListItem = ({ job, onApply, isApplied }) => {
  const [showFullDescription, setShowFullDescription] = useState(false);
  const descriptionLengthThreshold = 200;
  const hasLongDescription = job.jobDescription && job.jobDescription.length > descriptionLengthThreshold;

  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };

  return (
    <Box bg="white" p={5} shadow="md" borderRadius="lg">
      <Flex justify="space-between" align="center" mb={2}>
        <Box>
          <Heading size="md">{job.jobTitle}</Heading>
          <Text fontSize="sm" color="gray.600">{job.companyName}</Text>
        </Box>
        {isApplied ? (
          <Badge colorScheme="green" p={2} borderRadius="md">
            Applied
          </Badge>
        ) : (
          <IconButton 
            aria-label="Apply for job" 
            icon={<FiExternalLink />} 
            size="sm" 
            colorScheme="purple" 
            onClick={onApply} 
          />
        )}
      </Flex>
      <HStack spacing={3} mt={2}>
        <Badge colorScheme="blue">{job.jobType}</Badge>
        <Badge colorScheme="green">{job.salaryRange}</Badge>
        {job.location && <Badge colorScheme="orange">{job.location}</Badge>}
      </HStack>
      {job.jobDescription && (
        <Box mt={4}>
          <Text fontSize="sm" color="gray.700" noOfLines={showFullDescription ? undefined : 3}>
            {job.jobDescription}
          </Text>
          {hasLongDescription && (
            <Button size="sm" variant="link" colorScheme="purple" onClick={toggleDescription}>
              {showFullDescription ? 'See Less' : 'See More'}
            </Button>
            
          )}
           <Text fontSize="sm" mt={2}>
                                  <strong>Required Qualifications:</strong> {job.requiredQualifications}
                              </Text>
                              <HStack spacing={3} mt={2}>
                                  <Text fontSize="sm">
                                      <strong>Undergrad:</strong> {job.undergraduationPercentage} CGPA
                                  </Text>
                                  <Text fontSize="sm">
                                      <strong>XII:</strong> {job.xiiPercentage}%
                                  </Text>
                                  <Text fontSize="sm">
                                      <strong>X:</strong> {job.xPercentage}%
                                  </Text>
                                  <Text fontSize="sm">
                                      <strong>Location:</strong> {job.location}
                                  </Text>
                              </HStack>
                              <Text fontSize="sm">
                                  <strong>Posted At:</strong> {new Date(job.postedAt).toLocaleString()}
                              </Text>
        </Box>
        
      )}
      
    </Box>

  );
};

export default Dashboard;