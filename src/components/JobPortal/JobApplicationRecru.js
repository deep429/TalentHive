import React, { useState, useEffect } from 'react';
import {
    Box,
    Heading,
    Text,
    Flex,
    VStack,
    List,
    ListItem,
    Link,
    Spacer,
    useToast,
    Divider,
    Avatar,
    Button
} from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import { auth } from '../Auth/firebase'; // Firebase authentication
import api from '../../api/api'; // Axios API instance
import { FiLogOut, FiBriefcase, FiUsers, FiFileText } from 'react-icons/fi';

const Applications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const toast = useToast();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            if (currentUser) {
                setUser(currentUser);
            }
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const response = await api.get('/api/applications');
                // Prepend server URL to profilePictureUrl if it exists
                const updatedApplications = response.data.map((app) => ({
                    ...app,
                    profilePictureUrl: app.profilePictureUrl
                        ? `http://localhost:5000${app.profilePictureUrl}`
                        : null
                }));
                setApplications(updatedApplications);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching applications:", error);
                toast({
                    title: "Failed to load applications.",
                    description: error.message || "An unexpected error occurred.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
                setLoading(false);
            }
        };

        fetchApplications();
    }, [toast]);

    const handleGoBack = () => {
        navigate('/recruiterdash');
    };
    const openEditProfile = () => {
        navigate('/edit-profile');
    };
    const goToMyJobs = () => {
        navigate('/my-jobs');
    };
    const handleLogout = () => {
        auth.signOut();
        navigate('/recruiter'); // Or wherever you want to redirect after logout
    };
    const goToApplications = () => {
        navigate('/applications'); // Navigate to the applications route
    };

    const handleViewPhoto = (photoURL) => {
        if (photoURL) {
            window.open(photoURL, '_blank'); // Open in a new tab
        } else {
            toast({
                title: "No Photo Available",
                description: "This applicant has not provided a photograph.",
                status: "info",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    if (loading) {
        return <Box p={5} textAlign="center">Loading Applications...</Box>;
    }

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
                    <Button leftIcon={<FiBriefcase />} variant="ghost" justifyContent="start" w="100%" onClick={handleGoBack}>
                        Dashboard
                    </Button>
                    {/* New Button here to go MyJobs Page */}
                    <Button leftIcon={<FiUsers />} variant="ghost" justifyContent="start" w="100%" onClick={goToMyJobs}>
                        My Jobs
                    </Button>
                    <Button leftIcon={<FiFileText />} variant="ghost" justifyContent="start" w="100%" onClick={goToApplications}>
                        View Applications
                    </Button>
                </VStack>
                <Button leftIcon={<FiLogOut />} variant="ghost" justifyContent="start" w="100%" onClick={handleLogout}>
                    Logout
                </Button>
            </Box>

            {/* Main Content */}
            <Box w="80%" p={6} ml="20%">
                <Heading mb={6} color="purple.700">Job Applications</Heading>

                {applications.length === 0 ? (
                    <Text>No applications found.</Text>
                ) : (
                    <List spacing={3}>
                        {applications.map((app) => (
                            <ListItem key={app._id} p={4} bg="white" borderRadius="md" shadow="sm">
                                <Flex align="center" justify="space-between">
                                    <Box>
                                        <Text fontWeight="bold">{app.studentName}</Text>
                                        <Text fontSize="sm" color="gray.600">Applying for: {app.jobTitle} at {app.companyName}</Text>
                                    </Box>
                                    <Flex>
                                    {app.resumeUrl && (
    <Link 
        href={app.resumeUrl} 
        isExternal 
        mr={4}
    >
    View Resume<ExternalLinkIcon mx="2px" />
    </Link>
)}


                                        {app.profilePictureUrl && (
                                            <Button size="sm" colorScheme="purple" onClick={() => handleViewPhoto(app.profilePictureUrl)}>
                                                View Photo
                                            </Button>
                                        )}
                                        {!app.profilePictureUrl && (
                                            <Button size="sm" colorScheme="gray" onClick={() => handleViewPhoto(null)}>
                                                View Photo
                                            </Button>
                                        )}
                                    </Flex>
                                </Flex>
                            </ListItem>
                        ))}
                    </List>
                )}
            </Box>
        </Flex>
    );
};

export default Applications;
