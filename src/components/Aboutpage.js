// src/components/About.js

import React from "react";
import { Box, Heading, Text, Flex, Button } from "@chakra-ui/react";
import { Link } from 'react-router-dom';

const About = () => {
    return (
        <Flex
            minHeight="100vh"
            align="center"
            justify="center"
            bg="gray.50"
            p={5}
        >
            <Box textAlign="center" p={8} bg="white" borderRadius="md" shadow="md">
                <Heading as="h1" size="xl" color="purple.500" mb={4}>
                    About Talent Hive
                </Heading>
                <Text fontSize="lg" color="gray.600" mb={6}>
                    Talent Hive is a comprehensive platform designed to revolutionize 
                    your job search and career management. Our tools include a resume 
                    builder, ATS compatibility checker, and more. Stay tuned for updates 
                    as we continue to expand our features.
                </Text>
                {/* Return to Home Button */}
                <Link to="/">
                    <Button colorScheme="purple">Return to Home</Button>
                </Link>
            </Box>
        </Flex>
    );
};

export default About;