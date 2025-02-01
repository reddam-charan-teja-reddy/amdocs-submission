import { FiPlus } from 'react-icons/fi';
import { AiOutlineHome } from 'react-icons/ai';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from '@/styles/shared.module.css';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import ProfileButton from '../ProfileButton/ProfileButton';

const Navbar = () => {
	const pathname = usePathname();

	const navItems = [
		{ href: '/', icon: AiOutlineHome, label: 'Home' },
		{ href: '/plus', icon: FiPlus, label: 'Add' },
	];

	return (
		<nav className='fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 sm:top-0 sm:bottom-auto z-50'>
			<div className={clsx(styles.container, 'py-2')}>
				<ul className='flex items-center sm:justify-between'>
					<li className='hidden sm:block'>
						<Link
							href={'/'}
							className='text-2xl font-bold text-gray-900'
						>
							LearnPaths
						</Link>
					</li>
					<div className='flex items-center justify-between sm:justify-end space-x-8 w-full sm:w-auto'>
						{navItems.map((item) => {
							const isActive = pathname === item.href;
							const Icon = item.icon;

							return (
								<li key={item.href}>
									<Link
										href={item.href}
										className={clsx(
											styles.navLink,
											'flex flex-col items-center sm:flex-row sm:space-x-2 p-2',
											isActive && styles.navLinkActive
										)}
									>
										<motion.div
											whileHover={{ scale: 1.1 }}
											whileTap={{ scale: 0.95 }}
										>
											<Icon size={24} />
										</motion.div>
										<span className='text-xs sm:text-sm'>
											{item.label}
										</span>
									</Link>
								</li>
							);
						})}
						<li className='flex flex-col items-center sm:flex-row sm:space-x-2 p-2'>
							<ProfileButton />
						</li>
					</div>
				</ul>
			</div>
		</nav>
	);
};

export default Navbar;
