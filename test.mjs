import ModelClient from '@azure-rest/ai-inference';
import { AzureKeyCredential } from '@azure/core-auth';

const endpointPath =
	'https://DeepSeek-R1-emflg.eastus2.models.ai.azure.com';
const apiKey = process.env.AZURE_API_KEY || '';
if (!apiKey) {
	throw new Error('AZURE_API_KEY environment variable is required');
}

const client = new ModelClient(
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

const response = await client.path('/v1/chat/completions').post({
	body: {
		model: 'DeepSeek-R1',
		messages: [{ role: 'user', content: prompt }],
	},
});

console.log(response);
const json = JSON.parse(response.body.choices[0].message.content);
console.log(json);
