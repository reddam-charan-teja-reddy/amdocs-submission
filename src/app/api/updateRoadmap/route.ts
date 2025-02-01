import { NextResponse } from 'next/server';
import Roadmap from '@/models/Roadmap';
import connectDb from '@/hooks/db';

export async function PATCH(request: Request) {
	try {
		await connectDb();
		const roadmapData = await request.json();
		const { searchParams } = new URL(request.url);
		const id = searchParams.get('id');

		if (!id) {
			return NextResponse.json(
				{ error: 'Roadmap ID is required' },
				{ status: 400 }
			);
		}

		// Find and update the roadmap
		const updatedRoadmap = await Roadmap.findOneAndUpdate(
			{ id: id },
			roadmapData,
			{ new: true } // Return the updated document
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
