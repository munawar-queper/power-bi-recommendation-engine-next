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
          - Power BI Report Design
          - Power BI Advanced
          - Power BI DAX Essentials
          - Power BI Service

          Create a structured response in the following JSON format:
          {
            "title": "Your Learning Journey",
            "currentSkills": "Brief assessment of their skill level based on score",
            "courseRecommendation": {
              "name": "Course name (must be one of the available courses)",
              "benefits": ["benefit1", "benefit2", "benefit3"]
            },
            "learningOutcomes": ["outcome1", "outcome2", "outcome3"],
            "nextSteps": "Call to action message"
          }
          
          Base this on their quiz score of ${score} and recommended course. Ensure the recommended course is from the available courses list.`,
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
