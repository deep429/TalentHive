import React from "react";
import {
  Box,
  Heading,
  Text,
  Flex,
  Button,
  VStack,
  Icon,
  HStack,
  Avatar,
  Image,
  IconButton,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { FaTools, FaRegLightbulb, FaBriefcase, FaHandshake, FaStar } from "react-icons/fa";
import { ArrowBackIcon } from "@chakra-ui/icons";

const ExploreFeatures = () => {
  return (
    <Flex
      direction="column"
      minHeight="100vh"
      bgGradient="linear(to-br, purple.50, gray.50)"
      p={5}
      justify="center"
      align="center"
    >
        <IconButton
    icon={<ArrowBackIcon />}
    aria-label="Go back"
    onClick={() => window.history.back()}
    variant="outline"
    colorScheme="purple"
    position="fixed"
    top={4}
    left={4}
    zIndex={10}
    mb={4}
    borderRadius="lg"
    />

      <Box
        textAlign="center"
        width="100%" // Make it full width
        maxWidth="800px" // Set maximum width
        mx="auto"
        p={10}
        bg="white"
        borderRadius="lg"
        shadow="lg"
        mb={10}
      >
        <Heading as="h1" size="2xl" color="purple.600" mb={6}>
          Explore the Features of Talent Hive
        </Heading>
        <Text fontSize="lg" color="gray.700" lineHeight="tall">
          Talent Hive offers a comprehensive suite of tools to streamline your job search and career development.
          Check out our features designed to help you succeed in your career journey.
        </Text>
      </Box>

      {/* Feature 1: Resume Builder */}
      <Box bg="white" p={8} borderRadius="lg" shadow="lg" mb={10} width="100%">
        <Heading as="h2" size="xl" color="purple.600" mb={6} textAlign="center">
          Resume Builder
        </Heading>
        <VStack spacing={6} align="center">
          <Flex align="center" justify="center">
            <Icon as={FaTools} boxSize={8} color="purple.500" mr={4} />
            <Text fontSize="lg" color="gray.600" textAlign="center">
              <strong>ATS-Compatible Resumes:</strong> Create a standout resume that is optimized for Applicant Tracking Systems (ATS) to ensure you get noticed by recruiters.
            </Text>
          </Flex>
        </VStack>
        <Flex justify="center" mt={6}>
          <Link to="/features/resume-builder">
            <Button colorScheme="purple" size="lg">
              Learn More
            </Button>
          </Link>
        </Flex>
      </Box>

      {/* Feature 2: Job Recommendations */}
      <Box bg="white" p={8} borderRadius="lg" shadow="lg" mb={10} width="100%">
        <Heading as="h2" size="xl" color="purple.600" mb={6} textAlign="center">
          Job Recommendations
        </Heading>
        <VStack spacing={6} align="center">
          <Flex align="center" justify="center">
            <Icon as={FaRegLightbulb} boxSize={8} color="purple.500" mr={4} />
            <Text fontSize="lg" color="gray.600" textAlign="center">
              <strong>Personalized Job Suggestions:</strong> Receive tailored job opportunities based on your skills, experience, and career preferences.
            </Text>
          </Flex>
        </VStack>
        <Flex justify="center" mt={6}>
          <Link to="/features/job-recommendations">
            <Button colorScheme="purple" size="lg">
              Learn More
            </Button>
          </Link>
        </Flex>
      </Box>

      {/* Feature 3: Interview Management */}
      <Box bg="white" p={8} borderRadius="lg" shadow="lg" mb={10} width="100%">
        <Heading as="h2" size="xl" color="purple.600" mb={6} textAlign="center">
          Interview Management
        </Heading>
        <VStack spacing={6} align="center">
          <Flex align="center" justify="center">
            <Icon as={FaBriefcase} boxSize={8} color="purple.500" mr={4} />
            <Text fontSize="lg" color="gray.600" textAlign="center">
              <strong>Track & Organize Interviews:</strong> Easily schedule, manage, and track all your interview details, so you stay organized and on top of your game.
            </Text>
          </Flex>
        </VStack>
        <Flex justify="center" mt={6}>
          <Link to="/features/interview-management">
            <Button colorScheme="purple" size="lg">
              Learn More
            </Button>
          </Link>
        </Flex>
      </Box>

      {/* Feature 4: Networking Tools */}
      <Box bg="white" p={8} borderRadius="lg" shadow="lg" mb={10} width="100%">
        <Heading as="h2" size="xl" color="purple.600" mb={6} textAlign="center">
          Networking Tools
        </Heading>
        <VStack spacing={6} align="center">
          <Flex align="center" justify="center">
            <Icon as={FaHandshake} boxSize={8} color="purple.500" mr={4} />
            <Text fontSize="lg" color="gray.600" textAlign="center">
              <strong>Connect with Professionals:</strong> Build and expand your network by connecting with like-minded professionals in your industry.
            </Text>
          </Flex>
        </VStack>
        <Flex justify="center" mt={6}>
          <Link to="/features/networking-tools">
            <Button colorScheme="purple" size="lg">
              Learn More
            </Button>
          </Link>
        </Flex>
      </Box>

      {/* Call-to-Action Section */}
      <Box
        bgGradient="linear(to-r, purple.500, purple.600)"
        color="white"
        p={8}
        borderRadius="lg"
        textAlign="center"
        shadow="lg"
        mb={10}
        width="100%" // Full width for the call-to-action section
      >
        <Heading as="h2" size="xl" mb={4}>
          Ready to Take Your Career to the Next Level?
        </Heading>
        <Text fontSize="lg" mb={6}>
          Join Talent Hive today and unlock your full potential with our powerful tools and resources.
        </Text>
        <Flex justify="center" mt={6}>
          <Link to="/signup">
            <Button colorScheme="whiteAlpha" size="lg">
              Get Started
            </Button>
          </Link>
        </Flex>
      </Box>
    </Flex>
  );
};

export default ExploreFeatures;
