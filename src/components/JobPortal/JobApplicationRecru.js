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
    Button,
    Collapse,
    IconButton,
    Badge,
    useDisclosure,
    Stack
} from '@chakra-ui/react';
import { ExternalLinkIcon, ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import { auth } from '../Auth/firebase';
import api from '../../api/api';
import { FiLogOut, FiBriefcase, FiUsers, FiFileText } from 'react-icons/fi';

const Applications = () => {
    const [applications, setApplications] = useState([]);
    const [groupedApplications, setGroupedApplications] = useState({});
    const [loading, setLoading] = useState(true);
    const toast = useToast();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [expandedGroups, setExpandedGroups] = useState({});

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
                const updatedApplications = response.data.map((app) => ({
                    ...app,
                    profilePictureUrl: app.profilePictureUrl
                        ? app.profilePictureUrl.startsWith('http')
                            ? app.profilePictureUrl
                            : `http://localhost:5000${app.profilePictureUrl.startsWith('/') ? '' : '/'}${app.profilePictureUrl}`
                        : null
                }));
                setApplications(updatedApplications);
                
                // Group applications by job and initialize expanded state
                const grouped = updatedApplications.reduce((acc, app) => {
                    const key = `${app.jobTitle} - ${app.companyName}`;
                    if (!acc[key]) {
                        acc[key] = [];
                    }
                    acc[key].push(app);
                    return acc;
                }, {});
                
                setGroupedApplications(grouped);
                
                // Initialize all groups as expanded by default
                const initialExpandedState = Object.keys(grouped).reduce((acc, key) => {
                    acc[key] = true;
                    return acc;
                }, {});
                setExpandedGroups(initialExpandedState);
                
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

    const toggleGroup = (groupKey) => {
        setExpandedGroups(prev => ({
            ...prev,
            [groupKey]: !prev[groupKey]
        }));
    };

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
        navigate('/recruiter');
    };
    const goToApplications = () => {
        navigate('/applications');
    };

    const handleViewPhoto = (photoURL) => {
        if (photoURL) {
            try {
                new URL(photoURL);
                window.open(photoURL, '_blank', 'noopener,noreferrer');
            } catch (e) {
                toast({
                    title: "Invalid Photo URL",
                    description: "The photo URL is not valid.",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            }
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
                <Flex justify="space-between" align="center" mb={6}>
                    <Heading color="purple.700">Job Applications</Heading>
                    <Badge colorScheme="purple" fontSize="lg" px={3} py={1}>
                        Total: {applications.length} applications
                    </Badge>
                </Flex>

                {Object.keys(groupedApplications).length === 0 ? (
                    <Text>No applications found.</Text>
                ) : (
                    <Stack spacing={4}>
                        {Object.entries(groupedApplications).map(([jobTitle, apps]) => (
                            <Box key={jobTitle} bg="white" borderRadius="md" shadow="sm" overflow="hidden">
                                <Flex 
                                    p={4} 
                                    bg="purple.50" 
                                    align="center" 
                                    justify="space-between" 
                                    cursor="pointer" 
                                    onClick={() => toggleGroup(jobTitle)}
                                >
                                    <Box>
                                        <Text fontWeight="bold" fontSize="lg">{jobTitle}</Text>
                                        <Text fontSize="sm" color="gray.600">
                                            {apps.length} applicant{apps.length !== 1 ? 's' : ''}
                                        </Text>
                                    </Box>
                                    <IconButton
                                        icon={expandedGroups[jobTitle] ? <ChevronUpIcon /> : <ChevronDownIcon />}
                                        variant="ghost"
                                        aria-label={expandedGroups[jobTitle] ? "Collapse" : "Expand"}
                                    />
                                </Flex>
                                <Collapse in={expandedGroups[jobTitle]}>
                                    <List spacing={2} p={2}>
                                        {apps.map((app) => (
                                            <ListItem key={app._id} p={3} borderBottom="1px solid" borderColor="gray.100">
                                                <Flex align="center" justify="space-between">
                                                    <Flex align="center">
                                                        <Avatar 
                                                            size="sm" 
                                                            src={app.profilePictureUrl} 
                                                            name={app.studentName}
                                                            mr={3}
                                                        />
                                                        <Box>
                                                            <Text fontWeight="bold">{app.studentName}</Text>
                                                            <Text fontSize="sm" color="gray.600">
                                                                Applied on: {new Date(app.createdAt).toLocaleDateString()}
                                                            </Text>
                                                        </Box>
                                                    </Flex>
                                                    <Flex>
                                                        {app.resumeUrl && (
                                                            <Link 
                                                                href={app.resumeUrl} 
                                                                isExternal 
                                                                mr={4}
                                                                color="purple.600"
                                                                fontWeight="medium"
                                                            >
                                                                View Resume <ExternalLinkIcon mx="1px" />
                                                            </Link>
                                                        )}
                                                        <Button 
                                                            size="sm" 
                                                            colorScheme={app.profilePictureUrl ? "purple" : "gray"}
                                                            onClick={() => handleViewPhoto(app.profilePictureUrl)}
                                                        >
                                                            View Photo
                                                        </Button>
                                                    </Flex>
                                                </Flex>
                                            </ListItem>
                                        ))}
                                    </List>
                                </Collapse>
                            </Box>
                        ))}
                    </Stack>
                )}
            </Box>
        </Flex>
    );
};

export default Applications;