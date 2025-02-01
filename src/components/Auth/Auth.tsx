'use client';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setAuthState, setUserDetails } from '@/store/userInfoSlice';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/app/firebase/config';
import { RootState } from '@/store/store';
import { useSelector } from 'react-redux';
import styles from './Auth.module.css';
import { FcGoogle } from 'react-icons/fc';
import toast from 'react-hot-toast';
import {
	FaRoad,
	FaUserGraduate,
	FaCertificate,
	FaUsers,
} from 'react-icons/fa';

const Auth = () => {
	const router = useRouter();
	const dispatch = useDispatch();
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);
	const userData = useSelector((state: RootState) => state.user);

	useEffect(() => {
		if (userData.authState) {
			router.replace('/');
		}
	}, [userData.authState, router]);

	const handleGoogleSignIn = async () => {
		try {
			setLoading(true);
			const provider = new GoogleAuthProvider();
			const res = await signInWithPopup(auth, provider);
			const { user } = res;
			const { displayName, email, photoURL } = user;

			if (!displayName || !email || !photoURL) {
				throw new Error('Missing user details');
			}

			const response = await fetch('/api/userLogin', {
				method: 'POST',
				body: JSON.stringify({
					name: displayName,
					email,
					photoURL,
				}),
				headers: { 'Content-Type': 'application/json' },
			});

			const data = await response.json();
			if (!response.ok) {
				throw new Error(data.error || 'Failed to sign in');
			}

			dispatch(setAuthState(true));
			dispatch(
				setUserDetails({
					uid: data.user._id,
					name: displayName,
					email,
					photoURL,
				})
			);
			toast.success('Successfully signed in!');
		} catch (error) {
			setError('Failed to sign in with Google');
			toast.error('Failed to sign in with Google');
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className={styles.container}>
			<div className={styles.authCard}>
				<h1 className={styles.logo}>PathLearn</h1>
				<p className={styles.tagline}>
					Your personalized learning journey starts here
				</p>
				<h2 className={styles.title}>Welcome Back</h2>

				<button
					className={styles.googleButton}
					onClick={handleGoogleSignIn}
					disabled={loading}
				>
					<FcGoogle size={20} />
					{loading ? 'Signing in...' : 'Continue with Google'}
				</button>

				{error && <p className={styles.error}>{error}</p>}

				<p className={styles.signupText}>
					New to PathLearn?{' '}
					<a href='#' className={styles.signupLink}>
						Learn more below
					</a>
				</p>

				<div className={styles.features}>
					<h3 className={styles.featuresTitle}>
						Why Choose PathLearn?
					</h3>
					<ul className={styles.featuresList}>
						<li className={styles.featureItem}>
							<FaRoad size={20} />
							<span>
								Personalized learning roadmaps tailored to
								your goals and skill level
							</span>
						</li>
						<li className={styles.featureItem}>
							<FaUserGraduate size={20} />
							<span>
								Track your progress and master new skills at
								your own pace
							</span>
						</li>
					</ul>
				</div>
			</div>
		</div>
	);
};

export default Auth;
