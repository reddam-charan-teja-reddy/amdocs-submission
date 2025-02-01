'use client';
import { motion } from 'framer-motion';

interface PathProps {
	start: { x: number; y: number };
	end: { x: number; y: number };
	isCompleted: boolean;
}

const RoadMapPath = ({ start, end, isCompleted }: PathProps) => {
	const midY = (start.y + end.y) / 2;
	const path = `M ${start.x} ${start.y} 
                C ${start.x} ${midY}, 
                  ${end.x} ${midY}, 
                  ${end.x} ${end.y}`;

	return (
		<motion.path
			d={path}
			initial={{ pathLength: 0 }}
			animate={{ pathLength: 1 }}
			transition={{ duration: 0.5, ease: 'easeInOut' }}
			stroke={isCompleted ? '#10B981' : '#4f9df0'}
			strokeWidth='12'
			fill='none'
			strokeLinecap='round'
			className='drop-shadow-lg'
			strokeDasharray='8 4'
		/>
	);
};

export default RoadMapPath;
