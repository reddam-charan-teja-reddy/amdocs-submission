import { NextResponse } from 'next/server';
import Roadmap from '@/models/Roadmap';
import connectDb from '@/hooks/db';

export async function POST(request: Request) {
	try {
		await connectDb();
		const roadmapData = await request.json();

		const roadmap = new Roadmap(roadmapData);
		const savedRoadmap = await roadmap.save();

		return NextResponse.json(savedRoadmap);
	} catch (error) {
		console.error('Error saving roadmap:', error);
		return NextResponse.json(
			{ error: 'Failed to save roadmap' },
			{ status: 500 }
		);
	}
}

export async function GET(request: Request) {
	try {
		await connectDb();
		const { searchParams } = new URL(request.url);
		const userId = searchParams.get('userId');

		if (!userId) {
			return NextResponse.json(
				{ error: 'User ID is required' },
				{ status: 400 }
			);
		}

		const roadmaps = await Roadmap.find({ userId });

		// Return empty array if no roadmaps found (first-time user)
		if (!roadmaps || roadmaps.length === 0) {
			return NextResponse.json([]);
		}

		return NextResponse.json(roadmaps);
	} catch (error) {
		console.error('Error fetching roadmaps:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch roadmaps' },
			{ status: 500 }
		);
	}
}

export async function PUT(request: Request) {
	try {
		await connectDb();
		const roadmapData = await request.json();
		const { id } = roadmapData;

		const updatedRoadmap = await Roadmap.findOneAndUpdate(
			{ id },
			roadmapData,
			{
				new: true,
			}
		);

		if (!updatedRoadmap) {
			return NextResponse.json(
				{ error: 'Roadmap not found' },
				{ status: 404 }
			);
		}

		return NextResponse.json(updatedRoadmap);
	} catch (error) {
		console.error('Error updating roadmap:', error);
		return NextResponse.json(
			{ error: 'Failed to update roadmap' },
			{ status: 500 }
		);
	}
}

export async function DELETE(request: Request) {
	try {
		await connectDb();
		const { searchParams } = new URL(request.url);
		const id = searchParams.get('id');

		if (!id) {
			return NextResponse.json(
				{ error: 'Roadmap ID is required' },
				{ status: 400 }
			);
		}

		const deletedRoadmap = await Roadmap.findOneAndDelete({ id });

		if (!deletedRoadmap) {
			return NextResponse.json(
				{ error: 'Roadmap not found' },
				{ status: 404 }
			);
		}

		return NextResponse.json({
			message: 'Roadmap deleted successfully',
		});
	} catch (error) {
		console.error('Error deleting roadmap:', error);
		return NextResponse.json(
			{ error: 'Failed to delete roadmap' },
			{ status: 500 }
		);
	}
}
