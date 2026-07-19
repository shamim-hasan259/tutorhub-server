import { geminiModel } from '../config/gemini';
import { Tutor, ITutorDocument } from '../models/Tutor';
import { AIHistory, IAIHistoryDocument } from '../models/AIHistory';
import { AppError } from '../utils/response';

interface TutorRecommendationInput {
  studentClass: string;
  subject: string;
  weakTopics: string[];
  budget: number;
  preferredTime: string;
  learningGoal: string;
}

interface StudyPlanInput {
  subject: string;
  examDate: string;
  dailyStudyTime: number;
  weakChapters: string[];
  targetGrade: string;
}

export const getTutorRecommendation = async (
  userId: string,
  input: TutorRecommendationInput
): Promise<{ recommendations: unknown[]; alternatives: unknown[]; overallAdvice: string }> => {
  // Fetch available tutors matching the subject
  const tutors = await Tutor.find({
    subjects: { $in: [new RegExp(input.subject, 'i')] },
    hourlyRate: { $lte: input.budget },
  })
    .populate('userId', 'name email avatar')
    .limit(20)
    .lean();

  if (tutors.length === 0) {
    throw new AppError('No tutors found matching your criteria', 404);
  }

  // Format tutor data for the AI prompt
  const tutorData = tutors.map((tutor, index) => {
    const user = tutor.userId as unknown as { name: string; avatar?: string };
    return `${index + 1}. ${user.name || 'Unknown'}
       - Subjects: ${tutor.subjects.join(', ')}
       - Hourly Rate: $${tutor.hourlyRate}
       - Rating: ${tutor.rating}/5 (${tutor.totalReviews} reviews)
       - Teaching Mode: ${tutor.teachingMode}
       - Location: ${tutor.location}
       - Bio: ${tutor.bio.substring(0, 200)}...`;
  }).join('\n\n');

  const prompt = `You are an expert AI tutor recommendation agent for EduPro, an AI-powered tutor marketplace.

STUDENT PROFILE:
- Class: ${input.studentClass}
- Subject: ${input.subject}
- Weak Topics: ${input.weakTopics.join(', ')}
- Budget: $${input.budget}/hour
- Preferred Time: ${input.preferredTime}
- Learning Goal: ${input.learningGoal}

AVAILABLE TUTORS:
${tutorData}

TASK:
Analyze each tutor and recommend the TOP 3 most suitable tutors for this student. For each recommendation:

1. Explain WHY this tutor is a good match (2-3 sentences)
2. Rate the match percentage (0-100%)
3. Highlight relevant strengths
4. Mention any potential concerns

Also provide 1-2 alternative suggestions if the recommended tutors are not available.

RESPONSE FORMAT (JSON only, no markdown):
{
  "recommendations": [
    {
      "tutorIndex": 1,
      "matchPercentage": 95,
      "reason": "Detailed explanation of why this tutor is recommended...",
      "strengths": ["strength1", "strength2"],
      "concerns": ["concern1"]
    }
  ],
  "alternatives": [
    {
      "tutorIndex": 4,
      "reason": "Alternative suggestion explanation..."
    }
  ],
  "overallAdvice": "General advice for the student about choosing a tutor..."
}`;

  try {
    const result = await geminiModel.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new AppError('Failed to parse AI response', 500);
    }

    const aiResponse = JSON.parse(jsonMatch[0]);

    // Map tutor indices back to actual tutor data
    const recommendations = aiResponse.recommendations.map((rec: any) => ({
      tutor: tutors[rec.tutorIndex - 1],
      matchPercentage: rec.matchPercentage,
      reason: rec.reason,
      strengths: rec.strengths,
      concerns: rec.concerns,
    }));

    const alternatives = (aiResponse.alternatives || []).map((alt: any) => ({
      tutor: tutors[alt.tutorIndex - 1],
      reason: alt.reason,
    }));

    const output = {
      recommendations,
      alternatives,
      overallAdvice: aiResponse.overallAdvice,
    };

    // Save to history
    await AIHistory.create({
      userId,
      type: 'tutor_recommendation',
      input,
      output,
    });

    return output;
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error('Gemini API error:', error);
    throw new AppError('Failed to generate AI recommendations', 500);
  }
};

export const getStudyPlan = async (
  userId: string,
  input: StudyPlanInput
): Promise<{ studyPlan: unknown }> => {
  const examDate = new Date(input.examDate);
  const today = new Date();
  const daysUntilExam = Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntilExam <= 0) {
    throw new AppError('Exam date must be in the future', 400);
  }

  const prompt = `You are an expert AI study plan generator for EduPro, an AI-powered tutor marketplace.

STUDENT PROFILE:
- Subject: ${input.subject}
- Exam Date: ${input.examDate} (${daysUntilExam} days from now)
- Daily Study Time: ${input.dailyStudyTime} hours
- Weak Chapters: ${input.weakChapters.join(', ')}
- Target Grade: ${input.targetGrade}

TASK:
Create a comprehensive, personalized study plan that maximizes the student's chance of achieving their target grade.

The plan should include:

1. DAILY STUDY PLAN (day-by-day breakdown until exam)
2. WEEKLY GOALS (milestones for each week)
3. REVISION PLAN (spaced repetition schedule)
4. PRACTICE SCHEDULE (practice tests and exercises)

Consider:
- More time on weak chapters
- Regular breaks and review sessions
- Progressive difficulty
- Final week revision strategy

RESPONSE FORMAT (JSON only, no markdown):
{
  "dailyPlan": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "topics": ["topic1", "topic2"],
      "hours": 2,
      "activities": ["Study chapter X", "Practice problems", "Review notes"],
      "notes": "Focus area for today..."
    }
  ],
  "weeklyGoals": [
    {
      "week": 1,
      "goals": ["Complete chapter 1-3", "Master basic concepts"],
      "milestone": "End of week 1 assessment"
    }
  ],
  "revisionPlan": {
    "schedule": ["Review Week 1 topics on Day 8", "Review Week 2 topics on Day 15"],
    "techniques": ["Active recall", "Practice tests", "Flashcards"]
  },
  "practiceSchedule": {
    "weeklyTests": ["Test 1 on Week 1 topics", "Test 2 on Week 2 topics"],
    "finalPractice": ["Full mock exam 3 days before", "Review weak areas 2 days before"]
  },
  "tips": ["Study in 25-minute Pomodoro intervals", "Get 7-8 hours of sleep", "Stay hydrated"]
}`;

  try {
    const result = await geminiModel.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new AppError('Failed to parse AI response', 500);
    }

    const studyPlan = JSON.parse(jsonMatch[0]);

    // Save to history
    await AIHistory.create({
      userId,
      type: 'study_plan',
      input,
      output: studyPlan,
    });

    return { studyPlan };
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error('Gemini API error:', error);
    throw new AppError('Failed to generate study plan', 500);
  }
};

export const getAIHistory = async (
  userId: string,
  type?: 'tutor_recommendation' | 'study_plan'
) => {
  const filter: Record<string, unknown> = { userId };
  if (type) {
    filter.type = type;
  }

  const history = await AIHistory.find(filter)
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  return history;
};

export const deleteAIHistoryEntry = async (
  userId: string,
  historyId: string
): Promise<void> => {
  const history = await AIHistory.findById(historyId);

  if (!history) {
    throw new AppError('History entry not found', 404);
  }

  if (history.userId.toString() !== userId) {
    throw new AppError('Not authorized', 403);
  }

  await AIHistory.findByIdAndDelete(historyId);
};
