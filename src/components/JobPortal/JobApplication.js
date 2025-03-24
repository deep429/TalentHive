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
  Spinner,
  Center,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FiLogOut, FiBriefcase, FiUser, FiSettings, FiClipboard } from 'react-icons/fi';
import { auth} from '../Auth/firebase'; // Import signOut

const JobApplicationDashboard = () => {
    const toast = useToast();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [applications, setApplications] = useState([]);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                console.log("Current User ID:", currentUser.uid); // ADDED LOGGING
                fetchApplications(currentUser.uid);
            } else {
                navigate('/login');
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [navigate]);

    const fetchApplications = async (userId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/applications?userId=${userId}`);
            if (!response.ok) {
                let errorMessage = 'Failed to fetch applications';
                try {
                    const errorData = await response.json(); // Try to get a more specific error from the API
                    if (errorData && errorData.message) {
                        errorMessage = errorData.message;
                    }
                } catch (parseError) {
                    console.error('Error parsing error response:', parseError);
                }
                throw new Error(errorMessage);
            }
            const data = await response.json();
            console.log("Fetched Applications:", data); // ADDED LOGGING
            setApplications(data.filter(app => app.userId === userId));

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

    const handleDashboardNavigation = () => {
        navigate('/dashboard');
    };

    const handleApplicationsNavigation = () => {
        navigate('/dashboard');
    };

    const handleWithdrawApplication = async (appId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/applications/${appId}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to withdraw application');
            toast({
                title: 'Application withdrawn successfully.',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            setApplications(applications.filter(app => app._id !== appId));
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to withdraw application.',
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
            navigate('/login');

    };


    if (loading) return (
        <Center h="100vh">
            <VStack>
                <Spinner size="xl" color="purple.500" />
                <Text>Loading Applications...</Text>
            </VStack>
        </Center>
    );

    return (
        <Flex minHeight="100vh" bg="gray.100">
            {/* Sidebar */}
            <Box w="20%" bgGradient="linear(to-b, purple.500, purple.700)" color="white" p={5} display="flex" flexDirection="column" justifyContent="space-between">
                <VStack spacing={6} align="start">
                    <Flex align="center">
                        <Avatar size="lg" src={user?.photoURL} />
                        <Box ml={4}>
                            <Text fontWeight="bold">{user?.displayName}</Text>
                            <Text fontSize="sm">{user?.email}</Text>
                        </Box>
                    </Flex>
                    <Divider borderColor="purple.400" />
                    <Button leftIcon={<FiBriefcase />} variant="ghost" justifyContent="start" w="100%" onClick={handleDashboardNavigation}>
                            Dashboard
                        </Button>
                        <Button leftIcon={<FiClipboard />} variant="ghost" justifyContent="start" w="100%" onClick={handleApplicationsNavigation}>
                            Applications
                        </Button>
                        <Button leftIcon={<FiSettings />} variant="ghost" justifyContent="start" w="100%">
                            Settings
                        </Button>
                    <Spacer />
                    <Button leftIcon={<FiLogOut />} variant="ghost" justifyContent="start" w="100%" onClick={handleLogout}>
                        Logout
                    </Button>
                </VStack>
            </Box>

            {/* Main Content */}
            <Box w="80%" p={6}>
                <Heading mb={6} color="purple.600">
                    My Job Applications
                </Heading>
                <Box>
                    <Heading size="md" mb={4}>Applications</Heading>
                    {applications.length > 0 ? (
                        applications.map((app) => (
                            <Flex key={app._id} p={3} bg='white' borderRadius='md' shadow='md' mb={4} alignItems='center'>
                                <Box flex='1'>
                                    <Text fontWeight='bold'>{app.jobTitle}</Text>
                                    <Text>{app.companyName}</Text>
                                    <Text fontSize='sm' color='gray.500'>{app.location}</Text>
                                </Box>
                                <Button colorScheme='red' size='sm' onClick={() => handleWithdrawApplication(app._id)}>
                                    Withdraw
                                </Button>
                            </Flex>
                        ))
                    ) : (
                        <Box>
                            <Text>No applications found.</Text>
                            <Button colorScheme="blue" onClick={handleApplicationsNavigation}> {/* Or navigate to a "create application" page */}
                                Find a Job
                            </Button>
                        </Box>
                    )}
                </Box>
            </Box>
        </Flex>
    );
};

export default JobApplicationDashboard
