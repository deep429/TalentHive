import React from 'react';
import {
  Flex,
  Stack,
  Heading,
  Button,
  Box,
  IconButton,
  useToast,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { ArrowBackIcon } from '@chakra-ui/icons';

const UserTypeSelectionPage = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const handleLoginType = (userType) => {
    const loginPath = {
      JobSeeker: '/login',
      Recruiter: '/recruiter',
      Admin: '/admin',
    }[userType];
  
    toast({
      title: `Redirecting to ${userType} Login`,
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  
    if (loginPath) {
      navigate(loginPath);
    } else {
      toast({
        title: 'Invalid user type selected.',
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
    }
  };
  

  return (
    <Flex
      minHeight="100vh"
      align="center"
      justify="center"
      bg="gray.50"
      p={5}
      position="relative"
    >
      <IconButton
        icon={<ArrowBackIcon />}
        aria-label="Go back"
        onClick={() => navigate('/')}
        variant="outline"
        colorScheme="purple"
        position="absolute"
        top={4}
        left={4}
        mb={4}
      />
      <Stack spacing={5} maxWidth="400px" width="full">
        <Heading as="h2" size="lg" textAlign="center" color="purple.500">
          Choose Login Type
        </Heading>
        <Box
          p={5}
          shadow="md"
          borderWidth="1px"
          borderRadius="md"
          bg="white"
          textAlign="center"
        >
          <Stack spacing={4}>
            <Button
              colorScheme="teal"
              size="lg"
              onClick={() => handleLoginType('JobSeeker')}
            >
              Job Seeker Login
            </Button>
            <Button
              colorScheme="blue"
              size="lg"
              onClick={() => handleLoginType('Recruiter')}
            >
              Recruiter Login
            </Button>
            <Button
              colorScheme="purple"
              size="lg"
              onClick={() => handleLoginType('Admin')}
            >
              Admin Login
            </Button>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
};

export default UserTypeSelectionPage;
