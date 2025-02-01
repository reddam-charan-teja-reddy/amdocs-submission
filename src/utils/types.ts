export type PathData = {
	title: string;
	description: string;
	assignedGoals: number;
	completedGoals: number;
	pathCode: string;
};

export type PathsApiResponse = {
	paths: PathData[];
	userId: string;
};

export interface HowTo {
	type: 'resource' | 'course' | 'activity' | 'tool' | 'book';
	description: string;
	link?: string;
}

export interface Milestone {
	title: string;
	outcome: string;
	isCompleted: boolean;
	rating?: number;
	feedback?: string;
	how_to: HowTo[];
}

export interface RoadmapData {
	goal: string;
	milestones: Milestone[];
}

export interface Roadmap {
	id: string;
	userId: string;
	title: string;
	goal: string;
	milestones: Milestone[];
	createdAt: string;
	updatedAt: string;
	progress: number;
}
