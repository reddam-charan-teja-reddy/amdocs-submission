'use client';
import { signOut } from 'firebase/auth';
import { useDispatch } from 'react-redux';
import { setAuthState, setUserDetails } from '@/store/userInfoSlice';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { auth } from '@/app/firebase/config';
import { setUserSkills } from '@/store/userSkillsSlice';
import { setUserInterests } from '@/store/userInterestsSlice';
import { setUserPaths } from '@/store/userPathsSlice';
import { setCurrentRoadmap } from '@/store/currentRoadmapSlice';
import { setUserPathManagement } from '@/store/userPathManagementSlice';
import {
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	useDisclosure,
} from '@nextui-org/react';
import styles from '@/styles/shared.module.css';
import { motion } from 'framer-motion';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { userPathManagementInitialState } from '@/store/userPathManagementSlice';

const Logout = () => {
	const dispatch = useDispatch();
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const { isOpen, onOpen, onOpenChange } = useDisclosure();

	useEffect(() => {
		console.log('Modal state changed to:', isOpen);
	}, [isOpen]);

	const handleLogout = async () => {
		try {
			setIsLoading(true);
			await signOut(auth);
			dispatch(setAuthState(false));
			dispatch(
				setUserDetails({
					uid: '',
					name: '',
					email: '',
					photoURL: '',
				})
			);
			dispatch(setUserSkills({ skills: [], userId: '' }));
			dispatch(setUserInterests({ interests: [], userId: '' }));
			dispatch(setUserPaths({ paths: [], userId: '' }));
			dispatch(setCurrentRoadmap(null));
			dispatch(
				setUserPathManagement(userPathManagementInitialState)
			);
			router.push('/login');
		} catch (error) {
			console.error('Error signing out:', error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div>
			<button
				onClick={onOpen}
				className={clsx(
					styles.buttonSecondary,
					'text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200'
				)}
			>
				<ArrowRightOnRectangleIcon className='h-5 w-5 mr-2' />
				Sign Out
			</button>

			<Modal
				isOpen={isOpen}
				onOpenChange={onOpenChange}
				className={styles.modalContent}
				backdrop='blur'
				size='full'
			>
				<ModalContent>
					{(onClose: () => void) => (
						<motion.div
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.95 }}
						>
							<ModalHeader className='text-xl font-semibold text-red-600'>
								Confirm Sign Out
							</ModalHeader>
							<ModalBody>
								<p className='text-gray-900'>
									Are you sure you want to sign out? You will
									need to sign in again to access your
									account.
								</p>

								<div className='flex justify-end gap-3 mt-6'>
									<button
										onClick={onClose}
										className={styles.buttonSecondary}
										disabled={isLoading}
									>
										Cancel
									</button>
									<button
										color='danger'
										onClick={handleLogout}
										className={clsx(
											styles.button,
											'bg-red-600 hover:bg-red-700 focus:ring-red-500'
										)}
										disabled={isLoading}
									>
										{isLoading
											? 'Signing out...'
											: 'Sign Out'}
									</button>
								</div>
							</ModalBody>
						</motion.div>
					)}
				</ModalContent>
			</Modal>
		</div>
	);
};

export default Logout;
