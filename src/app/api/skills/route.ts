import connectDb from '@/hooks/db';
import Skills from '@/models/skill';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
	try {
		await connectDb();
		const { userId, skill } = await req.json();

		if (!userId || !skill) {
			return NextResponse.json(
				{ error: 'UserId and skill are required' },
				{ status: 400 }
			);
		}

		// Find or create the user's skills document
		let userSkills = await Skills.findOne({ userId });

		if (!userSkills) {
			userSkills = new Skills({ userId, skills: [] });
		}

		// Use a Set to ensure uniqueness
		const skillSet = new Set(userSkills.skills);
		skillSet.add(skill.trim());

		// Save the updated skills back to the database
		userSkills.skills = Array.from(skillSet);
		await userSkills.save();

		return NextResponse.json({
			message: 'Skill added successfully',
			skills: userSkills.skills,
		});
	} catch (error) {
		console.error('Error in POST /api/skills:', error);
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		);
	}
}

export async function DELETE(req: NextRequest) {
	try {
		await connectDb();
		const { userId, skill } = await req.json();

		if (!userId || !skill) {
			return NextResponse.json(
				{ error: 'UserId and skill are required' },
				{ status: 400 }
			);
		}

		// Find the user's skills document
		const userSkills = await Skills.findOne({ userId });

		if (!userSkills) {
			return NextResponse.json(
				{ error: 'User skills not found' },
				{ status: 404 }
			);
		}

		// Remove the skill from the array
		userSkills.skills = userSkills.skills.filter(
			(s: string) => s !== skill
		);
		await userSkills.save();

		return NextResponse.json({
			message: 'Skill removed successfully',
			skills: userSkills.skills,
		});
	} catch (error) {
		console.error('Error in DELETE /api/skills:', error);
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

		// Find the user's skills document
		let userSkills = await Skills.findOne({ userId });

		if (!userSkills) {
			// Create a new skills document for first-time users
			userSkills = new Skills({ userId, skills: [] });
			await userSkills.save();
		}

		return NextResponse.json({
			skills: userSkills.skills,
		});
	} catch (error) {
		console.error('Error in GET /api/skills:', error);
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		);
	}
}
