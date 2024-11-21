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
  IconButton
} from "@chakra-ui/react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { FaTools, FaRegLightbulb, FaBriefcase, FaHandshake } from "react-icons/fa";
import Slider from "react-slick"; // Import Slider
import "slick-carousel/slick/slick.css"; // Import slick CSS
import "slick-carousel/slick/slick-theme.css"; // Import slick theme CSS

const About = () => {
  const navigate = useNavigate();

  // Sample testimonials data
  const testimonials = [
    {
      name: "Jane Doe",
      title: "Marketing Specialist",
      image: "https://i.pravatar.cc/100",
      quote: "Talent Hive made my job search so much easier. The resume builder and job recommendations were spot on!",
    },
    {
      name: "John Smith",
      title: "Software Engineer",
      image: "https://i.pravatar.cc/100?img=12",
      quote: "This platform is a game-changer! The ATS checker helped me land my dream job.",
    },
    {
      name: "Alice Johnson",
      title: "Product Manager",
      image: "https://i.pravatar.cc/100?img=3",
      quote: "I love using Talent Hive! It has everything I need for my career development.",
    },
    {
      name: "Bob Brown",
      title: "Graphic Designer",
      image: "https://i.pravatar.cc/100?img=4",
      quote: "The networking tools are fantastic! I've connected with so many professionals.",
    },
  ];

  // Slider settings
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

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
        onClick={() => navigate("/")}
        variant="outline"
        colorScheme="purple"
        position="fixed"
        top={4}
        left={4}
        mb={4}
      />
      
      <Box
        textAlign="center"
        width="100%"
        maxWidth="800px"
        mx="auto"
        p={10}
        bg="white"
        borderRadius="lg"
        shadow="lg"
        mb={10}
      >
        <Heading as="h1" size="2xl" color="purple.600" mb={6}>
          About Talent Hive
        </Heading>
        <Text fontSize="lg" color="gray.700" lineHeight="tall">
          Talent Hive is your ultimate career management and job search companion.
          With cutting-edge tools and a user-friendly interface, we empower professionals
          to achieve their goals. From crafting the perfect resume to preparing for interviews,
          Talent Hive is here to guide you every step of the way.
        </Text>
        <Link to="/features">
          <Button colorScheme="purple" size="lg" mt={6}>
            Explore Features
          </Button>
        </Link>
      </Box>

      {/* Features Section */}
      <Box bg="white" p={8} borderRadius="lg" shadow="lg" mb={10} width="100%">
        <Heading as="h2" size="xl" color="purple.600" textAlign="center" mb={6}>
          Why Choose Talent Hive?
        </Heading>
        <VStack spacing={6} align="start">
          <Flex align="center">
            <Icon as={FaTools} boxSize={8} color="purple.500" mr={4} />
            <Text fontSize="lg" color="gray.600">
              <strong>Resume Builder:</strong> Create professional, ATS-compatible resumes with ease.
            </Text>
          </Flex>
          <Flex align="center">
            <Icon as={FaRegLightbulb} boxSize={8} color="purple.500" mr={4} />
            <Text fontSize="lg" color="gray.600">
              <strong>Job Recommendations:</strong> Personalized job suggestions based on your skills and interests.
            </Text>
          </Flex>
          <Flex align="center">
            <Icon as={FaBriefcase} boxSize={8} color="purple.500" mr={4} />
            <Text fontSize="lg" color="gray.600">
              <strong>Interview Management:</strong> Track and organize your interview schedules effortlessly.
            </Text>
          </Flex>
          <Flex align="center">
            <Icon as={FaHandshake} boxSize={8} color="purple.500" mr={4} />
            <Text fontSize="lg" color="gray.600">
              <strong>Networking Tools:</strong> Connect with professionals and grow your network effectively.
            </Text>
          </Flex>
        </VStack>
      </Box>

      {/* Testimonials Section */}
      <Box bg="purple.50" p={8} borderRadius="lg" shadow="lg" mb={10} width="100%">
        <Heading as="h2" size="xl" color="purple.600" textAlign="center" mb={6}>
          What Our Users Say
        </Heading>
        
        {/* Slider for Testimonials */}
        <Slider {...settings}>
          {testimonials.map((testimonial, index) => (
            <VStack key={index} align="center" textAlign="center" p={4}>
              <Avatar name={testimonial.name} src={testimonial.image} mb={4} />
              <Text fontSize="lg" color="gray.700">
                "{testimonial.quote}"
              </Text>
              <Text fontWeight="bold" color="purple.500">
                - {testimonial.name}, {testimonial.title}
              </Text>
            </VStack>
          ))}
        </Slider>
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
        width="100%"
      >
        <Heading as="h2" size="xl" mb={4}>
          Ready to Take Your Career to the Next Level?
        </Heading>
        <Text fontSize="lg" mb={6}>
          Join Talent Hive today and unlock your full potential. It's time to
          take control of your career journey.
        </Text>
        <Link to="/signup">
          <Button colorScheme="whiteAlpha" size="lg">
            Get Started
          </Button>
        </Link>
      </Box>
    </Flex>
  );
};

export default About;