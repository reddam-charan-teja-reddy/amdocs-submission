import { NextRequest, NextResponse } from 'next/server';
import connectDb from '@/hooks/db';
import PathManagement from '@/models/PathManagement';

export async function POST(request: Request) {
	try {
		await connectDb();

		const body = await request.json();
		const {
			userId,
			customMsg,
			learningSpeed,
			currentEducation,
			country,
		} = body;

		if (!userId) {
			return NextResponse.json(
				{ error: 'User ID is required' },
				{ status: 400 }
			);
		}

		const pathManagementData = {
			customMsg: customMsg.trim(),
			learningSpeed,
			currentEducation: currentEducation.trim(),
			country: country.trim(),
			updatedAt: new Date().toISOString(),
		};

		await PathManagement.findOneAndUpdate(
			{ userId },
			{ $set: pathManagementData },
			{ upsert: true, new: true }
		);

		return NextResponse.json(pathManagementData);
	} catch (error) {
		console.error('Error updating path management:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
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

		// Find the user's path management document
		let userPath = await PathManagement.findOne({ userId });

		if (!userPath) {
			// Create a new path management document for first-time users with default values
			userPath = new PathManagement({
				userId,
				customMsg: '',
				learningSpeed: 'medium',
				currentEducation: '',
				country: '',
				updatedAt: new Date().toISOString(),
			});
			await userPath.save();
		}

		return NextResponse.json(userPath);
	} catch (error) {
		console.error('Error in GET /api/pathManagement:', error);
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		);
	}
}
