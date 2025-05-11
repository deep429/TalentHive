import React, { useState, useEffect } from 'react';
import {
    Box,
    Heading,
    FormControl,
    FormLabel,
    Input,
    Button,
    Text,
    Avatar,
    useToast,
    HStack,
    Stack,
    Skeleton,
} from '@chakra-ui/react';
import { auth } from '../Auth/firebase';
import { updateProfile } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const EditProfile = () => {
    const toast = useToast();
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [avatar, setAvatar] = useState(null);
    const [rollNo, setRollNo] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imageSizeError, setImageSizeError] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedFile, setSelectedFile] = useState(null);

    const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB size limit

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const user = auth.currentUser;
                if (user) {
                    // Fetch backend user data
                    const response = await fetch(`http://localhost:5000/api/update-profile/${user.uid}`);
                    if (response.ok) {
                        const userData = await response.json();
                        setName(userData.displayName || user.displayName || '');
                        setEmail(userData.email || user.email || '');
                        setRollNo(userData.rollNo || '');
                        
                        // Set profile picture URL (handles both absolute and relative URLs)
                        if (userData.photoURL) {
                            const fullUrl = userData.photoURL.startsWith('http') 
                                ? userData.photoURL 
                                : `http://localhost:5000${userData.photoURL}`;
                            setAvatar(fullUrl);
                        } else {
                            setAvatar(user.photoURL || null);
                        }
                    } else {
                        // Fallback to Firebase data if backend fetch fails
                        setName(user.displayName || '');
                        setEmail(user.email || '');
                        setAvatar(user.photoURL || null);
                    }
                }
            } catch (error) {
                console.error('Error fetching user profile:', error);
                const user = auth.currentUser;
                if (user) {
                    setName(user.displayName || '');
                    setEmail(user.email || '');
                    setAvatar(user.photoURL || null);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, []);

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > MAX_IMAGE_SIZE) {
                setImageSizeError('File size exceeds 5MB. Please upload a smaller image.');
                setSelectedFile(null);
                return;
            }

            setImageSizeError('');
            setSelectedFile(file);
            setAvatar(URL.createObjectURL(file));
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error('User not authenticated');
            }

            const formData = new FormData();
            formData.append('userId', user.uid);
            formData.append('displayName', name);
            formData.append('email', email);
            formData.append('rollNo', rollNo);

            if (selectedFile) {
                formData.append('avatar', selectedFile);
            }

            const response = await fetch('http://localhost:5000/api/update-profile', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to update profile: ${errorText}`);
            }

            const data = await response.json();
            let newPhotoUrl = data.photoURL || avatar;

            // Update Firebase profile
            try {
                await updateProfile(user, {
                    displayName: name,
                    photoURL: newPhotoUrl,
                });
            } catch (firebaseError) {
                console.error("Firebase update error:", firebaseError);
                // Continue even if Firebase update fails, as backend update succeeded
            }

            // Update the avatar URL if a new one was returned
            if (data.photoURL) {
                const fullUrl = data.photoURL.startsWith('http') 
                    ? data.photoURL 
                    : `http://localhost:5000${data.photoURL}`;
                setAvatar(fullUrl);
                newPhotoUrl = fullUrl;
            }

            toast({
                title: 'Profile updated successfully',
                description: 'Your changes have been saved',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });

            navigate(-1);
        } catch (error) {
            toast({
                title: 'Error updating profile',
                description: error.message,
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <Box p={6} maxWidth="600px" mx="auto" bg="white" boxShadow="md" borderRadius="lg">
                <Skeleton height="40px" mb={6} />
                <Stack spacing={4}>
                    <Skeleton height="100px" borderRadius="full" alignSelf="center" />
                    <Skeleton height="40px" />
                    <Skeleton height="40px" />
                    <Skeleton height="40px" />
                    <HStack spacing={4} mt={4}>
                        <Skeleton height="40px" flex={1} />
                        <Skeleton height="40px" flex={1} />
                    </HStack>
                </Stack>
            </Box>
        );
    }

    return (
        <Box p={6} maxWidth="600px" mx="auto" bg="white" boxShadow="md" borderRadius="lg">
            <Heading as="h2" size="lg" mb={6} color="purple.600">
                Edit Profile
            </Heading>

            <form onSubmit={handleUpdateProfile}>
                <Stack spacing={4}>
                    <FormControl>
                        <FormLabel htmlFor="avatar">Profile Picture</FormLabel>
                        <Avatar 
                            size="lg" 
                            src={avatar} 
                            mb={4} 
                            name={name}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/default-profile.png';
                            }}
                        />
                        <Input
                            id="avatar"
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                        />
                        {imageSizeError && (
                            <Text color="red.500" mt={2}>{imageSizeError}</Text>
                        )}
                    </FormControl>

                    <FormControl isRequired>
                        <FormLabel htmlFor="name">Name</FormLabel>
                        <Input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </FormControl>

                    <FormControl isRequired>
                        <FormLabel htmlFor="email">Email</FormLabel>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            isReadOnly
                            bg="gray.100"
                        />
                    </FormControl>

                    <FormControl isRequired>
                        <FormLabel htmlFor="rollNo">Roll No</FormLabel>
                        <Input
                            id="rollNo"
                            type="text"
                            value={rollNo}
                            onChange={(e) => setRollNo(e.target.value)}
                        />
                    </FormControl>

                    <HStack justify="space-between" mt={4}>
                        <Button
                            colorScheme="purple"
                            type="submit"
                            isLoading={isSubmitting}
                            loadingText="Updating..."
                        >
                            Update Profile
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => navigate(-1)}
                            isDisabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                    </HStack>
                </Stack>
            </form>
        </Box>
    );
};

export default EditProfile;