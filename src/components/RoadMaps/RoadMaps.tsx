'use client';
import { useState, useEffect, useRef } from 'react';
import styles from './RoadMaps.module.css';
import { useParams } from 'next/navigation';
import {
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
} from '@nextui-org/react';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';
import {
	CheckCircleIcon,
	BookOpenIcon,
	AcademicCapIcon,
	PlayIcon,
	WrenchIcon,
} from '@heroicons/react/24/outline';
import { useMediaQuery } from 'react-responsive';
import { Milestone } from '@/utils/types';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { setRoadmaps } from '@/store/roadmapsSlice';
import {
	setCurrentRoadmap,
	setLoading,
	setError,
} from '@/store/currentRoadmapSlice';
import RoadMapPath from './RoadMapPath';
import Navbar from '@/components/Navbar/Navbar';
import { Tooltip } from 'react-tooltip';
import toast from 'react-hot-toast';

const RoadMaps = () => {
	const params = useParams();
	const dispatch = useDispatch();
	const roadmaps = useSelector(
		(state: RootState) => state.roadmaps.roadmaps
	);
	const { roadmap, loading } = useSelector(
		(state: RootState) => state.currentRoadmap
	);
	const [showConfetti, setShowConfetti] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const mq = useMediaQuery({ maxWidth: 768 });
	const [selectedMilestone, setSelectedMilestone] = useState<{
		milestone: Milestone;
		index: number;
	} | null>(null);
	const [feedbackMode, setFeedbackMode] = useState<'modify' | null>(
		null
	);
	const [feedbackData, setFeedbackData] = useState({
		suggestedChanges: '',
	});
	const [milestonePositions, setMilestonePositions] = useState<
		{ x: number; y: number }[]
	>([]);
	const containerRef = useRef<HTMLDivElement>(null);
	const [showCompletionModal, setShowCompletionModal] =
		useState(false);

	useEffect(() => {
		if (params.id && roadmaps.length > 0) {
			const currentRoadmap = roadmaps.find(
				(r) => r.id === params.id
			);
			if (currentRoadmap) {
				dispatch(setCurrentRoadmap(currentRoadmap));
			}
			dispatch(setLoading(false));
		}
	}, [params.id, roadmaps, dispatch]);

	useEffect(() => {
		if (roadmap && containerRef.current) {
			calculateMilestonePositions(roadmap.milestones.length);
		}
	}, [roadmap, containerRef.current]);

	useEffect(() => {
		if (roadmap) {
			const allCompleted = roadmap.milestones.every(
				(m) => m.isCompleted
			);
			if (allCompleted) {
				setShowCompletionModal(true);
			}
		}
	}, [roadmap]);

	const calculateMilestonePositions = (count: number) => {
		if (!containerRef.current) return;

		const containerWidth = containerRef.current.offsetWidth;
		const containerHeight = Math.max(
			800,
			containerRef.current.offsetHeight
		);
		const positions = [];
		const centerX = containerWidth / 2;
		const verticalSpacing = Math.min(
			120,
			containerHeight / (count + 1)
		);

		// Modified horizontal offset calculation
		const horizontalOffset = mq
			? Math.min(40, containerWidth / 5) // Reduced offset for mobile
			: Math.min(200, containerWidth / 4);

		for (let i = 0; i < count; i++) {
			const y = verticalSpacing * (i + 1);
			// Center-aligned for mobile
			const x = mq
				? centerX
				: centerX +
				  (i % 2 === 0 ? -horizontalOffset : horizontalOffset);
			positions.push({ x, y });
		}

		setMilestonePositions(positions);
	};
	const calculateProgress = () => {
		if (!roadmap) return 0;
		const completed = roadmap.milestones.filter(
			(m) => m.isCompleted
		).length;
		return (completed / roadmap.milestones.length) * 100;
	};

	const findUrls = (text: string): string[] => {
		const urlRegex = /(https?:\/\/[^\s]+)/g;
		return text.match(urlRegex) || [];
	};

	const renderTextWithUrls = (text: string) => {
		const urls = findUrls(text);
		if (urls.length === 0) return <p>{text}</p>;

		let result = text;
		urls.forEach((url) => {
			result = result.replace(
				url,
				`<span class="${styles.urlText}"><a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a></span>`
			);
		});

		return (
			<p
				className='text-blue-900'
				dangerouslySetInnerHTML={{ __html: result }}
			/>
		);
	};

	const handleComplete = async (milestoneIndex: number) => {
		if (!roadmap) return;

		const updatedRoadmap = {
			...roadmap,
			milestones: roadmap.milestones.map((milestone, index) => {
				if (index === milestoneIndex) {
					return {
						...milestone,
						isCompleted: true,
					};
				}
				return { ...milestone };
			}),
		};

		try {
			const response = await fetch(
				`/api/updateRoadmap?id=${params.id}`,
				{
					method: 'PATCH',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(updatedRoadmap),
				}
			);

			if (!response.ok)
				throw new Error('Failed to update roadmap');

			dispatch(setCurrentRoadmap(updatedRoadmap));
			const updatedRoadmaps = roadmaps.map((r) =>
				r.id === updatedRoadmap.id ? updatedRoadmap : r
			);
			dispatch(setRoadmaps(updatedRoadmaps));
			setShowConfetti(true);
			toast.success('Milestone completed! 🎉');
			setTimeout(() => setShowConfetti(false), 3000);
		} catch (error) {
			console.error('Error updating roadmap:', error);
			dispatch(setError('Failed to update roadmap'));
			toast.error('Failed to complete milestone');
		}
	};

	const handleFeedbackSubmit = async () => {
		if (!selectedMilestone || !roadmap) return;

		// Store the loading toast ID
		const loadingToast = toast.loading(
			'Updating roadmap based on your feedback...'
		);

		try {
			if (feedbackMode === 'modify') {
				const userData = {
					skills: [], // Add your skills data here
					interests: [], // Add your interests data here
					education: '', // Add education data
					country: '', // Add country data
					learningSpeed: '', // Add learning speed data
				};

				// Prepare data for AI update
				const aiUpdateData = {
					currentRoadmap: roadmap,
					completedMilestones: roadmap.milestones.filter(
						(m) => m.isCompleted
					),
					feedback: feedbackData.suggestedChanges,
					userData: userData,
					milestoneIndex: selectedMilestone.index,
					learningSpeed: 'medium', // Add learning speed data
				};

				// Call AI endpoint to get updated roadmap
				const aiResponse = await fetch('/api/plus', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(aiUpdateData),
				});

				if (!aiResponse.ok)
					throw new Error('Failed to get AI suggestions');

				const newRoadmapData = await aiResponse.json();
				console.log(newRoadmapData);

				const updatedRoadmap = newRoadmapData;

				// Update in database
				const updateResponse = await fetch(
					`/api/updateRoadmap?id=${params.id}`,
					{
						method: 'PATCH',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify(updatedRoadmap),
					}
				);

				if (!updateResponse.ok)
					throw new Error('Failed to update roadmap');

				// Update store
				dispatch(setCurrentRoadmap(updatedRoadmap));
				const updatedRoadmaps = roadmaps.map((r) =>
					r.id === updatedRoadmap.id ? updatedRoadmap : r
				);
				dispatch(setRoadmaps(updatedRoadmaps));
				// Dismiss loading toast before showing success
				toast.dismiss(loadingToast);
				toast.success(
					'Roadmap updated successfully based on your feedback!'
				);
			}

			// Reset states
			setFeedbackMode(null);
			setFeedbackData({
				suggestedChanges: '',
			});
			setSelectedMilestone(null);
			setIsModalOpen(false);
		} catch (error) {
			console.error('Error:', error);
			// Dismiss loading toast before showing error
			toast.dismiss(loadingToast);
			toast.error(
				'Failed to update roadmap based on your feedback'
			);
		}
	};

	const getIconForType = (type: string) => {
		switch (type.toLowerCase()) {
			case 'resource':
				return <BookOpenIcon className='h-6 w-6 text-blue-500' />;
			case 'course':
				return (
					<AcademicCapIcon className='h-6 w-6 text-purple-500' />
				);
			case 'activity':
				return <PlayIcon className='h-6 w-6 text-green-500' />;
			case 'book':
				return (
					<BookOpenIcon className='h-6 w-6 text-orange-500' />
				);
			case 'tool':
				return <WrenchIcon className='h-6 w-6 text-gray-500' />;
			default:
				return <BookOpenIcon className='h-6 w-6 text-blue-500' />;
		}
	};

	const handleCreateNewPath = () => {
		window.location.href = '/plus';
	};

	if (loading) {
		return (
			<div className='flex justify-center items-center h-screen'>
				Loading...
			</div>
		);
	}

	if (!roadmap) {
		return (
			<div className='flex justify-center items-center h-screen'>
				Roadmap not found
			</div>
		);
	}

	return (
		<div
			className={`min-h-screen bg-gray-50 ${styles.pageContainer}`}
		>
			<Navbar />
			<div className={`mx-auto px-4 py-8`}>
				<h1 className='text-4xl font-bold text-center mb-12 text-indigo-900'>
					{roadmap.goal}
				</h1>

				{/* Progress Bar */}
				<div className='w-full bg-gray-200 rounded-full h-2.5 mb-8'>
					<div
						className='bg-green-500 h-2.5 rounded-full'
						style={{ width: `${calculateProgress()}%` }}
					></div>
				</div>

				<div
					ref={containerRef}
					className='relative w-full min-h-[800px] justify-center items-center'
				>
					<svg className='absolute w-full h-full'>
						{milestonePositions.map((pos, idx) => {
							if (idx < milestonePositions.length - 1) {
								return (
									<RoadMapPath
										key={`path-${idx}`}
										start={pos}
										end={milestonePositions[idx + 1]}
										isCompleted={
											roadmap.milestones[idx].isCompleted
										}
									/>
								);
							}
							return null;
						})}
					</svg>

					{roadmap.milestones.map((milestone, index) => (
						<motion.div
							key={index}
							style={{
								left: `${milestonePositions[index]?.x}px`,
								top: `${milestonePositions[index]?.y}px`,
								transform: 'translate( -50%)',
							}}
							className={`flex flex-col items-center justify-center p-4 sm:mb-24 rounded-lg shadow-lg ${
								milestone.isCompleted
									? 'bg-green-100'
									: 'bg-white'
							} ${
								milestone.isCompleted
									? 'border-2 border-green-300'
									: 'border-2 border-blue-300'
							} cursor-pointer absolute transition-all duration-300 hover:shadow-xl`}
							onClick={() => {
								setSelectedMilestone({ milestone, index });
								setIsModalOpen(true);
							}}
							data-tooltip-id={`milestone-tooltip-${index}`}
							data-tooltip-content={milestone.outcome}
						>
							<div className='flex items-center gap-2 '>
								{getIconForType(milestone.how_to[0].type)}
								<span className='text-sm font-medium text-blue-900 text-center'>
									{milestone.title}
								</span>
							</div>
							{milestone.isCompleted && (
								<CheckCircleIcon className='mt-2 h-6 w-6 text-green-500' />
							)}
							<Tooltip
								id={`milestone-tooltip-${index}`}
								place='top'
							/>
						</motion.div>
					))}
				</div>

				<Modal
					isOpen={isModalOpen}
					onClose={() => {
						setIsModalOpen(false);
						window.location.reload();
					}}
					scrollBehavior='inside'
					size='2xl'
				>
					<ModalContent>
						{(onClose) => (
							<>
								{selectedMilestone && (
									<>
										<ModalHeader className='flex items-center gap-2 text-blue-900 text-2xl font-bold'>
											{getIconForType(
												selectedMilestone.milestone
													.how_to[0].type
											)}
											{selectedMilestone.milestone.title}
										</ModalHeader>
										<ModalBody className='space-y-6'>
											<div className='bg-indigo-50 text-blue-900 p-4 rounded-lg mb-6'>
												{renderTextWithUrls(
													selectedMilestone.milestone
														.outcome
												)}
											</div>

											<div className='space-y-4'>
												{selectedMilestone.milestone.how_to.map(
													(item, idx) => (
														<div
															key={idx}
															className='flex items-start space-x-4 p-4 bg-gray-200 rounded-lg'
														>
															<div className='flex-1'>
																<div className='flex items-center gap-2 mb-2'>
																	{getIconForType(
																		item.type
																	)}
																	<span className='font-medium text-blue-900 capitalize'>
																		{item.type}
																	</span>
																</div>
																<p className='text-gray-700 mb-2'>
																	{item.description}
																</p>
																{item.link && (
																	<a
																		href={item.link}
																		target='_blank'
																		rel='noopener noreferrer'
																		className='inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors'
																	>
																		Visit Resource
																	</a>
																)}
															</div>
														</div>
													)
												)}
											</div>

											{!selectedMilestone.milestone
												.isCompleted && (
												<div className='mt-6 flex justify-end space-x-4 pb-10'>
													<button
														onClick={() =>
															handleComplete(
																selectedMilestone.index
															)
														}
														className='bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 transition-colors flex items-center'
													>
														<CheckCircleIcon className='h-5 w-5 mr-2' />
														Mark as Complete
													</button>
													<button
														onClick={() =>
															setFeedbackMode('modify')
														}
														className='bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition-colors'
													>
														Modify Roadmap
													</button>
												</div>
											)}

											{/* Feedback Modal Content */}
											{feedbackMode && (
												<div className='mt-6 space-y-4'>
													<h3 className='text-lg font-semibold text-gray-900'>
														Modify Roadmap
													</h3>

													<div className='space-y-2'>
														<label className='block text-sm font-medium text-gray-700'>
															Suggested Changes
														</label>
														<textarea
															value={
																feedbackData.suggestedChanges
															}
															onChange={(e) =>
																setFeedbackData(
																	(prev) => ({
																		...prev,
																		suggestedChanges:
																			e.target
																				.value,
																	})
																)
															}
															className='w-full text-dark text-gray-600 p-2 border rounded-md'
															rows={4}
															placeholder='Describe what changes you would like to see in the roadmap...'
														/>
													</div>

													<div className='flex justify-end space-x-4'>
														<button
															onClick={() => {
																setFeedbackMode(null);
																setFeedbackData({
																	suggestedChanges:
																		'',
																});
															}}
															className='px-4 py-2 text-gray-600 hover:text-gray-800'
														>
															Cancel
														</button>
														<button
															onClick={
																handleFeedbackSubmit
															}
															className='px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600'
														>
															Submit
														</button>
													</div>
												</div>
											)}
										</ModalBody>
									</>
								)}
							</>
						)}
					</ModalContent>
				</Modal>

				{/* Completion Modal */}
				<Modal
					isOpen={showCompletionModal}
					onClose={() => setShowCompletionModal(false)}
					size='lg'
				>
					<ModalContent>
						{(onClose) => (
							<>
								<ModalHeader className='flex flex-col gap-1'>
									<div className='text-2xl font-bold text-green-600 flex items-center gap-2'>
										<CheckCircleIcon className='h-8 w-8' />
										Congratulations!
									</div>
								</ModalHeader>
								<ModalBody className='py-6'>
									<div className='space-y-6'>
										<p className='text-gray-700'>
											You've completed all milestones in
											this learning path! Would you like
											to:
										</p>
										<div className='space-y-4'>
											<button
												onClick={handleCreateNewPath}
												className='w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2'
											>
												<PlayIcon className='h-5 w-5' />
												Create a New Learning Path
											</button>
											<div className='p-4 bg-gray-100 rounded-lg'>
												<p className='text-sm text-gray-600'>
													💡 <strong>Pro Tip:</strong>{' '}
													Consider updating your profile
													interests and skills to align
													with your new learning goals.
													This will help us provide
													better personalized path
													recommendations.
												</p>
											</div>
										</div>
									</div>
								</ModalBody>
							</>
						)}
					</ModalContent>
				</Modal>

				{showConfetti && <Confetti />}
			</div>
		</div>
	);
};

export default RoadMaps;
