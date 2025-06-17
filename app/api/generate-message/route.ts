import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID,
  project: process.env.OPENAI_PROJECT_ID,
});

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const { score, course, answers } = await request.json();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a Power BI expert. The following courses are available:
          - Power BI Essentials
          - Power BI Service
          - Power BI Report Design
          - Power BI Advanced
          - Power BI DAX Essentials

          The user's current position will be shown on a visual ladder with 5 steps, each labeled with one of the above courses. The image highlights the user's recommended course as their current step, with higher steps representing more advanced expertise. The ladder visually shows progression from Essentials (bottom step 1) to DAX Essentials (top step 5).

          Create a structured response in the following JSON format:
          {
            "title": "Your Learning Journey",
            "currentSkills": "Brief assessment of their skill level based on score",
            "ladderPositionDescription": "Describe the user's current position on the Power BI learning ladder image, referencing the step and what it means (e.g., 'You are on the third step: Power BI Report Design, which means you have solid foundational skills and are ready to focus on effective report building.')",
            "courseRecommendation": {
              "name": "Course name (must be one of the available courses)",
              "benefits": ["Highlight 3 specific benefits of this course for the user, based on their skill level and the visual ladder position"]
            },
            "learningOutcomes": ["List 3 outcomes the user will achieve after completing the course"],
            "nextSteps": "Call to action message"
          }
          
          Base this on their quiz score of ${score}, the recommended course, and their answers. Ensure the recommended course is from the available courses list. Make the ladderPositionDescription match the visual representation of the user's current step on the ladder image based on the recommended course ${course}.`,
        },
        {
          role: "user",
          content: `The user scored ${score} points and is recommended the ${course} course. Provide a personalized response that explains why the recommended course would be beneficial.`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const responseContent = completion.choices[0].message.content;
    let structuredResponse;

    try {
      structuredResponse = responseContent ? JSON.parse(responseContent) : "";
    } catch (e) {
      // Fallback to unstructured response if parsing fails
      structuredResponse = {
        title: "Your Learning Journey",
        currentSkills: responseContent,
        courseRecommendation: {
          name: course.name,
          benefits: [
            "Personalized learning path",
            "Expert-led instruction",
            "Practical exercises",
          ],
        },
        learningOutcomes: [
          "Enhanced Power BI skills",
          "Practical application knowledge",
          "Professional development",
        ],
        nextSteps: "Start your learning journey today!",
      };
    }

    return NextResponse.json({ message: structuredResponse });
  } catch (error) {
    console.error("Error calling OpenAI:", error);
    return NextResponse.json(
      { error: "Failed to generate message" },
      { status: 500 }
    );
  }
}
