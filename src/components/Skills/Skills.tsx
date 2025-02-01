import {
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	Button,
	useDisclosure,
	Input,
} from '@nextui-org/react';
import { useState, useEffect } from 'react';
import { RootState } from '@/store/store';
import { useSelector, useDispatch } from 'react-redux';
import { setUserSkills } from '@/store/userSkillsSlice';
import styles from '@/styles/shared.module.css';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import Skeleton from 'react-loading-skeleton';
import toast from 'react-hot-toast';

const Skills = () => {
	const dispatch = useDispatch();
	const [newSkill, setNewSkill] = useState<string>('');
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string>('');
	const userSkills = useSelector(
		(state: RootState) => state.userSkills
	);
	const user = useSelector((state: RootState) => state.user);
	const { isOpen, onOpen, onOpenChange } = useDisclosure();

	useEffect(() => {
		const fetchSkills = async () => {
			try {
				setIsLoading(true);
				const res = await fetch(
					`/api/skills?userId=${user.userDetails.uid}`,
					{
						method: 'GET',
						headers: {
							'Content-Type': 'application/json',
						},
					}
				);

				if (!res.ok) {
					throw new Error('Failed to fetch skills');
				}

				const data = await res.json();
				dispatch(
					setUserSkills({
						skills: data.skills,
						userId: user.userDetails.uid,
					})
				);
			} catch (error) {
				console.error('Error fetching skills:', error);
				setError('Failed to fetch skills');
			} finally {
				setIsLoading(false);
			}
		};

		if (user.userDetails?.uid) {
			fetchSkills();
		}
	}, [user.userDetails?.uid, dispatch]);

	const addSkill = async () => {
		const toastId = toast.loading('Adding skill...');
		if (!newSkill.trim()) return;

		try {
			setIsLoading(true);
			const res = await fetch('/api/skills', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					userId: user.userDetails.uid,
					skill: newSkill.trim(),
				}),
			});

			if (!res.ok) {
				throw new Error('Failed to add skill');
			}

			const data = await res.json();
			dispatch(
				setUserSkills({
					skills: data.skills,
					userId: user.userDetails.uid,
				})
			);
			setNewSkill('');
			setError('');
			toast.dismiss(toastId);
			toast.success('Skill added successfully', { id: toastId });
		} catch (error) {
			console.error('Error adding skill:', error);
			setError('Failed to add skill');
			toast.dismiss(toastId);
			toast.error('Failed to add skill', { id: toastId });
		} finally {
			setIsLoading(false);
		}
	};

	const removeSkill = async (skillToRemove: string) => {
		const toastId = toast.loading('Removing skill...');
		try {
			setIsLoading(true);
			const res = await fetch('/api/skills', {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					userId: user.userDetails.uid,
					skill: skillToRemove,
				}),
			});

			if (!res.ok) {
				throw new Error('Failed to remove skill');
			}

			const data = await res.json();
			dispatch(
				setUserSkills({
					skills: data.skills,
					userId: user.userDetails.uid,
				})
			);
			setError('');
			toast.dismiss(toastId);
			toast.success('Skill removed successfully');
		} catch (error) {
			console.error('Error removing skill:', error);
			setError('Failed to remove skill');
			toast.dismiss(toastId);
			toast.error('Failed to remove skill');
		} finally {
			setIsLoading(false);
		}
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			addSkill();
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
				Manage Skills
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
								Manage Skills
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
											value={newSkill}
											onChange={(e) =>
												setNewSkill(e.target.value)
											}
											onKeyPress={handleKeyPress}
											placeholder='Enter a skill'
											disabled={isLoading}
											className={styles.input}
										/>
										<Button
											onPress={addSkill}
											className={styles.button}
											disabled={
												isLoading || !newSkill.trim()
											}
										>
											Add
										</Button>
									</div>

									<div className='mt-6'>
										<h4 className='text-sm font-medium text-gray-900 mb-3'>
											Your Skills
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
													{userSkills.skills.map(
														(skill, index) => (
															<motion.div
																key={skill}
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
																	styles.badgePrimary,
																	'flex items-center gap-1'
																)}
															>
																<span>{skill}</span>
																<button
																	onClick={() =>
																		removeSkill(
																			skill
																		)
																	}
																	className='p-0.5 hover:bg-indigo-200 rounded-full transition-colors'
																	disabled={
																		isLoading
																	}
																	aria-label={`Remove ${skill} skill`}
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

export default Skills;
