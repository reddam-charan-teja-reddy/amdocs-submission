'use client';
import { useRouter } from 'next/navigation';
import { Roadmap } from '@/utils/types';
import styles from '@/styles/shared.module.css';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import {
	ArrowRightIcon,
	TrashIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const PathCard = (props: Roadmap) => {
	const router = useRouter();
	const completedMilestones = props.milestones.filter(
		(milestone) => milestone.isCompleted
	).length;
	const totalMilestones = props.milestones.length;
	const progress = Math.round(
		(completedMilestones / totalMilestones) * 100
	);

	const handleDelete = async (e: React.MouseEvent) => {
		e.stopPropagation();
		if (
			window.confirm(
				'Are you sure you want to delete this roadmap?'
			)
		) {
			const deletePromise = fetch(`/api/roadmaps?id=${props.id}`, {
				method: 'DELETE',
			}).then(async (response) => {
				if (!response.ok) {
					throw new Error('Failed to delete roadmap');
				}
				const data = await response.json();
				window.location.reload();
				return data;
			});

			toast.promise(deletePromise, {
				loading: 'Deleting roadmap...',
				success: 'Roadmap deleted successfully!',
				error: (err: Error) =>
					err.message || 'Failed to delete roadmap',
			});
		}
	};

	return (
		<motion.div
			whileHover={{ scale: 1.02 }}
			className={clsx(styles.card, 'relative overflow-hidden')}
			onClick={() => router.push(`/roadmap/${props.id}`)}
		>
			<div className='space-y-4'>
				<div className='flex justify-between items-start'>
					<h2 className='text-xl font-semibold text-gray-900'>
						{props.title}
					</h2>
					<button
						onClick={handleDelete}
						className='p-2 text-gray-500 hover:text-red-600 transition-colors'
						title='Delete roadmap'
					>
						<TrashIcon className='h-5 w-5' />
					</button>
				</div>
				<p className='text-gray-600 text-sm line-clamp-2'>
					{props.goal}
				</p>

				<div className='mt-4'>
					<div className='flex justify-between text-sm text-gray-600 mb-2'>
						<span>Progress</span>
						<span>{progress}%</span>
					</div>
					<div className='w-full bg-gray-200 rounded-full h-2'>
						<motion.div
							initial={{ width: 0 }}
							animate={{ width: `${progress}%` }}
							transition={{ duration: 0.5, ease: 'easeOut' }}
							className='h-full bg-indigo-600 rounded-full'
						/>
					</div>
				</div>

				<div className='flex justify-between items-center mt-6'>
					<div className='space-y-1'>
						<p className='text-sm text-gray-600'>Goals</p>
						<p className='text-sm text-slate-900 font-medium'>
							{completedMilestones} of {totalMilestones}{' '}
							completed
						</p>
					</div>
					<button
						onClick={(e) => {
							e.stopPropagation();
							router.push(`/roadmap/${props.id}`);
						}}
						className={clsx(styles.button, 'group')}
					>
						Resume
						<ArrowRightIcon className='ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform' />
					</button>
				</div>
			</div>
		</motion.div>
	);
};

export default PathCard;
