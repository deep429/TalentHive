// src/components/Main.js

import {
    Box,
    Container,
    Stack,
    Text,
    Heading,
    Button,
} from '@chakra-ui/react';
import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { MdOutlineFileDownload } from 'react-icons/md';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Builder from './Builder';
import ResumePreview from './ResumePreview';
import ThemeSelect from './Theme/ThemeSelect'; // Component for theme selection
import { useResume } from '../Context'; // Custom hook for Resume context

const Main = () => {
    const { printElem } = useResume(); // Ref from context

    // Handle PDF Download Functionality
    const handlePDFDownload = async () => {
        try {
            const element = printElem.current; // Get the resume preview element
            
            // Increase scale for better quality
            const canvas = await html2canvas(element, {
                scale: 2, // Increase scale factor (default is 1)
                useCORS: true, // Enable CORS if images are loaded from another domain
            });
            
            const imgData = canvas.toDataURL('image/png', 1.0); // Get image data with full quality
            const pdf = new jsPDF('p', 'mm', 'a4'); // Create a new PDF document
            
            const pdfWidth = pdf.internal.pageSize.getWidth(); // Get PDF width
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width; // Calculate height based on aspect ratio
            
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight); // Add image to PDF
            pdf.save('Resume.pdf'); // Save the PDF with a filename
        } catch (error) {
            console.error('Error generating PDF:', error);
        }
    };

    return (
        <Container bg={'gray.50'} minW={'full'} py={10} id='builder'>
            <Heading as='h4' size='lg' textAlign={'center'} color={'gray.700'} style={{ fontFamily: 'Poppins' }} fontWeight={'medium'}>
                Builder Dashboard
            </Heading>

            <Container maxW={'7xl'} px={8} my={3}>
                <Stack justifyContent={'space-between'} pt={4} direction={{ base: 'column', sm: 'row' }}>
                    <ThemeSelect />
                    <Button rightIcon={<MdOutlineFileDownload />} onClick={handlePDFDownload} colorScheme={'purple'}>
                        Resume PDF
                    </Button>
                </Stack>
            </Container>

            <Stack direction={{ base: 'column', md: 'row' }} gap={4} mx={{ base: 2, md: 12 }} my={8} alignItems={'flex-start'} justifyContent={'space-between'}>
                <Builder />
                {/* Resume preview with forwarded ref for printing */}
                <ResumePreview ref={printElem} />
            </Stack>
        </Container>
    );
};

export default Main;