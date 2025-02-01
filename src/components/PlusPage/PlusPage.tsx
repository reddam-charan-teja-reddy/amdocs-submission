'use client';

import { useState } from 'react';
import styles from './PlusPage.module.css';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { addRoadmap, setLoading } from '@/store/roadmapsSlice';
import { useRouter } from 'next/navigation';
import { RoadmapData } from '@/utils/types';
import { FiArrowRight, FiLoader } from 'react-icons/fi';
import Navbar from '../Navbar/Navbar';
import toast from 'react-hot-toast';
import {
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	Button,
	useDisclosure,
} from '@nextui-org/react';
import { UserCircleIcon } from '@heroicons/react/24/outline';

const PlusPage = () => {
	const [input, setInput] = useState('');
	const [error, setError] = useState<string | null>(null);
	const { isOpen, onOpen, onClose } = useDisclosure();
	const dispatch = useDispatch();
	const router = useRouter();

	const isLoading = useSelector(
		(state: RootState) => state.roadmaps.loading
	);
	const pathManagementState = useSelector(
		(state: RootState) => state.userPathManagement
	);
	const userInterests = useSelector(
		(state: RootState) => state.userInterests
	);
	const userSkills = useSelector(
		(state: RootState) => state.userSkills
	);
	const user = useSelector(
		(state: RootState) => state.user.userDetails
	);

	const checkUserData = () => {
		const missingData = [];

		if (!userInterests?.interests?.length) {
			missingData.push('interests');
		}
		if (!userSkills?.skills?.length) {
			missingData.push('skills');
		}
		if (
			!pathManagementState?.currentEducation ||
			!pathManagementState?.country
		) {
			missingData.push('path settings');
		}

		if (missingData.length > 0) {
			onOpen();
			return false;
		}
		return true;
	};

	const generateRoadmap = async () => {
		if (!checkUserData()) {
			return;
		}

		console.log('input', input);
		try {
			dispatch(setLoading(true));
			setError(null);

			const loadingToast = toast.loading(
				'Generating your personalized roadmap...'
			);

			// Generate roadmap using AI
			const aiResponse = await fetch('/api/plus', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					query: input,
					interests: userInterests?.interests || [],
					education: pathManagementState?.currentEducation || '',
					country: pathManagementState?.country || '',
					customMsg: pathManagementState?.customMsg || '',
					skills: userSkills?.skills || [],
					learningSpeed:
						pathManagementState?.learningSpeed || 'medium',
				}),
			});

			if (!aiResponse.ok) {
				toast.dismiss(loadingToast);
				throw new Error('Failed to generate roadmap');
			}

			const data: RoadmapData = await aiResponse.json();

			// Create roadmap object
			const newRoadmap = {
				id: Date.now().toString(),
				userId: user.uid,
				title: input,
				goal: data.goal,
				milestones: data.milestones.map((milestone) => ({
					...milestone,
					isCompleted: false,
				})),
				createdAt: new Date().toISOString(),
				progress: 0,
			};

			// Save to database
			const dbResponse = await fetch('/api/roadmaps', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(newRoadmap),
			});

			if (!dbResponse.ok) {
				toast.dismiss(loadingToast);
				throw new Error('Failed to save roadmap');
			}

			const savedRoadmap = await dbResponse.json();

			// Add to Redux store
			dispatch(addRoadmap(savedRoadmap));

			// Clear input and redirect to roadmaps page
			setInput('');
			toast.dismiss(loadingToast);
			toast.success('Roadmap generated successfully! 🎉');
			router.push(`/roadmap/${savedRoadmap.id}`);
		} catch (error) {
			console.error('Error:', error);
			const errorMessage =
				error instanceof Error
					? error.message
					: 'An error occurred';
			setError(errorMessage);
			toast.error(errorMessage);
		} finally {
			dispatch(setLoading(false));
		}
	};

	const handleKeyPress = (
		e: React.KeyboardEvent<HTMLInputElement>
	) => {
		if (e.key === 'Enter' && input.trim() && !isLoading) {
			generateRoadmap();
		}
	};

	return (
		<div className={styles.pageContainer}>
			<Navbar />
			<div className={styles.contentWrapper}>
				<div className={styles.headerSection}>
					<h1 className={styles.title}>
						Create Your Learning Journey
					</h1>
					<p className={styles.subtitle}>
						Tell us what you want to learn and we'll create a
						personalized roadmap just for you.
					</p>
				</div>

				<div className={styles.inputSection}>
					<div className={styles.inputWrapper}>
						<input
							type='text'
							className={styles.input}
							placeholder='What do you want to learn? (e.g., I want to become a Data Scientist)'
							value={input}
							onChange={(e) => setInput(e.target.value)}
							onKeyPress={handleKeyPress}
							disabled={isLoading}
						/>
						<button
							className={styles.generateButton}
							onClick={generateRoadmap}
							disabled={isLoading || !input.trim()}
						>
							{isLoading ? (
								<span className={styles.loadingWrapper}>
									<FiLoader size={20} />
									Generating...
								</span>
							) : (
								<span className={styles.buttonContent}>
									Generate Roadmap
									<FiArrowRight size={20} />
								</span>
							)}
						</button>
					</div>
					{error && (
						<div className={styles.errorMessage}>{error}</div>
					)}
				</div>

				{isLoading && (
					<div className={styles.loadingSection}>
						<div className={styles.loadingCard}>
							<FiLoader size={32} />
							<p>
								Creating your personalized learning roadmap...
							</p>
							<p className={styles.loadingSubtext}>
								This may take a minute
							</p>
						</div>
					</div>
				)}

				<div className={styles.featuresSection}>
					<div className={styles.featureCard}>
						<h3>Personalized Learning Path</h3>
						<p>
							Get a customized roadmap based on your goals and
							interests
						</p>
					</div>
					<div className={styles.featureCard}>
						<h3>Structured Milestones</h3>
						<p>
							Break down your learning journey into achievable
							steps
						</p>
					</div>
					<div className={styles.featureCard}>
						<h3>Curated Resources</h3>
						<p>
							Access hand-picked courses and materials from
							trusted sources
						</p>
					</div>
				</div>
			</div>

			<Modal
				isOpen={isOpen}
				onClose={onClose}
				className={styles.modalContent}
			>
				<ModalContent>
					<ModalHeader className='flex flex-col gap-1'>
						Complete Your Profile
					</ModalHeader>
					<ModalBody className='py-4'>
						<div className='text-center space-y-4'>
							<UserCircleIcon className='h-16 w-16 mx-auto text-indigo-500' />
							<p className='text-gray-600'>
								To create a personalized roadmap, we need more
								information about you. Please visit your
								profile to set up your:
							</p>
							<ul className='text-left list-disc list-inside text-gray-600'>
								{!userInterests?.interests?.length && (
									<li>Interests</li>
								)}
								{!userSkills?.skills?.length && (
									<li>Skills</li>
								)}
								{(!pathManagementState?.currentEducation ||
									!pathManagementState?.country) && (
									<li>
										Path Settings (Education & Country)
									</li>
								)}
							</ul>
							<p className='text-sm text-gray-500 mt-4'>
								This helps us create a more personalized
								learning experience for you.
							</p>
						</div>
						<div className='flex justify-end gap-2 mt-4'>
							<Button
								color='danger'
								variant='light'
								onPress={onClose}
							>
								Close
							</Button>
							<Button
								color='primary'
								onPress={onClose}
								className={styles.button}
							>
								Got it
							</Button>
						</div>
					</ModalBody>
				</ModalContent>
			</Modal>
		</div>
	);
};

export default PlusPage;
