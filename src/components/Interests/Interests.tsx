// components/Interests.tsx
import {
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	Button,
	Input,
	useDisclosure,
} from '@nextui-org/react';
import { useState, useEffect } from 'react';
import { RootState } from '@/store/store';
import { useSelector, useDispatch } from 'react-redux';
import { setUserInterests } from '@/store/userInterestsSlice';
import styles from '@/styles/shared.module.css';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import Skeleton from 'react-loading-skeleton';
import toast from 'react-hot-toast';

const Interests = () => {
	const dispatch = useDispatch();
	const [newInterest, setNewInterest] = useState<string>('');
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string>('');
	const userInterests = useSelector(
		(state: RootState) => state.userInterests
	);
	const user = useSelector((state: RootState) => state.user);
	const { isOpen, onOpen, onOpenChange } = useDisclosure();

	// Function to add new interest
	const addInterest = async () => {
		if (!newInterest.trim()) return;
		const toastId = toast.loading('Adding interest...');
		try {
			setIsLoading(true);
			const res = await fetch('/api/interests', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					userId: user.userDetails.uid,
					interest: newInterest.trim(),
				}),
			});

			if (!res.ok) {
				throw new Error('Failed to add interest');
			}

			const data = await res.json();
			dispatch(
				setUserInterests({
					interests: data.interests,
					userId: user.userDetails.uid,
				})
			);
			setNewInterest(''); // Clear input after successful addition
			setError('');
			toast.dismiss(toastId);
			toast.success('Interest added successfully', {
				id: toastId,
			});
		} catch (error) {
			console.error('Error adding interest:', error);
			setError('Failed to add interest');
			toast.dismiss(toastId);
			toast.error('Failed to add interest', { id: toastId });
		} finally {
			setIsLoading(false);
		}
	};

	// Function to get the user's interests
	const getInterests = async () => {
		try {
			setIsLoading(true);
			const res = await fetch(
				`/api/interests?userId=${user.userDetails.uid}`
			);
			if (!res.ok) {
				throw new Error('Failed to fetch interests');
			}
			const data = await res.json();
			dispatch(
				setUserInterests({
					interests: data.interests || [],
					userId: user.userDetails.uid,
				})
			);
			setError('');
		} catch (error) {
			console.error('Error fetching interests:', error);
			setError('Failed to fetch interests');
		} finally {
			setIsLoading(false);
		}
	};

	// Fetch interests on component mount and user change
	useEffect(() => {
		if (user.userDetails?.uid) {
			getInterests();
		}
	}, [user.userDetails?.uid]);

	// Add this new function to handle interest removal
	const removeInterest = async (interestToRemove: string) => {
		try {
			setIsLoading(true);
			const res = await fetch('/api/interests', {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					userId: user.userDetails.uid,
					interest: interestToRemove,
				}),
			});

			if (!res.ok) {
				throw new Error('Failed to remove interest');
			}

			const data = await res.json();
			dispatch(
				setUserInterests({
					interests: data.interests,
					userId: user.userDetails.uid,
				})
			);
			setError('');
		} catch (error) {
			console.error('Error removing interest:', error);
			setError('Failed to remove interest');
		} finally {
			setIsLoading(false);
		}
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			addInterest();
		}
	};

	return (
		<div>
			<Button
				onPress={onOpen}
				className={clsx(
					styles.buttonSecondary,
					'w-full justify-center'
				)}
			>
				<PlusIcon className='h-5 w-5 mr-2' />
				Manage Interests
			</Button>

			<Modal
				isOpen={isOpen}
				onOpenChange={onOpenChange}
				className={styles.modalContent}
			>
				<ModalContent>
					{(onClose: () => void) => (
						<>
							<ModalHeader className='text-xl font-semibold text-red-600'>
								Manage Interests
							</ModalHeader>
							<ModalBody>
								{error && (
									<motion.div
										initial={{ opacity: 0, y: -10 }}
										animate={{ opacity: 1, y: 0 }}
										className='bg-red-50 text-red-600 p-3 rounded-md mb-4'
									>
										{error}
									</motion.div>
								)}

								<div className='space-y-4'>
									<div className='flex gap-2'>
										<Input
											value={newInterest}
											onChange={(e) =>
												setNewInterest(e.target.value)
											}
											onKeyPress={handleKeyPress}
											placeholder='Enter an interest'
											className={styles.input}
											disabled={isLoading}
										/>
										<Button
											onClick={addInterest}
											className={styles.button}
											disabled={
												isLoading || !newInterest.trim()
											}
										>
											Add
										</Button>
									</div>

									<div className='mt-6'>
										<h4 className='text-sm font-medium text-gray-900 mb-3'>
											Your Interests
										</h4>
										{isLoading ? (
											<div className='space-y-2'>
												{[...Array(3)].map((_, index) => (
													<Skeleton
														key={index}
														height={32}
													/>
												))}
											</div>
										) : (
											<div className='flex flex-wrap gap-2'>
												<AnimatePresence>
													{userInterests.interests.map(
														(interest, index) => (
															<motion.div
																key={index}
																initial={{
																	opacity: 0,
																	scale: 0.8,
																}}
																animate={{
																	opacity: 1,
																	scale: 1,
																}}
																exit={{
																	opacity: 0,
																	scale: 0.8,
																}}
																transition={{
																	duration: 0.2,
																}}
																className={clsx(
																	styles.badge,
																	styles.badgeSecondary,
																	'flex items-center gap-1'
																)}
															>
																<span>
																	{interest}
																</span>
																<button
																	onClick={() =>
																		removeInterest(
																			interest.toString()
																		)
																	}
																	className='p-0.5 hover:bg-gray-200 rounded-full transition-colors'
																	disabled={
																		isLoading
																	}
																	aria-label={`Remove ${interest} interest`}
																>
																	<XMarkIcon className='h-3 w-3' />
																</button>
															</motion.div>
														)
													)}
												</AnimatePresence>
											</div>
										)}
									</div>
								</div>

								<div className='flex justify-end gap-2 mt-6'>
									<Button
										color='danger'
										variant='light'
										onPress={onClose}
										className={styles.buttonSecondary}
									>
										Close
									</Button>
								</div>
							</ModalBody>
						</>
					)}
				</ModalContent>
			</Modal>
		</div>
	);
};

export default Interests;
