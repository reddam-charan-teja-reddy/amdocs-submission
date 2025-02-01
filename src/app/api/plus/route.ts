import { NextResponse } from 'next/server';
import {
	HarmBlockThreshold,
	HarmCategory,
	VertexAI,
} from '@google-cloud/vertexai';
import { HowTo, Milestone } from '@/utils/types';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AzureKeyCredential } from '@azure/core-auth';
import Client from '@azure-rest/ai-inference';

export async function POST(request: Request) {
	try {
		if (!process.env.GOOGLE_API_KEY) {
			return NextResponse.json(
				{ error: 'GOOGLE_API_KEY is not set' },
				{ status: 500 }
			);
		}
		const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

		const model = 'gemini-1.5-flash-002';

		// Instantiate the model
		const generativeModel = genAI.getGenerativeModel({
			model: model,
			generationConfig: {
				maxOutputTokens: 8192,
				temperature: 2,
				topP: 0.95,
			},
			safetySettings: [
				{
					category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
					threshold: HarmBlockThreshold.BLOCK_NONE,
				},
				{
					category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
					threshold: HarmBlockThreshold.BLOCK_NONE,
				},
				{
					category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
					threshold: HarmBlockThreshold.BLOCK_NONE,
				},
				{
					category: HarmCategory.HARM_CATEGORY_HARASSMENT,
					threshold: HarmBlockThreshold.BLOCK_NONE,
				},
			],
		});

		const requestData = await request.json();

		// Handle both new roadmap generation and roadmap modification
		if (requestData.currentRoadmap) {
			// This is a modification request
			const {
				currentRoadmap,
				completedMilestones,
				feedback,
				userData,
				milestoneIndex,
			} = requestData;

			const prompt = {
				text: `You are a personalized roadmap modifier. Your task is to update an existing roadmap based on user feedback while preserving completed milestones. The modification should focus on improving the roadmap based on the user's feedback while maintaining the overall goal and structure.

Current Roadmap: ${JSON.stringify(currentRoadmap)}
Completed Milestones: ${JSON.stringify(completedMilestones)}
User Feedback: ${feedback}
User Context:
- Skills: ${JSON.stringify(userData.skills)}
- Interests: ${JSON.stringify(userData.interests)}
- Education: ${userData.education}
- Country: ${userData.country}
- Learning Speed: ${userData.learningSpeed}
Milestone to Modify: ${milestoneIndex}

Please provide an updated version of the roadmap that:
1. Keeps all completed milestones exactly as they are refer the isCompleted field
2.Use high-quality, up-to-date, and relevant resources.
3. Avoid generic advice or instructions to "search for resources."
4. provide working links only
5. Modifies the remaining milestones based on the user's feedback by understanding it and making the best possible changes
6. Ensures the modifications align with the user's skills and interests
7. Maintains the same JSON structure as the original roadmap
8. Output the modified roadmap in the same JSON format as the input roadmap.
9. provide only the JSON output, no other text or comments.
10. examples of good link:https://www.hackerrank.com/ examples of bad link:https://www.hackerrank.com/%20(and%20https://www.codewars.com/)`,
			};

			const req = {
				contents: [{ role: 'user', parts: [prompt] }],
			};

			const response = await generativeModel.generateContent(req);
			const result = await response.response;

			if (!result.candidates?.[0]?.content?.parts?.[0]?.text) {
				return NextResponse.json({}, { status: 400 });
			}

			const rawText = result.candidates[0].content.parts[0].text;
			const cleanText = rawText
				.replace(/```json|```/g, '')
				.trim()
				.replace(/\n\s*The URL.*$/, '');
			console.log(cleanText);

			try {
				const modifiedRoadmap = JSON.parse(cleanText);
				return NextResponse.json(modifiedRoadmap);
			} catch (error) {
				console.error('Error parsing JSON:', error);
				return NextResponse.json(
					{ error: 'Failed to parse roadmap data' },
					{ status: 500 }
				);
			}
		} else {
			// This is a new roadmap generation request
			const {
				query,
				interests,
				education,
				country,
				customMsg,
				skills,
				learningSpeed,
			} = requestData;
			console.log(query);

			const prompt = {
				text: `You are a personalized roadmap generator. 
				Your task is to create a detailed and actionable JSON roadmap 
				for users based on their goals, skills, interests, education, 
				country, and any additional custom messages. The roadmap should break down the user's goal into 
				smaller, achievable milestones, with clear outcomes and actionable steps. Each milestone should 
				include high-quality resources, such as courses, books, tools,
				 or activities or certifications, with direct links whenever possible.
**Output Format:**
The JSON output must be valid and follow this structure:

json response schema:
{  
  "goal": "User's Goal",  
  "milestones": [  
    {  
      "title": "Milestone Title",  
      "outcome": "Achievable Outcome (Specific and Measurable)",  
      "how_to": [  
        {  
          "type": "course/resource/activity/tool",  
          "description": "Description with platform/company name (e.g., 'Autodesk Certified Training', 'Coursera Course by Stanford')",  
          "link": "Direct link to resource (official, reputable, and region-agnostic)"  
        },  
        ...  
      ]  
    },  
    ...  
  ]  
}  
Instructions:
Understand the User's Context:
Analyze the user's goal, skills, interests, education, country, and custom message.
Tailor the roadmap to the user's background and preferences.
Break Down the Goal:
Divide the user's goal into smaller, logical, and achievable milestones.
Ensure milestones are ordered sequentially, with each one building on the previous.
Provide Actionable Steps:
For each milestone, define a clear and measurable outcome.
Include a list of resources and activities under "how_to." Each item in "how_to" should have:
A "type" (e.g., course, resource, activity, tool).
A "description" explaining what the resource/activity is and how it helps.
A "link" to the resource (if applicable). Use reputable and direct links.
Resource Selection:
Reputable Sources Only: Prioritize links from:
Learning Platforms: Coursera, edX, LinkedIn Learning.
don't use udemy
examples of good link:https://www.hackerrank.com/
examples of bad link:https://www.hackerrank.com/%20(and%20https://www.codewars.com/)
Industry Leaders: Autodesk (CAD), Siemens (engineering),
 Adobe (design), AWS/Microsoft/Google (tech), ASME/IEEE (standards), WHO/CDC (healthcare).
Certifications: Platform-specific certifications (e.g., AWS Certified, Autodesk Certified Professional).
Free Tools & Trials: Fusion 360, FreeCAD, Google Cloud Free Tier, Adobe Creative Cloud Trials.
Avoid Generic Advice: Never use phrases like “search for courses” or placeholder links.
Domain-Specific Customization:
Tech/CS: Link to coding platforms (Codecademy, freeCodeCamp), GitHub repos, or official docs
 (React.js, Python.org).
Engineering/CAD: Use Autodesk, SolidWorks, GrabCAD, or NPTEL (India).
Healthcare: Include WHO guidelines, Coursera medical courses (Johns Hopkins), or AMA resources.
Design/Arts: Link to Adobe Tutorials, Skillshare classes, or Behance projects.
Business/Finance: Use LinkedIn Learning, CFA Institute, or Harvard Business School Online.
Geographic Relevance:
Localized Resources: Add country-specific platforms (e.g., openSAP for Germany, upGrad for India).
Language Support: If user's country prefers non-English resources, prioritize localized content
 (e.g., Coursera en Español).
Learning Speed Adaptation:
Fast Learners: Recommend intensive programs (Coursera Specializations, bootcamps).
Slow Learners: Suggest self-paced courses (Udemy, YouTube playlists) or books.
Project-Based Milestones:
Include hands-on activities with links to project templates (GitHub, GrabCAD) or competitions
 (Kaggle, Instructables).
Validation Rules:
Links Must Be:
Direct (no redirects).
Region-agnostic or tailored to the user's country.

User Input:
Goal: ${query}
Skills: ${skills}
Interests: ${interests}
Education: ${education}
Country: ${country}
Custom Message: ${customMsg}
learning speed: ${learningSpeed}
`,
			};

			const req = {
				contents: [{ role: 'user', parts: [prompt] }],
			};

			const response = await generativeModel.generateContent(req);
			const result = await response.response;

			if (!result.candidates?.[0]?.content?.parts?.[0]?.text) {
				return NextResponse.json({}, { status: 400 });
			}
			//console.log(result.candidates[0].content);

			try {
				const rawText = result.candidates[0].content.parts[0].text;

				// Strip markdown formatting (e.g., ```json and ```)
				const cleanText = rawText.replace(/```json|```/g, '');
				//console.log(cleanText);

				// Parse the cleaned JSON string
				const roadmapData = JSON.parse(cleanText);

				// Validate and normalize the types
				roadmapData.milestones.forEach((milestone: Milestone) => {
					milestone.how_to.forEach((howTo: HowTo) => {
						// Normalize the type to lowercase
						const normalizedType = howTo.type.toLowerCase() as HowTo['type'];
						howTo.type = normalizedType;
					});
				});

				//console.log(roadmapData);

				// future upgrade

				/* 
				const endpointPath = process.env.DEEPSEEK_ENDPOINT || '';
				const apiKey = process.env.DEEPSEEK_API_KEY || '';
				if (!apiKey) {
					throw new Error(
						'AZURE_API_KEY environment variable is required'
					);
				}

				const client = new Client(
					endpointPath,
					new AzureKeyCredential(apiKey)
				);

				const prompt = `You are a personalized roadmap generator. Your task is to create a detailed and actionable JSON roadmap for users based on their goals, skills, interests, education, country, and any additional custom messages. The roadmap should break down the user's goal into smaller, achievable milestones, with clear outcomes and actionable steps. Each milestone should include high-quality resources, such as courses, books, tools, or activities, with direct links whenever possible.

Output Format: The JSON output must be valid and follow this structure:
{
  "goal": "User's Goal",
  "milestones": [
    {
      "title": "Milestone Title", 
      "outcome": "Achievable Outcome",
      "how_to": [
        {
          "type": "course/resource/activity/tool",
          "description": "Description of the resource/activity",
          "link": "Direct link to the resource (if applicable)"
        }
      ]
    }
  ]
}

Instructions:
1. Understand the User's Context: Analyze the user's goal, skills, interests, education, country, and custom message. Tailor the roadmap to the user's background and preferences.
2. Break Down the Goal: Divide the user's goal into smaller, logical, and achievable milestones. Ensure milestones are ordered sequentially, with each one building on the previous.
3. Provide Actionable Steps: For each milestone, define a clear and measurable outcome. Include a list of resources and activities under "how_to."
4. Ensure Quality and Relevance: Use high-quality, up-to-date, and relevant resources. Avoid generic advice. Provide working links only. Customize resources based on the user's country.
5. Validate the Output: Ensure the final JSON output is valid and adheres to the specified structure.

User Input:
Goal: i want to become an expert in machine learning
Skills: python, machine learning, computer vision, natural language processing, reinforcement learning
Interests: ml, ai, cv, nlp
Education: btech in computer science
Country: india
Custom Message: i want in depth plan for the next 1 year`;

				const response = await client
					.path('/v1/chat/completions')
					.post({
						body: {
							model: 'DeepSeek-R1',
							messages: [{ role: 'user', content: prompt }],
						},
					});

				console.log(response);
				const json = JSON.parse(
					response.body.choices[0].message.content
				);
				console.log(json);
				*/

				return NextResponse.json(roadmapData);
			} catch (parseError) {
				console.error('Error parsing JSON response:', parseError);
				return NextResponse.json({}, { status: 400 });
			}
		}
	} catch (error) {
		console.error('Error generating/modifying roadmap:', error);
		return NextResponse.json(
			{ error: 'Failed to generate/modify roadmap' },
			{ status: 500 }
		);
	}
}
