import React, { useState, useEffect } from 'react';
import { Box, Heading, FormControl, FormLabel, Input, Button, Text, Avatar, useToast, HStack, Stack } from '@chakra-ui/react';
import { auth, storage } from '../Auth/firebase'; // Assuming Firebase is set up with both Auth and Storage
import { updateProfile } from 'firebase/auth';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';

const EditProfile = () => {
  const toast = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [bio, setBio] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageSizeError, setImageSizeError] = useState('');

  const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB size limit

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setName(user.displayName || '');
      setEmail(user.email || '');
      setAvatar(user.photoURL || null);
    }
  }, []);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check if the file is too large
      if (file.size > MAX_IMAGE_SIZE) {
        setImageSizeError('File size exceeds 5MB. Please upload a smaller image.');
        return;
      }

      // Reset error message if image size is valid
      setImageSizeError('');

      // Set the selected file as the avatar preview
      setAvatar(URL.createObjectURL(file));
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const user = auth.currentUser;

      if (user && avatar) {
        let photoURL = avatar;

        // If there's a new avatar, upload it to Firebase Storage
        if (avatar instanceof Blob) {
          const storageRef = ref(storage, `profile-pictures/${user.uid}`);
          const uploadTask = uploadBytesResumable(storageRef, avatar);

          // Wait for upload to complete
          await new Promise((resolve, reject) => {
            uploadTask.on('state_changed', null, reject, async () => {
              try {
                // Get the download URL after upload completes
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                photoURL = downloadURL;
                resolve();
              } catch (error) {
                reject(error);
              }
            });
          });
        }

        // Update profile with new details and photoURL
        await updateProfile(user, {
          displayName: name,
          photoURL,
        });

        toast({
          title: 'Profile updated successfully.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });

        navigate('/dashboard'); // Redirect to the dashboard after successful profile update
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
          {/* Avatar */}
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
          
          {/* Name */}
          <FormControl isRequired>
            <FormLabel htmlFor="name">Name</FormLabel>
            <Input 
              id="name" 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
            />
          </FormControl>
          
          {/* Email */}
          <FormControl isRequired>
            <FormLabel htmlFor="email">Email</FormLabel>
            <Input 
              id="email" 
              type="email" 
              value={email} 
              isReadOnly
            />
          </FormControl>
          
          {/* Bio */}
          <FormControl>
            <FormLabel htmlFor="bio">Bio</FormLabel>
            <Input 
              id="bio" 
              type="text" 
              value={bio} 
              onChange={(e) => setBio(e.target.value)} 
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
              onClick={() => navigate('/dashboard')}
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
