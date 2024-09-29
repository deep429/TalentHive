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
} from "@chakra-ui/react";
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Set the worker source for pdf.js
GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js`; // Use the version you want

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false); // State to manage modal visibility
    const [pdfData, setPdfData] = useState(null); // State to store the uploaded PDF data
    const canvasRef = useRef(null); // Create a ref for the canvas

    const handleOpen = () => setIsOpen(true); // Function to open modal
    const handleClose = () => setIsOpen(false); // Function to close modal

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file && file.type === 'application/pdf') {
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result; // This is the base64 data URL
                const sizeInBytes = new Blob([result]).size; // Calculate size of PDF in bytes

                if (sizeInBytes > 5 * 1024 * 1024) { // 5 MB limit
                    alert("File size exceeds the 5MB limit. Please upload a smaller PDF.");
                    return;
                }

                localStorage.setItem('uploadedPdf', result); // Store the PDF in local storage
                setPdfData(result); // Set the PDF data
                toast.success("PDF uploaded successfully!"); // Show success toast
                handleClose(); // Close the modal after file upload
            };
            reader.readAsDataURL(file); // Read the PDF file as Data URL
        } else {
            alert("Please upload a valid PDF file.");
        }
    };

    useEffect(() => {
        const storedPdf = localStorage.getItem('uploadedPdf');
        if (storedPdf) {
            setPdfData(storedPdf); // Load PDF data from local storage on component mount
        }
    }, []);

    return (
        <Stack p={5} bg={'gray.50'} as='header'>
            <Flex w='full' alignItems={'center'}>
                <Heading as='h3' ml={{ base: 0, sm: 8 }} size='lg' fontWeight={'thin'} color='purple.500' style={{ fontFamily: "Pacifico" }}>Talent Hive</Heading>
                <Spacer></Spacer>
                <HStack spacing={10} mr={{ base: 0, sm: 8 }} as='nav' style={{ fontFamily: 'Poppins' }}>
                    <Text as='a' href='#' fontSize='lg'>Home</Text>
                    <Text as='a' href='#' fontSize='lg'>About</Text>
                    <Button colorScheme={'purple'} fontWeight={'medium'} onClick={handleOpen}>Upload PDF</Button>
                </HStack>
            </Flex>

            {/* Modal for PDF Upload */}
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

            {/* Toast Container */}
            <ToastContainer />

            {/* Notification about Resume Parsing */}
            <Text 
    textAlign="center" 
    fontSize="lg" 
    fontWeight="bold" 
    color="purple.600" 
    mt={4} 
    mb={2}
>
    Resume Parsing Coming Soon...
</Text>
<Text 
    textAlign="center" 
    fontSize="md" 
    color="gray.500"
>
    Stay tuned for updates!
</Text>

        </Stack>
    );
};

export default Navbar;
