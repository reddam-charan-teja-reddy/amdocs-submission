'use client';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { useState, useEffect } from 'react';
import CourseCard from '../PathCard/PathCard';
import { RootState } from '@/store/store';
import Navbar from '@/components/Navbar/Navbar';
import styles from '@/styles/shared.module.css';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { setRoadmaps } from '@/store/roadmapsSlice';
import { Roadmap } from '@/utils/types';

const HomePage = () => {
	const dispatch = useDispatch();
	const [error, setError] = useState<string>('');
	const [isLoading, setIsLoading] = useState(true);
	const userData = useSelector((state: RootState) => state.user);
	const roadmaps = useSelector(
		(state: RootState) => state.roadmaps.roadmaps
	);
	const router = useRouter();

	useEffect(() => {
		if (!userData.authState) {
			router.replace('/login');
		}
	}, [userData.authState]);

	useEffect(() => {
		const fetchCourses = async () => {
			if (!userData.authState) {
				setError('User not authenticated');

				return;
			}

			try {
				setIsLoading(true);
				const response = await fetch(
					`/api/roadmaps?userId=${userData.userDetails.uid}`
				);
				if (!response.ok) {
					throw new Error('Failed to fetch roadmaps');
				}
				const roadmapsData: Roadmap[] = await response.json();
				dispatch(setRoadmaps(roadmapsData));
			} catch (err) {
				setError('Failed to fetch roadmaps');
			} finally {
				setIsLoading(false);
			}
		};

		fetchCourses();
	}, [userData.userDetails?.uid]);

	const renderContent = () => {
		if (error) {
			return (
				<div className='text-center py-12'>
					<ExclamationCircleIcon className='mx-auto h-12 w-12 text-red-500' />
					<h3 className='mt-2 text-sm font-semibold text-gray-900'>
						Error
					</h3>
					<p className='mt-1 text-sm text-gray-500'>{error}</p>
					<button
						onClick={() => window.location.reload()}
						className={clsx(styles.button, 'mt-6')}
					>
						Try again
					</button>
				</div>
			);
		}

		if (isLoading) {
			return (
				<div className={styles.gridLayout}>
					{[...Array(6)].map((_, index) => (
						<div key={index} className={styles.card}>
							<Skeleton
								height={24}
								width='60%'
								className='mb-4'
							/>
							<Skeleton count={2} className='mb-4' />
							<Skeleton
								height={8}
								width='100%'
								className='mb-2'
							/>
							<div className='flex justify-between items-center mt-4'>
								<Skeleton width={100} />
								<Skeleton width={80} height={36} />
							</div>
						</div>
					))}
				</div>
			);
		}

		if (roadmaps.length === 0) {
			return (
				<div className='text-center py-12'>
					<h3 className='mt-2 text-xl font-semibold text-gray-900'>
						Welcome to Your Learning Journey!
					</h3>
					<p className='mt-4 text-md text-gray-600 max-w-2xl mx-auto'>
						This is where your learning paths will appear. As a
						new user, you can get started by creating your first
						personalized learning path.
					</p>
					<p className='mt-2 text-sm text-gray-500 max-w-2xl mx-auto'>
						Our AI will help you create a customized roadmap
						based on your goals and interests.
					</p>
					<button
						onClick={() => router.push('/plus')}
						className={clsx(styles.button, 'mt-8')}
					>
						Create Your First Learning Path
					</button>
				</div>
			);
		}

		return (
			<div className={styles.gridLayout}>
				{roadmaps.map((roadmap: Roadmap, index: number) => (
					<CourseCard
						key={`${roadmap.id}-${index}`}
						{...roadmap}
					/>
				))}
			</div>
		);
	};

	return (
		<div className='min-h-screen mt-16 bg-gray-50'>
			<Navbar />
			<div className='pt-4 pb-24 sm:pt-16 sm:pb-0'>
				<div className={styles.container}>{renderContent()}</div>
			</div>
		</div>
	);
};

export default HomePage;
