'use client';

import {
    Box,
    Flex,
    Text,
    Button,
    Stack,
    useDisclosure,
    IconButton,
    Link,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { GiHamburgerMenu } from 'react-icons/gi';
import styles from '@/app/page.module.css';
import Image from 'next/image';

export interface NavItem {
    label: string;
    subLabel?: string;
    children?: Array<NavItem>;
    href?: string;
}

const NavigationBar = ({ navItems }: { navItems: NavItem[] }) => {
    const { open, onToggle } = useDisclosure();

    return (
        <Box>
            <Flex
                minH={'60px'}
                py={{ base: 2 }}
                px={{ base: 4 }}
                borderTop={1}
                borderStyle={'solid'}
                bottom={0}
                position='fixed'
                width={'100%'}
                align={'center'}
            >
                <Flex
                    flex={{ base: 1, md: 'auto' }}
                    ml={{ base: -2 }}
                    display={{ base: 'flex', md: 'none' }}
                >
                    <IconButton
                        onClick={onToggle}
                        variant={'ghost'}
                        aria-label={'Toggle Navigation'}
                    >
                        <GiHamburgerMenu />
                    </IconButton>
                </Flex>
                <Flex
                    flex={{ base: 1 }}
                    justify={{ base: 'center', md: 'start' }}
                >
                    <Image
                        className={styles.logo}
                        src='/logoWhite.png'
                        alt='Next.js logo'
                        width={32}
                        height={32}
                        priority
                        style={{ marginRight: '0.5rem' }}
                    />
                    <Text fontFamily={'heading'}>Projects</Text>
                </Flex>

                <Stack
                    flex={{ base: 1, md: 0 }}
                    justify={'flex-end'}
                    direction={'row'}
                >
                    <Link
                        asChild
                        as={'a'}
                        fontSize={'sm'}
                        fontWeight={400}
                        href={'#'}
                    >
                        <NextLink href={'#'}>Sign In</NextLink>
                    </Link>
                    <Button
                        as={'a'}
                        display={{ base: 'none', md: 'inline-flex' }}
                        fontSize={'sm'}
                        fontWeight={600}
                        color={'white'}
                        bg={'pink.400'}
                        _hover={{
                            bg: 'pink.300',
                        }}
                    >
                        Sign Up
                    </Button>
                </Stack>
            </Flex>
        </Box>
    );
};

export default NavigationBar;
