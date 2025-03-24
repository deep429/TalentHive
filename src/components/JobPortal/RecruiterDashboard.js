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
    Input,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    Textarea,
    Select,
    useToast,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FiLogOut, FiBriefcase, FiUsers, FiFileText } from 'react-icons/fi'; // Added FiFileText
import { auth } from '../Auth/firebase'; // Firebase authentication
import api from '../../api/api'; // Axios API instance

const RecruiterDashboard = () => {
    const toast = useToast();
    const navigate = useNavigate();
    const { isOpen: isLogoutOpen, onOpen: openLogoutModal, onClose: closeLogoutModal } = useDisclosure();
    const { isOpen: isJobModalOpen, onOpen: openJobModal, onClose: closeJobModal } = useDisclosure();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [recentJobPostings, setRecentJobPostings] = useState([]);
    const [jobTitle, setJobTitle] = useState('');
    const [company, setCompany] = useState('');
    const [keywords, setKeywords] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [salaryRange, setSalaryRange] = useState('');
    const [jobType, setJobType] = useState('Full-Time');
    const [requiredQualifications, setRequiredQualifications] = useState('');
    const [undergraduationPercentage, setUndergraduationPercentage] = useState('');
    const [xiiPercentage, setXiiPercentage] = useState('');
    const [xPercentage, setXPercentage] = useState('');
    const [location, setLocation] = useState('');

    // Fetch user authentication state
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                setLoading(false);
            } else {
                setLoading(false);
                navigate('/recruiter');
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    // Fetch recent job postings
    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const response = await api.get('/api/jobs');
                setRecentJobPostings(response.data);
            } catch (error) {
                toast({
                    title: 'Failed to load jobs.',
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                });
            }
        };
        fetchJobs();
    }, [toast]);

    // Handle job posting
    const handleAddJob = async () => {
        // Validate required fields
        if (!jobTitle || !company || !keywords || !jobDescription || !salaryRange 
            || !jobType || !requiredQualifications || !undergraduationPercentage 
            || !xiiPercentage || !xPercentage || !location) {
            toast({
                title: 'All fields are required.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        // Validate percentage values
        if (
            undergraduationPercentage < 0 || undergraduationPercentage > 100 ||
            xiiPercentage < 0 || xiiPercentage > 100 ||
            xPercentage < 0 || xPercentage > 100
        ) {
            toast({
                title: 'Percentage must be between 0 and 100.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        const newJob = {
            userId: user?.uid,
            studentName: user?.displayName,
            jobTitle,
            companyName: company,
            keywords: keywords.split(',').map(keyword => keyword.trim()),
            jobDescription,
            salaryRange,
            jobType,
            requiredQualifications,
            undergraduationPercentage: Number(undergraduationPercentage),
            xiiPercentage: Number(xiiPercentage),
            xPercentage: Number(xPercentage),
            location,
        };

        try {
            const response = await api.post('/api/jobs', newJob);
            setRecentJobPostings((prevJobs) => [response.data, ...prevJobs]);
            toast({
                title: 'Job posted successfully.',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            // Reset form fields
            setJobTitle('');
            setCompany('');
            setKeywords('');
            setJobDescription('');
            setSalaryRange('');
            setJobType('Full-Time');
            setRequiredQualifications('');
            setUndergraduationPercentage('');
            setXiiPercentage('');
            setXPercentage('');
            setLocation('');
            closeJobModal();
        } catch (error) {
            toast({
                title: 'Error posting job.',
                description: error.response?.data?.message || "An unexpected error occurred.",
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const openEditProfile = () => {
        navigate('/edit-profile');
    };

    const goToMyJobs = () => {
        navigate('/my-jobs');
    };

    // New function to navigate to the applications page
    const goToApplications = () => {
        navigate('/applications');
    };


    if (loading) return <Box>Loading...</Box>;

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
                    <Button leftIcon={<FiBriefcase />} variant="ghost" justifyContent="start" w="100%" onClick={openJobModal}>
                        Post a Job
                    </Button>
                    {/* New Button here to go MyJobs Page */}
                    <Button leftIcon={<FiUsers />} variant="ghost" justifyContent="start" w="100%" onClick={goToMyJobs}>
                        My Jobs
                    </Button>

                    <Button
                        leftIcon={<FiFileText />} variant="ghost" justifyContent="start"
                        w="100%"
                        onClick={goToApplications}
                    >
                        View Applications
                    </Button>
                </VStack>
                <Button leftIcon={<FiLogOut />} variant="ghost" justifyContent="start" w="100%" onClick={openLogoutModal}>
                    Logout
                </Button>
            </Box>

            {/* Main Content */}
            <Box w="80%" p={6} ml="20%">
                <Heading mb={6} color="purple.700">
                    Recruiter Dashboard
                </Heading>

                {/* Recent Jobs Section */}
                <Box mb={6}>
                    <Heading size="md" mb={4}>
                        Recent Job Postings
                    </Heading>
                    <VStack spacing={4} align="stretch">
                        {recentJobPostings.length === 0 ? (
                            <Text>No jobs available.</Text>
                        ) : (
                            recentJobPostings.map((job) => (
                                <JobItem key={job._id} job={job} />
                            ))
                        )}
                    </VStack>
                </Box>... {/* Logout Confirmation Modal */}
                <Modal isOpen={isLogoutOpen} onClose={closeLogoutModal}>
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Logout</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <Text>Are you sure you want to log out?</Text>
                        </ModalBody>
                        <ModalFooter>
                            <Button colorScheme="red" mr={3} onClick={() => auth.signOut()}>
                                Logout
                            </Button>
                            <Button variant="ghost" onClick={closeLogoutModal}>
                                Cancel
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
                {/* Job Posting Modal */}
                <Modal isOpen={isJobModalOpen} onClose={closeJobModal}>
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Post a New Job</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <VStack spacing={4}>
                                <Input placeholder="Job Title" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
                                <Input placeholder="Company Name" value={company} onChange={(e) => setCompany(e.target.value)} />
                                <Textarea placeholder="Keywords (e.g., React, Node, Agile) - separate with commas" value={keywords} onChange={(e) => setKeywords(e.target.value)} />
                                <Textarea placeholder="Job Description" value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} />
                                <Input placeholder="Salary Range" value={salaryRange} onChange={(e) => setSalaryRange(e.target.value)} />
                                <Select value={jobType} onChange={(e) => setJobType(e.target.value)}>
                                    <option value="Full-Time">Full-Time</option>
                                    <option value="Part-Time">Part-Time</option>
                                    <option value="Remote">Remote</option>
                                    <option value="Contract">Contract</option>
                                </Select>
                                <Textarea placeholder="Required Qualifications" value={requiredQualifications} onChange={(e) => setRequiredQualifications(e.target.value)} />
                                <Input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
                                <HStack>
                                    <NumberInput min={0} max={100} step={0.1} precision={2} value={undergraduationPercentage} onChange={(valueString) => setUndergraduationPercentage(valueString)}>
                                        <NumberInputField placeholder="Undergrad %" />
                                        <NumberInputStepper>
                                            <NumberIncrementStepper />
                                            <NumberDecrementStepper />
                                        </NumberInputStepper>
                                    </NumberInput>
                                    <NumberInput min={0} max={100} step={0.1} precision={2} value={xiiPercentage} onChange={(valueString) => setXiiPercentage(valueString)}>
                                        <NumberInputField placeholder="XII %" />
                                        <NumberInputStepper>
                                            <NumberIncrementStepper />
                                            <NumberDecrementStepper />
                                        </NumberInputStepper>
                                    </NumberInput>
                                    <NumberInput min={0} max={100} step={0.1} precision={2} value={xPercentage} onChange={(valueString) => setXPercentage(valueString)}>
                                        <NumberInputField placeholder="X %" />
                                        <NumberInputStepper>
                                            <NumberIncrementStepper />
                                            <NumberDecrementStepper />
                                        </NumberInputStepper>
                                    </NumberInput>
                                </HStack>
                            </VStack>
                        </ModalBody>
                        <ModalFooter>
                            <Button colorScheme="blue" mr={3} onClick={handleAddJob}>
                                Post Job
                            </Button>
                            <Button variant="ghost" onClick={closeJobModal}>
                                Cancel
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </Box>
        </Flex>
    );
};

// JobItem Component
const JobItem = ({ job }) => {
    const [showFullDescription, setShowFullDescription] = useState(false);
    const descriptionLengthThreshold = 150;
    const hasLongDescription = job.jobDescription && job.jobDescription.length > descriptionLengthThreshold;

    const toggleDescription = () => {
        setShowFullDescription(!showFullDescription);
    };

    return (
        <Box bg="white" p={5} shadow="md" borderRadius="lg">
            <Flex justify="space-between" align="start" mb={2}>
                <Box>
                    <Heading size="md">{job.jobTitle}</Heading>
                    <Text fontSize="sm" color="gray.600">{job.companyName}</Text>
                </Box>
            </Flex>

            <HStack spacing={3} mt={2}>
                {job.keywords && job.keywords.map((keyword, index) => (
                    <Badge key={index} colorScheme="purple">{keyword}</Badge>
                ))}
                <Badge colorScheme="blue">{job.jobType}</Badge>
                <Badge colorScheme="green">{job.salaryRange}</Badge>
            </HStack>

            {job.jobDescription && (
                <Box mt={4}>
                    <Text fontSize="sm" color="gray.700" noOfLines={showFullDescription ? undefined : 3}>
                        {job.jobDescription}
                    </Text>
                    {hasLongDescription && (
                        <Button size="sm" variant="link" colorScheme="purple" onClick={toggleDescription}>
                            {showFullDescription ? 'See Less' : 'See More'}
                        </Button>
                    )}
                    <Text fontSize="sm" mt={2}>
                        <strong>Required Qualifications:</strong> {job.requiredQualifications}
                    </Text>
                    <HStack spacing={3} mt={2}>
                        <Text fontSize="sm">
                            <strong>Undergrad:</strong> {job.undergraduationPercentage} CGPA
                        </Text>
                        <Text fontSize="sm">
                            <strong>XII:</strong> {job.xiiPercentage}%
                        </Text>
                        <Text fontSize="sm">
                            <strong>X:</strong> {job.xPercentage}%
                        </Text>
                        <Text fontSize="sm">
                            <strong>Location:</strong> {job.location}
                        </Text>
                    </HStack>
                    <Text fontSize="sm">
                        <strong>Posted At:</strong> {new Date(job.postedAt).toLocaleString()}
                    </Text>
                </Box>
            )}
        </Box>
    );
};

export default RecruiterDashboard;
