import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID,
  project: process.env.OPENAI_PROJECT_ID,
});

export const maxDuration = 60; // This function can run for a maximum of 5 seconds

export async function POST(request: Request) {
  try {
    const { score, course, answers } = await request.json();
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { 
          role: "system", 
          content: "You are a Power BI expert. We offer 4 Power BI courses: Power BI Essentials, Power BI Report Design, Power BI Advanced, and Power BI DAX Essentials. Your task is to provide a personalized response based on the user's quiz answers and recommended course. Dive into the specific Power BI features in your response and how the user will benefit from learning and adopting them." 
        },
        {
          role: "user",
          content: `The user scored ${score} points and is recommended the ${course} course. Please provide a personalized response that acknowledges their current skill level and explains why the recommended course would be beneficial for them.`
        },
        {
            role: "assistant",
            content: "Your responses highlight your understanding and preliminary expertise of Power BI, particularly based on your IT background. They indicate a clear objective to use Power BI for a specific project requirement, specifically in utilizing existing data models to build reports. Given your score and the productivity goals you have pointed out, we are recommending you to take the Power BI Report Design course. This course will be exceedingly beneficial to you for the following reasons: - Your aim to utilize existing data models to build reports aligns perfectly with the course's focus. You will gain expertise in creating interactive and well-organized reports, enabling you to enhance your current project's performance. - The course is designed for individuals who already have basic Power BI knowledge and who are familiar with the IT realm. Your background and your quiz results place you in this category. - Taking this course will also provide you with an excellent chance to leverage your technical background while delving deeper into report design, which could open up new opportunities in your IT career. We look forward to seeing you in our Power BI Report Design course - Your AMZ Consulting Team."
        }
      ],
    });

    return NextResponse.json({ 
      message: completion.choices[0].message.content 
    });
    
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    return NextResponse.json(
      { error: 'Failed to generate message' },
      { status: 500 }
    );
  }
} 