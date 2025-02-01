declare module 'react-rating-stars-component' {
	import { FC } from 'react';

	interface ReactStarsProps {
		count?: number;
		value?: number;
		size?: number;
		edit?: boolean;
		activeColor?: string;
		onChange?: (newRating: number) => void;
	}

	const ReactStars: FC<ReactStarsProps>;
	export default ReactStars;
}
