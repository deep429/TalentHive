import React, { useState, useEffect } from 'react';
import {
  Box, Heading, Text, Flex, VStack, Avatar, Button, Spacer, Divider,
  useToast, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalCloseButton, ModalBody, ModalFooter, Badge, Table, Thead, Tbody,
  Tr, Th, Td, Skeleton, Input, InputGroup, InputLeftElement, useColorModeValue, FormControl, FormLabel
} from '@chakra-ui/react';
import { 
  FiLogOut, FiBriefcase, FiUsers, FiSettings, FiCheckCircle, 
  FiUserX, FiMail, FiUser, FiCheck, FiSearch, FiDownload, FiRefreshCw
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { auth } from '../Auth/firebase';

const UnplacedStudents = () => {
    const toast = useToast();
    const navigate = useNavigate();
    const { isOpen, onOpen, onClose } = useDisclosure();
    
    // State for placement modal
    const [placementModalOpen, setPlacementModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [placementData, setPlacementData] = useState({
        companyName: '',
        jobTitle: '',
        package: ''
    });
    
    // Main data state
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [unplacedStudents, setUnplacedStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isExporting, setIsExporting] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const bgColor = useColorModeValue('white', 'gray.800');
    const sidebarBg = useColorModeValue('purple.700', 'purple.800');

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                fetchUnplacedStudents();
            } else {
                navigate('/admin');
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    useEffect(() => {
        let results = unplacedStudents;
        
        // Apply search filter
        if (searchTerm) {
            results = results.filter(student => 
                student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.rollNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        setFilteredStudents(results);
    }, [searchTerm, unplacedStudents]);

    const fetchUnplacedStudents = async () => {
        setIsRefreshing(true);
        try {
            const response = await fetch('http://localhost:5000/api/students/unplaced');
            if (!response.ok) throw new Error('Failed to fetch unplaced students');
            const data = await response.json();
            setUnplacedStudents(data);
            setFilteredStudents(data);
        } catch (error) {
            console.error('Fetch error:', error);
            toast({
                title: 'Error fetching unplaced students',
                description: error.message,
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setIsRefreshing(false);
            setLoading(false);
        }
    };

    const handleMarkAsPlaced = (student) => {
        setSelectedStudent(student);
        setPlacementData({
            companyName: '',
            jobTitle: '',
            package: ''
        });
        setPlacementModalOpen(true);
    };

    const handlePlacementSubmit = async () => {
        if (!placementData.companyName || !placementData.jobTitle) {
            toast({
                title: 'Missing required fields',
                description: 'Company name and job title are required',
                status: 'warning',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/students/mark-placed', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: selectedStudent.userId,
                    ...placementData
                }),
            });

            if (!response.ok) throw new Error('Failed to mark as placed');

            toast({
                title: 'Student marked as placed',
                description: `${selectedStudent.name} has been successfully marked as placed at ${placementData.companyName}`,
                status: 'success',
                duration: 3000,
                isClosable: true,
            });

            fetchUnplacedStudents();
            setPlacementModalOpen(false);
        } catch (error) {
            console.error('Error marking student as placed:', error);
            toast({
                title: 'Error marking student as placed',
                description: error.message,
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const response = await fetch('http://localhost:5000/api/students/unplaced/export');
            
            if (!response.ok) throw new Error('Export failed');
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'unplaced-students.csv';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            toast({
                title: 'Export successful',
                description: 'Unplaced students data has been exported',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            console.error('Export error:', error);
            toast({
                title: 'Export failed',
                description: error.message,
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setIsExporting(false);
        }
    };

    const handleRefresh = () => {
        fetchUnplacedStudents();
        toast({
            title: 'Refreshing data',
            status: 'info',
            duration: 1000,
            isClosable: true,
        });
    };

    const handleLogout = () => {
        auth.signOut();
        toast({
            title: 'Logged out successfully',
            status: 'success',
            duration: 3000,
            isClosable: true,
        });
        navigate('/admin');
    };

    // Navigation handlers
    const handleUserManagement = () => navigate('/admindash');
    const handleJobManagement = () => navigate('/job-management');
    const handlePlacedStudents = () => navigate('/placed-students');

    if (loading) {
        return (
            <Flex minHeight="100vh" bg="gray.100">
                <Box w="20%" bg={sidebarBg} p={5} />
                <Box w="80%" p={6}>
                    <Skeleton height="40px" mb={6} />
                    <Skeleton height="300px" />
                </Box>
            </Flex>
        );
    }

    return (
        <Flex minHeight="100vh" bg="gray.100">
            {/* Sidebar */}
            <Box w="20%" bg={sidebarBg} color="white" p={5}>
                <VStack spacing={6} align="start">
                    <Flex align="center">
                        <Avatar size="lg" src={user?.photoURL} />
                        <Box ml={4}>
                            <Text fontWeight="bold">{user?.displayName}</Text>
                            <Text fontSize="sm">{user?.email}</Text>
                        </Box>
                    </Flex>
                    <Divider borderColor="purple.400" />
                    <Button leftIcon={<FiUsers />} variant="ghost" justifyContent="start" w="100%" onClick={handleUserManagement}>
                        User Management
                    </Button>
                    <Button leftIcon={<FiBriefcase />} variant="ghost" justifyContent="start" w="100%" onClick={handleJobManagement}>
                        Job Management
                    </Button>
                    <Button leftIcon={<FiCheckCircle />} variant="ghost" justifyContent="start" w="100%" onClick={handlePlacedStudents}>
                        Placed Students
                    </Button>
                    <Button leftIcon={<FiUserX />} variant="solid" colorScheme="purple" justifyContent="start" w="100%">
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
                <Flex justify="space-between" align="center" mb={6}>
                    <Heading color="purple.600" display="flex" alignItems="center">
                        <FiUserX style={{ marginRight: '10px' }} />
                        Unplaced Students
                        <Badge ml={3} colorScheme="red" fontSize="lg">
                            {filteredStudents.length}
                        </Badge>
                    </Heading>
                    <Flex>
                        <Button 
                            leftIcon={<FiRefreshCw />}
                            colorScheme="blue" 
                            onClick={handleRefresh}
                            isLoading={isRefreshing}
                            mr={3}
                        >
                            Refresh
                        </Button>
                        <Button 
                            leftIcon={<FiDownload />} 
                            colorScheme="green" 
                            onClick={handleExport}
                            isLoading={isExporting}
                        >
                            Export
                        </Button>
                    </Flex>
                </Flex>

                {/* Search */}
                <Box mb={6}>
                    <InputGroup maxW="400px">
                        <InputLeftElement pointerEvents="none">
                            <FiSearch color="gray.300" />
                        </InputLeftElement>
                        <Input 
                            placeholder="Search students..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </InputGroup>
                </Box>

                {/* Students Table */}
                <Box bg={bgColor} borderRadius="md" shadow="md" p={6}>
                    {isRefreshing ? (
                        <Skeleton height="300px" />
                    ) : filteredStudents.length > 0 ? (
                        <Table variant="simple">
                            <Thead>
                                <Tr>
                                    <Th>Profile</Th>
                                    <Th>Name</Th>
                                    <Th>Roll No</Th>
                                    <Th>Email</Th>
                                    <Th>Action</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {filteredStudents.map((student) => (
                                    <Tr key={student.userId}>
                                        <Td>
                                            <Avatar 
                                                size="md" 
                                                src={student.profilePic} 
                                                name={student.name}
                                            />
                                        </Td>
                                        <Td>{student.name}</Td>
                                        <Td>{student.rollNo}</Td>
                                        <Td>{student.email}</Td>
                                        <Td>
                                            <Button
                                                colorScheme="green"
                                                leftIcon={<FiCheck />}
                                                onClick={() => handleMarkAsPlaced(student)}
                                            >
                                                Mark as Placed
                                            </Button>
                                        </Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    ) : (
                        <Text textAlign="center" p={4}>
                            {unplacedStudents.length === 0 ? 'All students have been placed!' : 'No students match your search.'}
                        </Text>
                    )}
                </Box>
            </Box>

            {/* Placement Modal */}
            <Modal isOpen={placementModalOpen} onClose={() => setPlacementModalOpen(false)}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Mark Student as Placed</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        {selectedStudent && (
                            <>
                                <Flex align="center" mb={4}>
                                    <Avatar 
                                        size="lg" 
                                        src={selectedStudent.profilePic} 
                                        name={selectedStudent.name}
                                        mr={4}
                                    />
                                    <Box>
                                        <Text fontWeight="bold">{selectedStudent.name}</Text>
                                        <Text>Roll No: {selectedStudent.rollNo}</Text>
                                        <Text>{selectedStudent.email}</Text>
                                    </Box>
                                </Flex>
                                
                                <FormControl isRequired mt={4}>
                                    <FormLabel>Company Name</FormLabel>
                                    <Input
                                        placeholder="Enter company name"
                                        value={placementData.companyName}
                                        onChange={(e) => setPlacementData({
                                            ...placementData, 
                                            companyName: e.target.value
                                        })}
                                    />
                                </FormControl>

                                <FormControl isRequired mt={4}>
                                    <FormLabel>Job Title</FormLabel>
                                    <Input
                                        placeholder="Enter job title"
                                        value={placementData.jobTitle}
                                        onChange={(e) => setPlacementData({
                                            ...placementData, 
                                            jobTitle: e.target.value
                                        })}
                                    />
                                </FormControl>

                                <FormControl mt={4}>
                                    <FormLabel>Package (CTC)</FormLabel>
                                    <Input
                                        placeholder="Enter compensation package"
                                        value={placementData.package}
                                        onChange={(e) => setPlacementData({
                                            ...placementData, 
                                            package: e.target.value
                                        })}
                                    />
                                </FormControl>
                            </>
                        )}
                    </ModalBody>

                    <ModalFooter>
                        <Button 
                            colorScheme="green" 
                            mr={3} 
                            onClick={handlePlacementSubmit}
                            isDisabled={!placementData.companyName || !placementData.jobTitle}
                        >
                            Confirm Placement
                        </Button>
                        <Button onClick={() => setPlacementModalOpen(false)}>Cancel</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Logout Modal */}
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Confirm Logout</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        Are you sure you want to log out?
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

export default UnplacedStudents;