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
} from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from './Auth/firebase'; // Ensure this is your Firebase configuration file

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const emailInputRef = useRef(null);

  const navigate = useNavigate();

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setError('Password reset email sent. Check your inbox.');
      setLoading(false);
      navigate('/login');
    } catch (error) {
      console.error('Error sending reset email:', error.message);
      setError('Error sending reset email. Please try again.');
      setLoading(false);
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
            {error && <Text color="red.500" mb={4}>{error}</Text>}
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