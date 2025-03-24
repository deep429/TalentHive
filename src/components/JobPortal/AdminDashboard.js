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
import { FiLogOut, FiBriefcase, FiUsers, FiSettings, FiMonitor } from 'react-icons/fi';
import { auth } from '../Auth/firebase';

const AdminDashboard = () => {
    const toast = useToast();
    const navigate = useNavigate();
    const { isOpen, onOpen, onClose } = useDisclosure();
    
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [applications, setApplications] = useState([]);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                fetchApplications(); // Fetch applications when user is authenticated
            } else {
                navigate('/admin');
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [navigate]);

    // Fetch applications from the backend
    const fetchApplications = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/applications'); // Ensure this matches your server URL
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            setApplications(data); // Set applications state with fetched data
        } catch (error) {
            console.error('Fetch error:', error);
            toast({
                title: 'Error fetching applications',
                description: error.message,
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        toast({
            title: 'Logged out successfully.',
            status: 'success',
            duration: 3000,
            isClosable: true,
        });
        navigate('/admin');
    };

    const handleUserManagement = () => {
        navigate('/admindash');
    };

    const handleJobManagement = () => {
        navigate('/job-management');
    };

    // Function to delete an application
    const handleDeleteApplication = async (id) => {
        try {
            const response = await fetch(`http://localhost:5000/api/applications/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete application');
            
            // Remove deleted application from state
            setApplications(applications.filter(app => app._id !== id)); // Use _id for MongoDB documents
            toast({
                title: 'Application deleted successfully.',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            console.error('Delete error:', error);
            toast({
                title: 'Error deleting application',
                description: error.message,
                status: 'error',
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
                    {/* <Button leftIcon={<FiMonitor />} variant="ghost" justifyContent="start" w="100%">
                        Admin Dashboard
                    </Button> */}
                    <Button leftIcon={<FiUsers />} variant="ghost" justifyContent="start" w="100%" onClick={handleUserManagement}>
                    Job Seeker Management
                    </Button>
                    <Button leftIcon={<FiBriefcase />} variant="ghost" justifyContent="start" w="100%" onClick={handleJobManagement}>
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
                    Job Seeker Management
                </Heading>

                {/* Applications Section */}
                <Box mb={6}>
                    <Heading size="md" mb={4}>Job Applications</Heading>
                    {applications.length > 0 ? (
                        applications.map((app) => (
                            <Flex key={app._id} p={3} bg='white' borderRadius='md' shadow='md' mb={4} alignItems='center'>
                                <Box flex='1'>
                                    <Text fontWeight='bold'>{app.studentName}</Text>
                                    <Text>{app.jobTitle}</Text>
                                    <Text fontSize='sm' color='gray.500'>{app.companyName}</Text> {/* Display company name */}
                                </Box>
                                <Button colorScheme='red' size='sm' onClick={() => handleDeleteApplication(app._id)}>
                                    Delete
                                </Button>
                            </Flex>
                        ))
                    ) : (
                        <Text>No applications found.</Text>
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
                        <Button colorScheme='red' mr={3} onClick={handleLogout}>Logout</Button>
                        <Button variant='ghost' onClick={onClose}>Cancel</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

        </Flex>
    );
};

export default AdminDashboard;