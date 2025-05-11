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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  IconButton,
  Stack,
  Collapse,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select // Import Select for dropdowns
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../Auth/firebase';
import api from '../../api/api';
import { FiTrash2, FiLogOut, FiBriefcase, FiUsers, FiEdit, FiFileText } from 'react-icons/fi';

const MyJobs = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [myJobPostings, setMyJobPostings] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [expandedJobId, setExpandedJobId] = useState(null);
  const [editJobId, setEditJobId] = useState(null);
  const [editedJobData, setEditedJobData] = useState({});

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setLoading(false);
      } else {
        setLoading(false);
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const fetchMyJobs = async () => {
      try {
        const response = await api.get('/api/jobs');
        const filteredJobs = response.data.filter(job => job.userId === user?.uid);
        setMyJobPostings(filteredJobs);
      } catch (error) {
        toast({
          title: 'Failed to load your jobs.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    };

    if (user) {
      fetchMyJobs();
    }
  }, [user, toast]);

  const handleWithdrawJob = async (jobId) => {
    try {
      await api.delete(`/api/jobs/${jobId}`);
      setMyJobPostings(prevJobs => prevJobs.filter(job => job._id !== jobId));
      toast({
        title: 'Job withdrawn successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error withdrawing job.',
        description: error.response?.data?.message || "An unexpected error occurred.",
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleEditJob = (job) => {
    setEditJobId(job._id);
    setEditedJobData({ ...job }); // Make a copy to avoid direct state modification
  };

  const handleCancelEdit = () => {
    setEditJobId(null);
    setEditedJobData({});
  };

  const handleSaveEdit = async (jobId) => {
    try {
      await api.put(`/api/jobs/${jobId}`, editedJobData);
      setMyJobPostings(prevJobs =>
        prevJobs.map(job => (job._id === jobId ? { ...job, ...editedJobData } : job))
      );
      toast({
        title: 'Job updated successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setEditJobId(null);
    } catch (error) {
      toast({
        title: 'Error updating job.',
        description: error.response?.data?.message || "An unexpected error occurred.",
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedJobData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleLogout = () => {
    auth.signOut();
    toast({
      title: 'Logged out successfully.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    navigate('/recruiter');
  };

  const openEditProfile = () => {
    navigate('/edit-profile');
  };

  const goToRecruiterDashboard = () => {
    navigate('/recruiterdash');
  };

  const goToApplications = () => {
    navigate('/applications');
  };

  const toggleJobDetails = (jobId) => {
    setExpandedJobId(expandedJobId === jobId ? null : jobId);
  };

  if (loading) return <Box>Loading...</Box>;

  const JobItem = ({ job }) => {
    const isEditing = editJobId === job._id;

    return (
      <Box bg="white" p={5} shadow="md" borderRadius="lg">
        {isEditing ? (
          // Edit Form
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Job Title</FormLabel>
              <Input
                name="jobTitle"
                value={editedJobData.jobTitle || ''}
                onChange={handleInputChange}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Company Name</FormLabel>
              <Input
                name="companyName"
                value={editedJobData.companyName || ''}
                onChange={handleInputChange}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Location</FormLabel>
              <Input
                name="location"
                value={editedJobData.location || ''}
                onChange={handleInputChange}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Job Type</FormLabel>
              <Select
                name="jobType"
                value={editedJobData.jobType || ''}
                onChange={handleInputChange}
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Temporary">Temporary</option>
                <option value="Internship">Internship</option>
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>Salary Range</FormLabel>
              <Input
                name="salaryRange"
                value={editedJobData.salaryRange || ''}
                onChange={handleInputChange}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Job Description</FormLabel>
              <Textarea
                name="jobDescription"
                value={editedJobData.jobDescription || ''}
                onChange={handleInputChange}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Requirements</FormLabel>
              <Textarea
                name="requirements"
                value={editedJobData.requirements || ''}
                onChange={handleInputChange}
              />
            </FormControl>
            <HStack justify="flex-end">
              <Button colorScheme="gray" onClick={handleCancelEdit}>
                Cancel
              </Button>
              <Button colorScheme="blue" onClick={() => handleSaveEdit(job._id)}>
                Save
              </Button>
            </HStack>
          </VStack>
        ) : (
          // Job Display
          <>
            <Flex justify="space-between" align="start" mb={2}>
              <Box flex="1" cursor="pointer" onClick={() => toggleJobDetails(job._id)}>
                <Heading size="md">{job.jobTitle}</Heading>
                <Text fontSize="sm" color="gray.600">{job.companyName}</Text>
              </Box>
              <HStack>
                <IconButton
                  icon={<FiEdit />}
                  colorScheme="blue"
                  size="sm"
                  aria-label="Edit job"
                  onClick={() => handleEditJob(job)}
                />
                <IconButton
                  icon={<FiTrash2 />}
                  colorScheme="red"
                  size="sm"
                  aria-label="Withdraw job"
                  onClick={() => handleWithdrawJob(job._id)}
                />
              </HStack>
            </Flex>

            <HStack spacing={3} mt={2}>
              <Badge colorScheme="purple">{job.location}</Badge>
              <Badge colorScheme="blue">{job.jobType}</Badge>
              <Badge colorScheme="green">{job.salaryRange}</Badge>
            </HStack>

            <Collapse in={expandedJobId === job._id} animateOpacity>
              <Box mt={4} p={4} bg="gray.50" borderRadius="md">
                <Text fontWeight="bold">Job Description:</Text>
                <Text mt={2}>{job.jobDescription}</Text>
                <Text fontWeight="bold" mt={4}>Requirements:</Text>
                <Text mt={2}>{job.requirements}</Text>
              </Box>
            </Collapse>
          </>
        )}
      </Box>
    );
  };

  return (
    <Flex minHeight="100vh" bg="gray.100">
      {/* Enhanced Sidebar */}
      <Box
        w="20%"
        h="100vh"
        position="fixed"
        top="0"
        left="0"
        bgGradient="linear(to-b, purple.500, purple.700)"
        color="white"
        p={5}
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
      >
        <VStack spacing={6} align="start">
          <Flex align="center" onClick={openEditProfile} cursor="pointer">
            <Avatar size="lg" src={user?.photoURL} />
            <Box ml={4}>
              <Text fontWeight="bold">{user?.displayName}</Text>
              <Text fontSize="sm">{user?.email}</Text>
            </Box>
          </Flex>
          <Divider borderColor="purple.400" />
          <Button leftIcon={<FiBriefcase />} variant="ghost" justifyContent="start" w="100%" onClick={goToRecruiterDashboard}>
            Dashboard
          </Button>
          <Button leftIcon={<FiUsers />} variant="ghost" justifyContent="start" w="100%" onClick={goToApplications}>
            View Applications
          </Button>
          <Button leftIcon={<FiFileText />} variant="ghost" justifyContent="start" w="100%" onClick={() => {}}>
            My Postings
          </Button>
        </VStack>
        <VStack spacing={4} align="start">
          <Button leftIcon={<FiLogOut />} variant="ghost" justifyContent="start" w="100%" onClick={onOpen}>
            Logout
          </Button>
        </VStack>
      </Box>

      {/* Main Content */}
      <Box w="80%" p={6} ml="20%">
        <Flex justify="space-between" align="center" mb={6}>
          <Heading color="purple.700">My Job Postings</Heading>
          <Badge colorScheme="purple" fontSize="lg" px={3} py={1}>
            {myJobPostings.length} {myJobPostings.length === 1 ? 'Job' : 'Jobs'}
          </Badge>
        </Flex>

        <Stack spacing={4}>
          {myJobPostings.length === 0 ? (
            <Box textAlign="center" p={10} bg="white" borderRadius="lg" shadow="sm">
              <Text fontSize="xl" mb={4}>You haven't posted any jobs yet</Text>
            </Box>
          ) : (
            myJobPostings.map((job) => (
              <JobItem key={job._id} job={job} />
            ))
          )}
        </Stack>
      </Box>

      {/* Logout Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Logout</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            Are you sure you want to logout?
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="red" mr={3} onClick={handleLogout}>
              Logout
            </Button>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default MyJobs;
