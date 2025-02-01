'use client';
import { RootState } from '@/store/store';
import { useSelector } from 'react-redux';
import Image from 'next/image';
import {
	Modal,
	ModalContent,
	useDisclosure,
} from '@nextui-org/react';
import ProfilePage from '../ProfilePage/ProfilePage';
import styles from '@/styles/shared.module.css';
import { motion } from 'framer-motion';
import clsx from 'clsx';

const ProfileButton = () => {
	const user = useSelector((state: RootState) => state.user);
	const { isOpen, onOpen, onOpenChange } = useDisclosure();

	return (
		<div className='relative'>
			<motion.button
				onClick={onOpen}
				whileHover={{ scale: 1.05 }}
				whileTap={{ scale: 0.95 }}
				className={clsx(
					'relative rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
					'group'
				)}
			>
				{user.userDetails.photoURL ? (
					<Image
						src={user.userDetails.photoURL}
						alt={`${user.userDetails.name}'s profile`}
						width={40}
						height={40}
						className={clsx(
							styles.profileImage,
							'group-hover:border-indigo-500 transition-colors duration-200'
						)}
					/>
				) : (
					<div
						className={clsx(
							styles.profileImage,
							'group-hover:border-indigo-500 transition-colors duration-200 bg-gray-200 flex items-center justify-center'
						)}
					>
						<span className='text-gray-600 text-sm'>
							{user.userDetails.name?.[0]?.toUpperCase() ||
								'?'}
						</span>
					</div>
				)}
				<motion.div
					className='absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-green-500 border-2 border-white'
					animate={{
						scale: [1, 1.2, 1],
					}}
					transition={{
						duration: 2,
						repeat: Infinity,
						repeatType: 'reverse',
					}}
				/>
			</motion.button>

			<Modal
				isOpen={isOpen}
				onOpenChange={onOpenChange}
				className={styles.modalContent}
				size='2xl'
				scrollBehavior='inside'
				classNames={{
					body: 'overflow-auto max-h-[80vh]',
					backdrop:
						'bg-gradient-to-t from-zinc-900 to-zinc-900/10',
					base: 'border-zinc-200 dark:border-zinc-700',
					header:
						'border-b-[1px] border-zinc-200 dark:border-zinc-700',
					footer:
						'border-t-[1px] border-zinc-200 dark:border-zinc-700',
				}}
			>
				<ModalContent>
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 20 }}
						className='max-h-[80vh] overflow-y-auto'
					>
						<ProfilePage />
					</motion.div>
				</ModalContent>
			</Modal>
		</div>
	);
};

export default ProfileButton;
