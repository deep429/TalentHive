import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Grid,
  GridItem,
  Button,
  Flex,
  VStack,
  HStack,
  Avatar,
  Badge,
  Spacer,
  Divider,
  useToast,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom'; // Assuming React Router is used
import { FiLogOut, FiBriefcase, FiUsers, FiSettings, FiClipboard } from 'react-icons/fi';
import { auth } from '../Auth/firebase'; 

const Dashboard = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [resume, setResume] = useState(null);
  const [user, setUser] = useState(null); // State to store user data
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser); // Set the user details from Firebase
        setLoading(false); // Stop loading when the user is fetched
      } else {
        setLoading(false);
        navigate('/login'); // Redirect if not logged in
      }
    });

    return () => unsubscribe(); // Clean up the listener on unmount
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    toast({
      title: 'Logged out successfully.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    navigate('/login');
  };

  const handleEditProfile = () => {
    navigate('/edit-profile');
  };

  const handleApplyJob = (jobTitle) => {
    toast({
      title: `Applied for ${jobTitle}`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleResumeUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = () => {
        setResume(reader.result);
        toast({
          title: 'Resume uploaded successfully.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      };
      reader.readAsDataURL(file);
    } else {
      toast({
        title: 'Invalid File',
        description: 'Please upload a PDF file.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const recentJobs = [
    { id: 1, title: 'Frontend Developer', company: 'Tech Corp', location: 'Remote', type: 'Full-Time' },
    { id: 2, title: 'Backend Engineer', company: 'Code Works', location: 'San Francisco, CA', type: 'Part-Time' },
    { id: 3, title: 'UI/UX Designer', company: 'Creative Studio', location: 'New York, NY', type: 'Contract' },
  ];

  if (loading) return <Box>Loading...</Box>; // Optional: Loading state

  return (
    <Flex minHeight="100vh" bg="gray.100">
      {/* Sidebar */}
      <Box w="20%" bg="green.200" color="black" p={5}>
        <VStack spacing={6} align="start">
          <Flex align="center" onClick={handleEditProfile} cursor="pointer">
            <Avatar size="lg" src={user?.photoURL} />
            <Box ml={4}>
              <Text fontWeight="bold">{user?.displayName}</Text>
              <Text fontSize="sm">{user?.email}</Text>
            </Box>
          </Flex>
          <Divider borderColor="purple.400" />
          <Button
            leftIcon={<FiBriefcase />}
            variant="ghost"
            justifyContent="start"
            w="100%"
          >
            Dashboard
          </Button>
          <Button
            leftIcon={<FiUsers />}
            variant="ghost"
            justifyContent="start"
            w="100%"
          >
            Networking
          </Button>
          <Button
            leftIcon={<FiClipboard />}
            variant="ghost"
            justifyContent="start"
            w="100%"
          >
            Applications
          </Button>
          <Button
            leftIcon={<FiSettings />}
            variant="ghost"
            justifyContent="start"
            w="100%"
          >
            Settings
          </Button>
          <Spacer />
          <Button
            leftIcon={<FiLogOut />}
            variant="ghost"
            justifyContent="start"
            w="100%"
            onClick={onOpen}
          >
            Logout
          </Button>
        </VStack>
      </Box>

      {/* Main Content */}
      <Box w="80%" p={6}>
        <Heading mb={6} color="purple.600">
          Job Portal Dashboard
        </Heading>

        {/* Statistics Section */}
        <Grid templateColumns="repeat(3, 1fr)" gap={6} mb={6}>
          <GridItem>
            <Box p={5} shadow="md" borderWidth="1px" bg="white" borderRadius="lg">
              <Heading size="md">Jobs Applied</Heading>
              <Text mt={2} fontSize="xl" fontWeight="bold" color="purple.600">
                24
              </Text>
            </Box>
          </GridItem>
          <GridItem>
            <Box p={5} shadow="md" borderWidth="1px" bg="white" borderRadius="lg">
              <Heading size="md">Interviews Scheduled</Heading>
              <Text mt={2} fontSize="xl" fontWeight="bold" color="purple.600">
                5
              </Text>
            </Box>
          </GridItem>
          <GridItem>
            <Box p={5} shadow="md" borderWidth="1px" bg="white" borderRadius="lg">
              <Heading size="md">Connections</Heading>
              <Text mt={2} fontSize="xl" fontWeight="bold" color="purple.600">
                78
              </Text>
            </Box>
          </GridItem>
        </Grid>

        {/* Recent Jobs Section */}
        <Box mb={6}>
          <Heading size="md" mb={4}>
            Recent Job Listings
          </Heading>
          <Box bg="white" p={5} shadow="md" borderRadius="lg">
            {recentJobs.map((job) => (
              <Flex key={job.id} mb={4} align="center">
                <Box>
                  <Text fontWeight="bold">{job.title}</Text>
                  <Text fontSize="sm">{job.company}</Text>
                  <HStack spacing={3} mt={2}>
                    <Badge colorScheme="purple">{job.location}</Badge>
                    <Badge colorScheme="green">{job.type}</Badge>
                  </HStack>
                </Box>
                <Spacer />
                <Button
                  size="sm"
                  colorScheme="purple"
                  onClick={() => handleApplyJob(job.title)}
                >
                  Apply
                </Button>
              </Flex>
            ))}
          </Box>
        </Box>

        {/* Profile Management Section */}
        <Box>
          <Heading size="md" mb={4}>
            Profile Management
          </Heading>
          <Grid templateColumns="repeat(2, 1fr)" gap={6}>
            <GridItem>
              <Box p={5} shadow="md" borderWidth="1px" bg="white" borderRadius="lg">
                <Heading size="sm">Update Profile</Heading>
                <Text mt={2}>Keep your profile up-to-date to get better recommendations.</Text>
                <Button
                  mt={4}
                  colorScheme="purple"
                  size="sm"
                  onClick={handleEditProfile}
                >
                  Edit Profile
                </Button>
              </Box>
            </GridItem>
            <GridItem>
              <Box p={5} shadow="md" borderWidth="1px" bg="white" borderRadius="lg">
                <Heading size="sm">Upload Resume</Heading>
                <Text mt={2}>Upload the latest version of your resume.</Text>
                <Button mt={4} colorScheme="purple" size="sm" onClick={() => document.getElementById('resume-upload').click()}>
                  Upload
                </Button>
                <Input
                  id="resume-upload"
                  type="file"
                  accept=".pdf"
                  hidden
                  onChange={handleResumeUpload}
                />
              </Box>
            </GridItem>
          </Grid>
        </Box>
      </Box>

      {/* Logout Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Logout</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Are you sure you want to log out?</Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="red" mr={3} onClick={handleLogout}>
              Logout
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default Dashboard;
