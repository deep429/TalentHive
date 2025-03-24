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

    const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB size limit

    useEffect(() => {
        const user = auth.currentUser;
        if (user) {
            console.log("User ID from Firebase on mount:", user.uid); // Log on mount
            setName(user.displayName || '');
            setEmail(user.email || '');
            setAvatar(user.photoURL || null);
        }
    }, []);

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > MAX_IMAGE_SIZE) {
                setImageSizeError('File size exceeds 5MB. Please upload a smaller image.');
                return;
            }

            setImageSizeError('');
            setAvatar(URL.createObjectURL(file));
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const user = auth.currentUser;

            if (user) {
                console.log("User ID from Firebase before update:", user.uid); // Log before update
                const formData = new FormData();
                formData.append('userId', user.uid);
                formData.append('displayName', name);
                formData.append('email', email);
                formData.append('rollNo', rollNo);

                const fileInput = document.getElementById('avatar');
                if (fileInput.files.length > 0) {
                    const file = fileInput.files[0];
                    formData.append('avatar', file);
                }

                const response = await fetch('http://localhost:5000/api/update-profile', {
                    method: 'POST',
                    body: formData,
                });

                console.log("Full response:", response); // Log the full response

                if (!response.ok) {
                    const errorText = await response.text(); // Get error message from the response
                    throw new Error(`Failed to update profile in the backend: ${errorText}`);
                }

                const data = await response.json();
                console.log("Data from backend:", data); // Log the data

                try {
                    await updateProfile(user, {
                        displayName: name,
                        photoURL: data.photoURL || user.photoURL,
                    });
                } catch (firebaseError) {
                    console.error("Firebase updateProfile error:", firebaseError);
                    toast({
                        title: 'Error updating Firebase profile.',
                        description: firebaseError.message,
                        status: 'error',
                        duration: 3000,
                        isClosable: true,
                    });
                }

                setAvatar(data.photoURL || user.photoURL);

                toast({
                    title: 'Profile updated successfully.',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                });

                navigate(-1);
            }
        } catch (error) {
            toast({
                title: 'Error updating profile.',
                description: error.message,
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Box p={6} maxWidth="600px" mx="auto" bg="white" boxShadow="md" borderRadius="lg">
            <Heading as="h2" size="lg" mb={6} color="purple.600">
                Edit Profile
            </Heading>

            <form onSubmit={handleUpdateProfile}>
                <Stack spacing={4}>
                    <FormControl>
                        <FormLabel htmlFor="avatar">Profile Picture</FormLabel>
                        <Avatar size="lg" src={avatar} mb={4} />
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
                        >
                            Update Profile
                        </Button>
                        <Button
                            colorScheme="gray"
                            onClick={() => navigate(-1)}
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
