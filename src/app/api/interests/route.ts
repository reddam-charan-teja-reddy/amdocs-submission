// app/api/interests/route.ts
import connectDb from '@/hooks/db';
import Interests from '@/models/interest';
import { NextRequest, NextResponse } from 'next/server';
export async function POST(req: NextRequest) {
	try {
		await connectDb();
		const { userId, interest } = await req.json();

		if (!userId || !interest) {
			return NextResponse.json(
				{ error: 'UserId and interest are required' },
				{ status: 400 }
			);
		}

		// Find or create the user's interests document
		let userInterests = await Interests.findOne({ userId });

		if (!userInterests) {
			userInterests = new Interests({ userId, interests: [] });
		}

		// Use a Set to ensure uniqueness
		const interestSet = new Set(userInterests.interests);
		interestSet.add(interest.trim());

		// Save the updated interests back to the database
		userInterests.interests = Array.from(interestSet);
		await userInterests.save();

		return NextResponse.json({
			message: 'Interest added successfully',
			interests: userInterests.interests,
		});
	} catch (error) {
		console.error('Error in POST /api/interests:', error);
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		);
	}
}

export async function GET(req: NextRequest) {
	try {
		await connectDb();
		const searchParams = new URL(req.url).searchParams;
		const userId = searchParams.get('userId');

		if (!userId) {
			return NextResponse.json(
				{ error: 'UserId is required' },
				{ status: 400 }
			);
		}

		// Retrieve the user's interests document
		let userInterests = await Interests.findOne({ userId });

		if (!userInterests) {
			// Create a new interests document for first-time users
			userInterests = new Interests({ userId, interests: [] });
			await userInterests.save();
		}

		return NextResponse.json({
			interests: userInterests.interests,
		});
	} catch (error) {
		console.error('Error in GET /api/interests:', error);
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		);
	}
}

export async function DELETE(req: NextRequest) {
	try {
		await connectDb();
		const { userId, interest } = await req.json();

		if (!userId || !interest) {
			return NextResponse.json(
				{ error: 'UserId and interest are required' },
				{ status: 400 }
			);
		}

		// Find the user's interests document
		const userInterests = await Interests.findOne({ userId });

		if (!userInterests) {
			return NextResponse.json(
				{ error: 'User interests not found' },
				{ status: 404 }
			);
		}

		// Remove the interest from the array
		userInterests.interests = userInterests.interests.filter(
			(i: string) => i !== interest
		);
		await userInterests.save();

		return NextResponse.json({
			message: 'Interest removed successfully',
			interests: userInterests.interests,
		});
	} catch (error) {
		console.error('Error in DELETE /api/interests:', error);
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		);
	}
}
