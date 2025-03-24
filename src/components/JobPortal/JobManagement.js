import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Flex,
  VStack,
  Avatar,
  Button,
  Spacer,
  Divider,
  useToast,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FiLogOut, FiBriefcase, FiUsers, FiSettings } from 'react-icons/fi';
import { auth } from '../Auth/firebase';

const JobManagement = () => {
    const toast = useToast();
    const navigate = useNavigate();
    const { isOpen, onOpen, onClose } = useDisclosure();
    
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [jobs, setJobs] = useState([]); // Changed from `applications` to `jobs`

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                fetchJobs(); // Fetch jobs when user is authenticated
            } else {
                navigate('/admin');
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [navigate]);

    // Fetch jobs from the backend
    const fetchJobs = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/jobs'); // Ensure API URL is correct
            if (!response.ok) throw new Error('Failed to fetch jobs');

            const data = await response.json();
            setJobs(data); // Set state with fetched jobs
        } catch (error) {
            console.error('Fetch error:', error);
            toast({
                title: 'Error fetching jobs',
                description: error.message,
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    // Function to delete a job
    const handleDeleteJob = async (jobId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/jobs/${jobId}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error("Failed to delete job");

            toast({
                title: "Job deleted successfully.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });

            setJobs(jobs.filter(job => job._id !== jobId)); // Update state after deletion
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete job.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    if (loading) return <Box>Loading...</Box>;

    return (
        <Flex minHeight="100vh" bg="gray.100">
            {/* Sidebar */}
            <Box w="20%"
                bgGradient="linear(to-b, purple.500, purple.700)"
                color="white"
                p={5}
                display="flex"
                flexDirection="column"
                justifyContent="space-between">
                <VStack spacing={6} align="start">
                    <Flex align="center">
                        <Avatar size="lg" src={user?.photoURL} />
                        <Box ml={4}>
                            <Text fontWeight="bold">{user?.displayName}</Text>
                            <Text fontSize="sm">{user?.email}</Text>
                        </Box>
                    </Flex>
                    <Divider borderColor="purple.400" />
                    <Button leftIcon={<FiUsers />} variant="ghost" justifyContent="start" w="100%" onClick={() => navigate('/admindash')}>
                        Job Seeker Management
                    </Button>
                    <Button leftIcon={<FiBriefcase />} variant="ghost" justifyContent="start" w="100%" onClick={() => navigate('/job-management')}>
                        Job Management
                    </Button>
                    <Button leftIcon={<FiSettings />} variant="ghost" justifyContent="start" w="100%">
                        Settings
                    </Button>
                    <Spacer />
                    <Button leftIcon={<FiLogOut />} variant="ghost" justifyContent="start" w="100%" onClick={onOpen}>
                        Logout
                    </Button>
                </VStack>
            </Box>

            {/* Main Content */}
            <Box w="80%" p={6}>
                <Heading mb={6} color="purple.600">
                    Job Management
                </Heading>

                {/* Job Postings Section */}
                <Box mb={6}>
                    <Heading size="md" mb={4}>Job Postings</Heading>
                    {jobs.length > 0 ? (
                        jobs.map((job) => (
                            <Flex key={job._id} p={3} bg='white' borderRadius='md' shadow='md' mb={4} alignItems='center'>
                                <Box flex='1'>
                                    <Text fontWeight='bold'>{job.jobTitle}</Text>
                                    <Text>{job.companyName}</Text>
                                    <Text fontSize='sm' color='gray.500'>{job.location}</Text>
                                </Box>
                                <Button colorScheme='red' size='sm' onClick={() => handleDeleteJob(job._id)}>
                                    Delete
                                </Button>
                            </Flex>
                        ))
                    ) : (
                        <Text>No jobs found.</Text>
                    )}
                </Box>
            </Box>

            {/* Logout Confirmation Modal */}
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Logout</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        Are you sure you want to log out?
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme='red' mr={3} onClick={() => {
                            localStorage.removeItem('authToken');
                            toast({
                                title: 'Logged out successfully.',
                                status: 'success',
                                duration: 3000,
                                isClosable: true,
                            });
                            navigate('/admin');
                        }}>Logout</Button>
                        <Button variant='ghost' onClick={onClose}>Cancel</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

        </Flex>
    );
};

export default JobManagement;
