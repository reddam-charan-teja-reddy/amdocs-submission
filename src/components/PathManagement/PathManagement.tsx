import {
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	Button,
	useDisclosure,
	Input,
	Select,
	SelectItem,
} from '@nextui-org/react';
import { useState, useEffect } from 'react';
import { RootState } from '@/store/store';
import { useSelector, useDispatch } from 'react-redux';
import { setUserPathManagement } from '@/store/userPathManagementSlice';
import styles from '@/styles/shared.module.css';
import { motion } from 'framer-motion';
import { AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import Skeleton from 'react-loading-skeleton';
import toast from 'react-hot-toast';

const PathManagement = () => {
	const dispatch = useDispatch();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string>('');
	const [formData, setFormData] = useState({
		customMsg: '',
		learningSpeed: 'medium',
		currentEducation: '',
		country: '',
	});

	const pathManagement = useSelector(
		(state: RootState) => state.userPathManagement
	);
	const user = useSelector((state: RootState) => state.user);
	const { isOpen, onOpen, onOpenChange } = useDisclosure();

	useEffect(() => {
		setFormData({
			customMsg: pathManagement.customMsg,
			learningSpeed: pathManagement.learningSpeed,
			currentEducation: pathManagement.currentEducation,
			country: pathManagement.country,
		});
	}, [pathManagement]);

	const handleSubmit = async () => {
		const toastId = toast.loading('Updating path management...');
		try {
			setIsLoading(true);
			const res = await fetch('/api/pathManagement', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					userId: user.userDetails.uid,
					...formData,
				}),
			});

			if (!res.ok) {
				throw new Error('Failed to update path management data');
			}

			const data = await res.json();
			dispatch(
				setUserPathManagement({
					...data,
					userId: user.userDetails.uid,
				})
			);
			toast.dismiss(toastId);
			toast.success('Path management updated successfully', {
				id: toastId,
			});
			setError('');
		} catch (error) {
			console.error('Error updating path management:', error);
			toast.dismiss(toastId);
			toast.error('Failed to update settings', { id: toastId });
			setError('Failed to update settings');
		} finally {
			setIsLoading(false);
		}
	};

	const learningSpeedOptions = [
		{ key: 'slow', label: 'Slow Paced' },
		{ key: 'medium', label: 'Medium Paced' },
		{ key: 'fast', label: 'Fast Paced' },
	];

	return (
		<div>
			<Button
				onPress={onOpen}
				className={clsx(
					styles.buttonSecondary,
					'w-full justify-center'
				)}
			>
				<AdjustmentsHorizontalIcon className='h-5 w-5 mr-2' />
				Path Settings
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
								Learning Path Settings
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

								<div className='space-y-6'>
									{isLoading ? (
										<div className='space-y-4'>
											{[...Array(4)].map((_, index) => (
												<Skeleton
													key={index}
													height={40}
												/>
											))}
										</div>
									) : (
										<>
											<div className='space-y-2'>
												<label className='block text-sm font-medium text-gray-700'>
													Custom Message
												</label>
												<Input
													value={formData.customMsg}
													onChange={(e) =>
														setFormData((prev) => ({
															...prev,
															customMsg:
																e.target.value,
														}))
													}
													placeholder='Enter a custom message'
													className={styles.input}
												/>
											</div>

											<div className='space-y-2'>
												<label className='block text-sm font-medium text-gray-700'>
													Current Education
												</label>
												<Input
													value={
														formData.currentEducation
													}
													onChange={(e) =>
														setFormData((prev) => ({
															...prev,
															currentEducation:
																e.target.value,
														}))
													}
													placeholder='Enter your current education'
													className={styles.input}
												/>
											</div>

											<div className='space-y-2'>
												<label className='block text-sm font-medium text-gray-700'>
													Country
												</label>
												<Input
													value={formData.country}
													onChange={(e) =>
														setFormData((prev) => ({
															...prev,
															country: e.target.value,
														}))
													}
													placeholder='Enter your country'
													className={styles.input}
												/>
											</div>

											<div className='space-y-2'>
												<label className='block text-sm font-medium text-gray-700'>
													Learning Speed
												</label>
												<Select
													selectedKeys={[
														formData.learningSpeed,
													]}
													onChange={(e) =>
														setFormData((prev) => ({
															...prev,
															learningSpeed:
																e.target.value,
														}))
													}
													className={styles.input}
												>
													{learningSpeedOptions.map(
														(option) => (
															<SelectItem
																className='text-indigo-900'
																key={option.key}
																value={option.key}
															>
																{option.label}
															</SelectItem>
														)
													)}
												</Select>
											</div>
										</>
									)}

									<div className='flex justify-end gap-2 pt-4'>
										<Button
											color='danger'
											variant='light'
											onPress={onClose}
											className={styles.buttonSecondary}
											disabled={isLoading}
										>
											Cancel
										</Button>
										<Button
											color='primary'
											onPress={handleSubmit}
											className={styles.button}
											disabled={isLoading}
										>
											{isLoading
												? 'Saving...'
												: 'Save Changes'}
										</Button>
									</div>
								</div>
							</ModalBody>
						</>
					)}
				</ModalContent>
			</Modal>
		</div>
	);
};

export default PathManagement;
