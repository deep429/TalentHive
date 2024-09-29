import {
    Text,
    Stack,
    Box,
    Container,
    useColorModeValue,
} from '@chakra-ui/react';

const Footer = () => {
    return (
        <Box
            bg={useColorModeValue('gray.100', 'gray.900')}
            color={useColorModeValue('gray.700', 'gray.200')}>
            
            <Container
                as={Stack}
                maxW={'7xl'}
                py={5}
                direction={{ base: 'column', md: 'row' }}
                spacing={4}
                justify="center" 
                align="center"   
                textAlign="center"> {}

                <Text>&copy; 2024 TalentHive.</Text>
            </Container>
        </Box>
    );
}

export default Footer;
