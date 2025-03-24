import React, { useState, useRef } from 'react';
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
  Checkbox,
  IconButton,
  Link as ChakraLink,
  useToast, // Import useToast hook
} from '@chakra-ui/react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { GoogleLogin } from '@react-oauth/google';
import {
  signInWithEmailAndPassword,
  signInWithCredential,
  GoogleAuthProvider,
} from 'firebase/auth';
import { auth } from './firebase'; // Ensure this is your Firebase configuration file

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const toast = useToast(); // Initialize useToast hook

  const emailInputRef = useRef(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log('Login successful');
      navigate('/recruiterdash');

      // Display success toast notification
      toast({
        title: 'Login Successful',
        description: 'You have successfully logged in.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Store email in local storage if checkbox is checked
      if (isChecked) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
    } catch (error) {
      setError(error.message);

      // Display error toast notification
      toast({
        title: 'Login Failed',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const isChecked = useRef(false);

  const handleGoogleLogin = async (response) => {
    try {
      const credential = response.credential;
      if (!credential) {
        throw new Error('No credential found');
      }

      // Use the GoogleAuthProvider to sign in with the Google credential
      const providerCredential = GoogleAuthProvider.credential(credential);
      
      const userCredential = await signInWithCredential(auth, providerCredential);

      console.log('Google login successful:', userCredential.user);
      navigate('/recruiterdash');

      // Display success toast notification for Google login
      toast({
        title: 'Google Login Successful',
        description: 'You have logged in using your Google account.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error during Google login:', error.message);

      // Display error toast notification for Google login
      toast({
        title: 'Google Login Failed',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Flex minHeight="100vh" align="center" justify="center" bg="gray.50" p={5} position="relative">
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
          Login
        </Heading>
        <Box p={5} shadow="md" borderWidth="1px" borderRadius="md" bg="white">
          <form onSubmit={handleLogin}>
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
            {error && <Text color="red.500" mb={4}>{error}</Text>}
            <Checkbox mb={4} onChange={(e) => isChecked.current = e.target.checked}>
              Remember Me
            </Checkbox>
            <Button colorScheme="purple" width="full" type="submit" isLoading={loading}>
              Login
            </Button>
          </form>
          <Flex justifyContent="center" mt={4}>
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => console.log('Login Failed')}
              style={{ marginTop: '10px' }}
            />
          </Flex>
          <Flex mt={4} justifyContent="space-between">
            <ChakraLink as={Link} to="/forgot-password" color="purple.500">
              Forgot Password?
            </ChakraLink>
            <ChakraLink as={Link} to="/signup" color="purple.500">
              Sign Up
            </ChakraLink>
          </Flex>
        </Box>
      </Stack>
    </Flex>
  );
};

export default LoginPage;
