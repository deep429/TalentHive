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
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../Auth/firebase';
import api from '../../api/api';
import { FiTrash2, FiLogOut, FiBriefcase, FiUsers } from 'react-icons/fi';

const MyJobs = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [myJobPostings, setMyJobPostings] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();

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
        const response = await api.get('/api/jobs'); // Fetch ALL jobs
        // Filter jobs on the frontend based on userId
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

  if (loading) return <Box>Loading...</Box>;

  // JobItem Component (Moved inside MyJobs)
  const JobItem = ({ job }) => {
    const isOwner = job.userId === user?.uid; // Check if the current user is the owner

    return (
      <Box bg="white" p={5} shadow="md" borderRadius="lg">
        <Flex justify="space-between" align="start" mb={2}>
          <Box>
            <Heading size="md">{job.jobTitle}</Heading>
            <Text fontSize="sm" color="gray.600">{job.companyName}</Text>
          </Box>
        </Flex>

        <HStack spacing={3} mt={2}>
          <Badge colorScheme="purple">{job.location}</Badge>
          <Badge colorScheme="blue">{job.jobType}</Badge>
          <Badge colorScheme="green">{job.salaryRange}</Badge>
        </HStack>

        {isOwner && ( // Conditionally render the button
          <Button
            leftIcon={<FiTrash2 />}
            colorScheme="red"
            size="sm"
            mt={2}
            onClick={() => handleWithdrawJob(job._id)}
            aria-label="Withdraw job"
          >
            Withdraw
          </Button>
        )}
      </Box>
    );
  };

  return (
    <Flex minHeight="100vh" bg="gray.100">
      {/* Sidebar */}
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
        </VStack>
        <Button leftIcon={<FiLogOut />} variant="ghost" justifyContent="start" w="100%" onClick={onOpen} aria-label="Logout">
          Logout
        </Button>
      </Box>

      {/* Main Content */}
      <Box w="80%" p={6} ml="20%">
        <Heading mb={6} color="purple.700">My Job Postings</Heading>
        <VStack spacing={4} align="stretch">
          {myJobPostings.length === 0 ? (
            <Text>No job postings available.</Text>
          ) : (
            myJobPostings.map((job) => (
              <JobItem key={job._id} job={job} />
            ))
          )}
        </VStack>
      </Box>
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