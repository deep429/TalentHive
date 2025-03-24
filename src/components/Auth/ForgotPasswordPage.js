import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Flex,
  Stack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  Text,
  Box,
  IconButton,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CloseButton,
  useToast, // Import useToast
} from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from './firebase'; // Ensure this is your Firebase configuration file

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(''); // For success alert message
  const emailInputRef = useRef(null);

  const navigate = useNavigate();
  const toast = useToast(); 

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(''); 

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess('Password reset email sent. Check your inbox.');
      setLoading(false);
      navigate('/login'); 
      
      toast({
        title: 'Email Sent',
        description: 'Password reset email has been sent. Please check your inbox.',
        status: 'success',
        duration: 4000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error sending reset email:', error.message);
      setError('Error sending reset email. Please try again.');
      setLoading(false);

      // Display error toast notification
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    }
  };

  return (
    <Flex minHeight="100vh" align="center" justify="center" bg="gray.50" p={5}>
      <IconButton
        icon={<ArrowBackIcon />}
        aria-label="Go back"
        onClick={() => navigate(-1)}
        variant="outline"
        colorScheme="purple"
        position="absolute"
        top={4}
        left={4}
        mb={4}
      />
      <Stack spacing={5} maxWidth="400px" width="full">
        <Heading as="h2" size="lg" textAlign="center" color="purple.500">
          Forgot Password
        </Heading>
        <Box p={5} shadow="md" borderWidth="1px" borderRadius="md" bg="white">
          <form onSubmit={handleResetPassword}>
            <FormControl isRequired mb={4}>
              <FormLabel htmlFor="email">Email</FormLabel>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                ref={emailInputRef}
              />
            </FormControl>

            {/* Success or Error Alert */}
            {success && (
              <Alert status="success" mb={4}>
                <AlertIcon />
                <AlertTitle>Success!</AlertTitle>
                <AlertDescription>{success}</AlertDescription>
                <CloseButton position="absolute" right="8px" top="8px" />
              </Alert>
            )}

            {error && (
              <Alert status="error" mb={4}>
                <AlertIcon />
                <AlertTitle>Error!</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
                <CloseButton position="absolute" right="8px" top="8px" />
              </Alert>
            )}

            <Button
              colorScheme="purple"
              width="full"
              type="submit"
              isLoading={loading}
            >
              {loading ? <Spinner /> : 'Reset Password'}
            </Button>
          </form>
        </Box>
      </Stack>
    </Flex>
  );
};

export default ForgotPasswordPage;
