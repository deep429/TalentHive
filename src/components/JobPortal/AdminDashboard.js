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
  Badge,
  HStack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom'; 
import { FiLogOut, FiBriefcase, FiUsers, FiSettings, FiMonitor, FiCheckCircle, FiUserX, FiBarChart2 } from 'react-icons/fi';
import { auth } from '../Auth/firebase';

const AdminDashboard = () => {
    const toast = useToast();
    const navigate = useNavigate();
    const { isOpen, onOpen, onClose } = useDisclosure();
    
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [applications, setApplications] = useState([]);
    const [stats, setStats] = useState({
        placed: 0,
        unplaced: 0,
        total: 0
    });

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                fetchApplications(); // Fetch applications when user is authenticated
                fetchStats(); // Fetch statistics
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
            const response = await fetch('http://localhost:5000/api/applications');
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            setApplications(data);
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

    // Fetch statistics from the backend
    const fetchStats = async () => {
        try {
            // Using the comprehensive endpoint
            const response = await fetch('http://localhost:5000/api/placement-stats');
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            
            setStats({
                placed: data.placed,
                unplaced: data.unplaced,
                total: data.total,
                percentage: data.percentage
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
            // Fallback to mock data if API fails
            setStats({
                placed: 42,
                unplaced: 58,
                total: 100,
                percentage: 42
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

    const handlePlacedStudents = () => {
        navigate('/placed-students');
    };

    const handleUnplacedStudents = () => {
        navigate('/unplaced-students');
    };

    const handleStatistics = () => {
        // You could navigate to a dedicated stats page or keep it in the sidebar
        // For this example, we'll show the stats in the sidebar
    };

    const handleDeleteApplication = async (id) => {
        try {
            const response = await fetch(`http://localhost:5000/api/applications/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete application');
            
            setApplications(applications.filter(app => app._id !== id));
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
                    
                    {/* Statistics Button with Badge */}
                    <Button 
                        leftIcon={<FiBarChart2 />} 
                        variant="ghost" 
                        justifyContent="start" 
                        w="100%" 
                        onClick={handleStatistics}
                        position="relative"
                    >
                        <HStack spacing={4} w="100%" justify="space-between">
                            <Text>Statistics</Text>
                            <Badge colorScheme="purple" borderRadius="full" px={2}>
                                {stats.total}
                            </Badge>
                        </HStack>
                    </Button>
                    
                    {/* Statistics Display */}
                    <Box w="100%" p={3} bg="purple.600" borderRadius="md" boxShadow="md">
                        <Stat>
                            <StatLabel>Placement Stats</StatLabel>
                            <StatNumber>{stats.placed} / {stats.total}</StatNumber>
                            <StatHelpText>
                                {Math.round((stats.placed / stats.total) * 100)}% placed
                            </StatHelpText>
                        </Stat>
                        <Flex mt={2}>
                            <Box flex="1" textAlign="center">
                                <Text fontSize="sm">Placed</Text>
                                <Badge colorScheme="green">{stats.placed}</Badge>
                            </Box>
                            <Box flex="1" textAlign="center">
                                <Text fontSize="sm">Unplaced</Text>
                                <Badge colorScheme="red">{stats.unplaced}</Badge>
                            </Box>
                        </Flex>
                    </Box>
                    
                    <Button leftIcon={<FiUsers />} variant="ghost" justifyContent="start" w="100%" onClick={handleUserManagement}>
                        Job Seeker Management
                    </Button>
                    <Button leftIcon={<FiBriefcase />} variant="ghost" justifyContent="start" w="100%" onClick={handleJobManagement}>
                        Job Management
                    </Button>
                    <Button leftIcon={<FiCheckCircle />} variant="ghost" justifyContent="start" w="100%" onClick={handlePlacedStudents}>
                        Placed Students
                    </Button>
                    <Button leftIcon={<FiUserX />} variant="ghost" justifyContent="start" w="100%" onClick={handleUnplacedStudents}>
                        Unplaced Students
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
                                    <Text fontSize='sm' color='gray.500'>{app.companyName}</Text>
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