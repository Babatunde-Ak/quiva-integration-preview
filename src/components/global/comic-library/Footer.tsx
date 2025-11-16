'use client'

import Picture from '@/components/picture/Index'
import { QuivaLogo } from '@/components/utils/function'
import {motion} from 'framer-motion'
import {
    Sun,
    Moon
} from 'lucide-react'
import {useState} from 'react'
import { FaXTwitter, FaDiscord, FaGithub, FaYoutube  } from 'react-icons/fa6'
import { hbar } from '../../../../public/dev_images'

interface FooterProps {
    className?: string
}

export function Footer({
    className = ""
} : FooterProps) {
    const [isDarkMode, setIsDarkMode] = useState(true)

    const socialLinks = [
        {
            icon: FaXTwitter,
            href: "https://twitter.com/quiva",
            label: "Twitter"
        }, {
            icon: FaDiscord,
            href: "https://discord.gg/quiva",
            label: "Discord"
        }, {
            icon: FaGithub,
            href: "https://github.com/quiva",
            label: "GitHub"
        }, {
            icon: FaYoutube ,
            href: "https://youtube.com/@quiva",
            label: "YouTube"
        }
    ]

    const navigationSections = [
        {
            title: "Marketplace",
            links: [
                {
                    label: "Home",
                    href: "/"
                }, {
                    label: "Explore",
                    href: "/explore"
                }, {
                    label: "Activities",
                    href: "/activities"
                }
            ]
        }, {
            title: "Resources",
            links: [
                {
                    label: "Careers (future)",
                    href: "/careers"
                }, {
                    label: "Help Center",
                    href: "/help"
                }, {
                    label: "Contact",
                    href: "/contact"
                }
            ]
        }, {
            title: "Links",
            links: [
                {
                    label: "Creator Guidelines",
                    href: "/guidelines"
                }, {
                    label: "Terms & Policies",
                    href: "/terms"
                }
            ]
        }
    ]

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode)
        // Add your theme switching logic here
    }

    return (
        <footer className={`bg-black-500 ${className}`}>
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Brand Section */}
                    <div className="lg:col-span-4 space-y-4">
                        <div className="flex items-center gap-3">
                            <QuivaLogo showText className="invert" />
                        </div>

                        <p className="text-white text-xs">
                            Join Quiva community
                        </p>

                        {/* Social Links */}
                        <div className="flex gap-1">
                            {socialLinks.map((social) => {
                                const IconComponent = social.icon;
                                return (
                                    <motion.a
                                        key={social.label}
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-500 hover:text-white hover:bg-black-100 transition-colors"
                                        whileHover={{
                                            scale: 1.1
                                        }}
                                        whileTap={{
                                            scale: 0.95
                                        }}
                                    >
                                        <IconComponent size={16} />
                                    </motion.a>
                                )
                            })}
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <div className="lg:col-span-6 lg:col-start-6 grid grid-cols-1 sm:grid-cols-3 gap-8">
                        {navigationSections.map((section) => (
                            <div key={section.title} className="space-y-4">
                                <h3 className="text-white font-medium text-sm">
                                    {section.title}
                                </h3>
                                <ul className="space-y-3">
                                    {section
                                        .links
                                        .map((link) => (
                                            <li key={link.label}>
                                                <a
                                                    href={link.href}
                                                    className="text-gray-600 text-sm hover:text-white transition-colors">
                                                    {link.label}
                                                </a>
                                            </li>
                                        ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    
                </div>


                <div className='px-4 mt-8 rounded-2xl border border-secondary-200 grid lg:grid-cols-2 items-center gap-6 py-6'>

                    <div className="flex flex-wrap gap-6">
                        <a
                            href="/terms"
                            className="text-gray-600 text-xl font-semibold hover:text-white transition-colors">
                            Terms of Services
                        </a>
                        <div className="w-px h-6 bg-gray-600"></div>
                        <a
                            href="/privacy"
                            className="text-gray-600 text-xl font-semibold hover:text-white transition-colors">
                            Privacy Policy
                        </a>
                    </div>

                    {/* Right Section - Price & Controls */}
                    <div className=" flex items-center justify-end">
                        {/* Price Display */}
                        <div className="flex items-center gap-2  px-4 rounded-lg">
                            <div
                                className="p-[0.5px] bg-gray-600 rounded-full flex items-center justify-center">
                                    <Picture src={hbar} alt="Hedera Logo" className="w-8 h-8" />
                            </div>
                            <span className="text-gray-600 font-bold text-2xl">3,845.11</span>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-3 !mt-0">
                            <button className="text-gray-600 hover:text-white transition-colors">
                                <span className="text-lg">Support</span>
                            </button>

                            <div className="w-px h-4 bg-gray-600"></div>

                            <button
                                onClick={toggleTheme}
                                className="text-gray-600 hover:text-white transition-colors">
                                <Sun size={16}/>
                            </button>

                            <button
                                onClick={toggleTheme}
                                className="text-white hover:text-white transition-colors">
                                {isDarkMode
                                    ? <Sun size={16}/>
                                    : <Moon size={16}/>}
                            </button>
                        </div>
                    </div>
                </div>


                {/* Bottom Section */}
                <div
                    className="mt-8 pt-6 border-t border-gray-800 flex justify-center items-center gap-4">
                    
                    <div className="text-gray-500 text-xs">
                        ©Quiva 2025. All rights reserved.
                    </div>
                </div>
            </div>
        </footer>
    )
}