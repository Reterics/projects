'use client'

import {
    Box,
    Flex,
    Text,
    Button,
    Stack,
    useBreakpointValue,
    useDisclosure, IconButton,
} from '@chakra-ui/react'
import { Link as ChakraLink } from "@chakra-ui/react"
import NextLink from "next/link"
import { GiHamburgerMenu } from "react-icons/gi";

export interface NavItem {
    label: string
    subLabel?: string
    children?: Array<NavItem>
    href?: string
}


const NavigationBar = ({navItems}: {navItems: NavItem[]}) => {
    const { open, onToggle } = useDisclosure()

    return (
        <Box>
            <Flex
                minH={'60px'}
                py={{ base: 2 }}
                px={{ base: 4 }}
                borderBottom={1}
                borderStyle={'solid'}
                align={'center'}>
                <Flex
                    flex={{ base: 1, md: 'auto' }}
                    ml={{ base: -2 }}
                    display={{ base: 'flex', md: 'none' }}>
                    <IconButton
                        onClick={onToggle}
                        variant={'ghost'}
                        aria-label={'Toggle Navigation'}
                    ><GiHamburgerMenu /></IconButton>
                </Flex>
                <Flex flex={{ base: 1 }} justify={{ base: 'center', md: 'start' }}>
                    <Text
                        textAlign={useBreakpointValue({ base: 'center', md: 'left' })}
                        fontFamily={'heading'}>
                        Logo
                    </Text>

                    <Flex display={{ base: 'none', md: 'flex' }} ml={10}>
                    </Flex>
                </Flex>

                <Stack
                    flex={{ base: 1, md: 0 }}
                    justify={'flex-end'}
                    direction={'row'}
                    >
                    <ChakraLink asChild as={'a'} fontSize={'sm'} fontWeight={400} href={'#'}>
                        <NextLink href={'#'}>Sign In</NextLink>
                    </ChakraLink>
                    <Button
                        as={'a'}
                        display={{ base: 'none', md: 'inline-flex' }}
                        fontSize={'sm'}
                        fontWeight={600}
                        color={'white'}
                        bg={'pink.400'}
                        _hover={{
                            bg: 'pink.300',
                        }}>
                        Sign Up
                    </Button>
                </Stack>
            </Flex>
        </Box>
    );
};

export default NavigationBar;
