import React, { useState } from 'react';
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
  useToast, // Import useToast
} from '@chakra-ui/react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase'; // Ensure this is your Firebase configuration file

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const toast = useToast(); // Initialize useToast hook

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (password !== confirmPassword) {
        setError("Passwords don't match");
        setLoading(false);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('Sign up successful for:', userCredential.user);
      setError('');
      navigate('/login'); // Redirect to login page after successful sign-up

      // Display success toast notification
      toast({
        title: 'Sign Up Successful',
        description: 'Your account has been created. You can now log in.',
        status: 'success',
        duration: 4000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error creating user:', error.message);
      setError(handleFirebaseError(error.code));

      // Display error toast notification
      toast({
        title: 'Sign Up Failed',
        description: handleFirebaseError(error.code),
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFirebaseError = (errorCode) => {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'Email already in use. Please try a different email address.';
      case 'auth/weak-password':
        return 'Password is too weak. Please choose a stronger password.';
      default:
        return 'An error occurred during sign up. Please try again.';
    }
  };

  return (
    <Flex minHeight="100vh" align="center" justify="center" bg="gray.50" p={5}>
      <Stack spacing={5} maxWidth="400px" width="full">
        <Heading as="h2" size="lg" textAlign="center" color="purple.500">
          Sign Up
        </Heading>
        <Box p={5} shadow="md" borderWidth="1px" borderRadius="md" bg="white">
          <form onSubmit={handleSignUp}>
            <FormControl isRequired mb={4}>
              <FormLabel htmlFor="email">Email</FormLabel>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </FormControl>
            <FormControl isRequired mb={4}>
              <FormLabel htmlFor="password">Password</FormLabel>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </FormControl>
            <FormControl isRequired mb={4}>
              <FormLabel htmlFor="confirm-password">Confirm Password</FormLabel>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </FormControl>
            {error && <Text color="red.500" mb={4}>{error}</Text>}
            <Button colorScheme="purple" width="full" type="submit" isLoading={loading}>
              Sign Up
            </Button>
          </form>
          <Flex mt={4} justifyContent="center">
            <Text fontSize="sm">
              Already have an account?{' '}
              <Link to="/login" style={{ color: 'purple.500', textDecoration: 'underline' }}>
                Log In
              </Link>
            </Text>
          </Flex>
        </Box>
      </Stack>
    </Flex>
  );
};

export default SignUp;
