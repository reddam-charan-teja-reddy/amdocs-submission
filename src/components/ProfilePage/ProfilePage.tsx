import { RootState } from '@/store/store';
import { useSelector } from 'react-redux';
import Image from 'next/image';
import Interests from '../Interests/Interests';
import Skills from '../Skills/Skills';
import PathManagement from '../PathManagement/PathManagement';
import Logout from '../Logout/Logout';
import styles from '@/styles/shared.module.css';
import { motion } from 'framer-motion';
import clsx from 'clsx';

const ProfilePage = () => {
	const user = useSelector((state: RootState) => state.user);

	const profileSections = [
		{ component: <Interests />, label: 'Interests' },
		{ component: <Skills />, label: 'Skills' },
		{ component: <PathManagement />, label: 'Path Settings' },
	];

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: 20 }}
			className='space-y-6 p-6 overflow-y-auto'
		>
			<div className='text-center'>
				<div className='relative inline-block'>
					{user.userDetails.photoURL ? (
						<Image
							src={user.userDetails.photoURL}
							alt='profile'
							width={100}
							height={100}
							className='rounded-full border-4 border-white shadow-lg'
						/>
					) : (
						<div className='w-[100px] h-[100px] rounded-full border-4 border-white shadow-lg bg-gray-200 flex items-center justify-center'>
							<span className='text-gray-600 text-2xl'>
								{user.userDetails.name?.[0]?.toUpperCase() ||
									'?'}
							</span>
						</div>
					)}
					<motion.div
						className='absolute -bottom-2 -right-2 bg-green-500 h-4 w-4 rounded-full border-2 border-white'
						animate={{
							scale: [1, 1.2, 1],
						}}
						transition={{
							duration: 2,
							repeat: Infinity,
							repeatType: 'reverse',
						}}
					/>
				</div>
				<h2 className='mt-4 text-xl font-semibold text-gray-900'>
					{user.userDetails.name}
				</h2>
				<p className='text-sm text-gray-500'>
					{user.userDetails.email}
				</p>
			</div>

			<div className='grid gap-6 mt-8'>
				{profileSections.map((section, index) => (
					<motion.div
						key={section.label}
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: index * 0.1 }}
						className={clsx(
							styles.card,
							'transition-all duration-200 hover:border-indigo-500 border-2 border-transparent'
						)}
					>
						<h3 className='text-lg font-medium text-gray-900 mb-4'>
							{section.label}
						</h3>
						{section.component}
					</motion.div>
				))}
			</div>

			<div className='mt-8 text-center pb-6'>
				<Logout />
			</div>
		</motion.div>
	);
};

export default ProfilePage;
