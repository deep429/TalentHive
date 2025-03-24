import { useState, useEffect, useRef } from 'react';
import {
  Stack,
  Flex,
  Heading,
  Spacer,
  HStack,
  Text,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  FormControl,
  FormLabel,
  Input,
} from '@chakra-ui/react';
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom';

// Set the worker source for pdf.js
GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js`;

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [pdfData, setPdfData] = useState(null);
  const canvasRef = useRef(null);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        const sizeInBytes = new Blob([result]).size;

        if (sizeInBytes > 5 * 1024 * 1024) {
          alert("File size exceeds the 5MB limit. Please upload a smaller PDF.");
          return;
        }

        localStorage.setItem('uploadedPdf', result);
        setPdfData(result);
        toast.success("PDF uploaded successfully!");
        handleClose();
      };
      reader.readAsDataURL(file);
    } else {
      alert("Please upload a valid PDF file.");
    }
  };

  useEffect(() => {
    const storedPdf = localStorage.getItem('uploadedPdf');
    if (storedPdf) {
      setPdfData(storedPdf);
    }
  }, []);

  return (
    <Stack p={5} bg={'gray.50'} as='header' style={{ position: 'sticky', top: 0, left: 0, width: '100%', zIndex: 10 }}>
      <Flex w='full' alignItems={'center'}>
        <Heading as='h3' ml={{ base: 0, sm: 8 }} size='lg' fontWeight={'thin'} color='purple.500' style={{ fontFamily: "Pacifico" }}>Talent Hive</Heading>
        <Spacer />
        <HStack spacing={10} mr={{ base: 0, sm: 8 }} as='nav' style={{ fontFamily: 'Poppins' }}>
          <Link to="/">
            <Text as='a' href='/' fontSize='18' _hover={{ color: 'purple.700'}}>
              Home
            </Text>
          </Link>
          <Link to="/about">
            <Text as='a' href='/about' fontSize='18' _hover={{ color: 'purple.700' }}>
              About
            </Text>
          </Link>
          <Button colorScheme={'purple'} fontWeight={'medium'} onClick={handleOpen}>Upload PDF</Button>
          <Link to="/user"><Button colorScheme={'green'} fontWeight={'medium'} >Login</Button></Link>
        </HStack>
      </Flex>

      <Modal isOpen={isOpen} onClose={handleClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Upload PDF</ModalHeader>
          <ModalBody>
            <FormControl>
              <FormLabel htmlFor='pdf-upload'>Select PDF File</FormLabel>
              <Input id='pdf-upload' type='file' accept='.pdf' onChange={handleFileUpload} />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme='blue' mr={3} onClick={handleClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <ToastContainer />

      <Text textAlign="center" fontSize="lg" fontWeight="bold" color="purple.600" mt={4} mb={2}>
        Resume Parsing Coming Soon...
      </Text>
      <Text textAlign="center" fontSize="md" color="gray.500">
        Stay tuned for updates!
      </Text>
    </Stack>
  );
};

export default Navbar;