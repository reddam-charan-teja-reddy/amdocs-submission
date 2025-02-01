'use client';

import PlusPage from '@/components/PlusPage/PlusPage';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Plus() {
	const router = useRouter();
	const user = useSelector((state: RootState) => state.user);

	useEffect(() => {
		if (!user.authState) {
			router.push('/login');
		}
	}, [user.authState, router]);

	if (!user.authState) {
		return null;
	}

	return <PlusPage />;
}
