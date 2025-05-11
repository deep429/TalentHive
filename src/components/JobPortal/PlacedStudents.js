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
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  IconButton,
  Tooltip,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  HStack,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { 
  FiLogOut, 
  FiBriefcase, 
  FiUsers, 
  FiSettings, 
  FiCheckCircle, 
  FiUserX, 
  FiSearch,
  FiDownload,
  FiTrash2,
  FiEdit,
  FiRefreshCw
} from 'react-icons/fi';
import { auth } from '../Auth/firebase';
import { format } from 'date-fns';

const PlacedStudents = () => {
    const toast = useToast();
    const navigate = useNavigate();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editedStudent, setEditedStudent] = useState(null);
    
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [placedStudents, setPlacedStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [companyFilter, setCompanyFilter] = useState('all');
    const [isExporting, setIsExporting] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                fetchPlacedStudents();
            } else {
                navigate('/admin');
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [navigate]);

    const fetchPlacedStudents = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/students/placed');
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            setPlacedStudents(data);
            setFilteredStudents(data);
        } catch (error) {
            console.error('Fetch error:', error);
            toast({
                title: 'Error fetching placed students',
                description: error.message,
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        let results = placedStudents;
        
        // Apply search filter
        if (searchTerm) {
            results = results.filter(student => 
                student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.rollNo?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        // Apply company filter
        if (companyFilter !== 'all') {
            results = results.filter(student => 
                student.company.toLowerCase() === companyFilter.toLowerCase()
            );
        }
        
        setFilteredStudents(results);
    }, [searchTerm, companyFilter, placedStudents]);

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

    const handleUserManagement = () => navigate('/admindash');
    const handleJobManagement = () => navigate('/job-management');
    const handlePlacedStudents = () => navigate('/placed-students');
    const handleUnplacedStudents = () => navigate('/unplaced-students');

    const handleRefresh = () => {
        setIsRefreshing(true);
        fetchPlacedStudents();
    };

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const response = await fetch('http://localhost:5000/api/students/placed/export');
            if (!response.ok) throw new Error('Export failed');
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'placed-students.csv';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            
            toast({
                title: 'Export successful',
                description: 'Placed students data has been exported',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
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

    const handleDeleteConfirmation = (student) => {
        setSelectedStudent(student);
        setDeleteModalOpen(true);
    };

    const handleEditPlacement = (student) => {
        setEditedStudent(student);
        setEditModalOpen(true);
    };

    const handleEditSubmit = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/students/placed/${editedStudent._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editedStudent),
            });
            
            if (!response.ok) throw new Error('Failed to update placement');
            
            toast({
                title: 'Placement updated',
                description: `${editedStudent.name}'s placement has been updated`,
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            
            fetchPlacedStudents(); // Refresh the list
        } catch (error) {
            toast({
                title: 'Error updating placement',
                description: error.message,
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setEditModalOpen(false);
            setEditedStudent(null);
        }
    };

    const handleDeletePlacement = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/students/placed/${selectedStudent._id}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) throw new Error('Failed to delete placement');
            
            toast({
                title: 'Placement removed',
                description: `${selectedStudent.name}'s placement has been removed`,
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            
            fetchPlacedStudents(); // Refresh the list
        } catch (error) {
            toast({
                title: 'Error removing placement',
                description: error.message,
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setDeleteModalOpen(false);
            setSelectedStudent(null);
        }
    };

    const getUniqueCompanies = () => {
        const companies = placedStudents.map(student => student.company);
        return ['all', ...new Set(companies)];
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
                <Flex justifyContent="space-between" alignItems="center" mb={6}>
                    <Heading color="purple.600" display="flex" alignItems="center">
                        <FiCheckCircle style={{ marginRight: '10px' }} />
                        Placed Students
                        <Badge ml={3} fontSize="lg" colorScheme="green">
                            {filteredStudents.length}
                        </Badge>
                    </Heading>
                    <HStack spacing={4}>
                        <Button 
                            leftIcon={<FiRefreshCw />} 
                            colorScheme="blue" 
                            onClick={handleRefresh}
                            isLoading={isRefreshing}
                        >
                            Refresh
                        </Button>
                        <Button 
                            leftIcon={<FiDownload />} 
                            colorScheme="green" 
                            onClick={handleExport}
                            isLoading={isExporting}
                        >
                            Export to CSV
                        </Button>
                    </HStack>
                </Flex>

                {/* Filters */}
                <Flex mb={6} gap={4}>
                    <InputGroup maxW="400px">
                        <InputLeftElement pointerEvents="none">
                            <FiSearch color="gray.300" />
                        </InputLeftElement>
                        <Input 
                            placeholder="Search by name, position or roll no..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </InputGroup>
                    
                    <Select 
                        placeholder="Filter by company" 
                        w="200px"
                        value={companyFilter}
                        onChange={(e) => setCompanyFilter(e.target.value)}
                    >
                        {getUniqueCompanies().map(company => (
                            <option key={company} value={company}>
                                {company === 'all' ? 'All Companies' : company}
                            </option>
                        ))}
                    </Select>
                </Flex>

                {/* Placed Students Table */}
                <Box bg="white" borderRadius="md" shadow="md" p={4} overflowX="auto">
                    {filteredStudents.length > 0 ? (
                        <Table variant="simple">
                            <Thead>
                                <Tr>
                                    <Th>Student</Th>
                                    <Th>Position</Th>
                                    <Th>Company</Th>
                                    <Th>Package</Th>
                                    <Th>Placed On</Th>
                                    <Th>Actions</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {filteredStudents.map((student) => (
                                    <Tr key={student._id}>
                                        <Td>
                                            <Flex align="center">
                                                <Avatar size="sm" src={student.profilePic} name={student.name} mr={3} />
                                                <Box>
                                                    <Text fontWeight="bold">{student.name}</Text>
                                                    <Text fontSize="sm" color="gray.500">{student.rollNo || 'N/A'}</Text>
                                                </Box>
                                            </Flex>
                                        </Td>
                                        <Td>{student.position}</Td>
                                        <Td>{student.company}</Td>
                                        <Td>{student.package || 'Not disclosed'}</Td>
                                        <Td>{format(new Date(student.placedAt), 'dd MMM yyyy')}</Td>
                                        <Td>
                                            <HStack spacing={2}>
                                                <Tooltip label="Edit placement">
                                                    <IconButton
                                                        icon={<FiEdit />}
                                                        aria-label="Edit placement"
                                                        size="sm"
                                                        colorScheme="blue"
                                                        variant="ghost"
                                                        onClick={() => handleEditPlacement(student)}
                                                    />
                                                </Tooltip>
                                                <Tooltip label="Remove placement">
                                                    <IconButton
                                                        icon={<FiTrash2 />}
                                                        aria-label="Remove placement"
                                                        size="sm"
                                                        colorScheme="red"
                                                        variant="ghost"
                                                        onClick={() => handleDeleteConfirmation(student)}
                                                    />
                                                </Tooltip>
                                            </HStack>
                                        </Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    ) : (
                        <Box textAlign="center" py={10}>
                            <Text fontSize="lg" color="gray.500">
                                {placedStudents.length === 0 ? 'No placed students found.' : 'No students match your filters.'}
                            </Text>
                        </Box>
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

            {/* Delete Placement Confirmation Modal */}
            <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Remove Placement</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        Are you sure you want to remove {selectedStudent?.name}'s placement at {selectedStudent?.company}?
                        This action cannot be undone.
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme='red' mr={3} onClick={handleDeletePlacement}>
                            Remove Placement
                        </Button>
                        <Button variant='ghost' onClick={() => setDeleteModalOpen(false)}>
                            Cancel
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Edit Placement Modal */}
            <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Edit Placement</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {editedStudent && (
                            <VStack spacing={4}>
                                <Input
                                    placeholder="Position"
                                    value={editedStudent.position}
                                    onChange={(e) => setEditedStudent({...editedStudent, position: e.target.value})}
                                />
                                <Input
                                    placeholder="Company"
                                    value={editedStudent.company}
                                    onChange={(e) => setEditedStudent({...editedStudent, company: e.target.value})}
                                />
                                <Input
                                    placeholder="Package"
                                    value={editedStudent.package}
                                    onChange={(e) => setEditedStudent({...editedStudent, package: e.target.value})}
                                />
                            </VStack>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme='blue' mr={3} onClick={handleEditSubmit}>
                            Save Changes
                        </Button>
                        <Button variant='ghost' onClick={() => setEditModalOpen(false)}>
                            Cancel
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Flex>
    );
};

export default PlacedStudents;