"use client";
import Webcam from "react-webcam";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { Button } from "../../../../../../components/ui/button";
import useSpeechToText from "react-hook-speech-to-text";
import { Mic } from "lucide-react";
import { toast } from "sonner";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "../../../../../../utils/db";
import { UserAnswer } from "../../../../../../utils/schema";
import { useUser } from "@clerk/nextjs";
import moment from "moment";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

function RecordAnswerSection({ mockInterviewQuestion, activeQuestionIndex, interviewData, onSaveAnswer }) {
  const [userAnswer, setUserAnswer] = useState("");
  const { user } = useUser();
  const [loading, setLoading] = useState(false);

  const {
    isRecording,
    results,
    startSpeechToText,
    stopSpeechToText,
  } = useSpeechToText({
    continuous: true,
    useLegacyResults: false,
  });

  // ✅ Reset user answer when switching questions
  useEffect(() => {
    setUserAnswer(""); 
  }, [activeQuestionIndex]);

  // ✅ Efficiently collect user answer
  useEffect(() => {
    setUserAnswer(results.map((r) => r.transcript).join(" "));
  }, [results]);

  const StartStopRecording = async () => {
    try {
      if (isRecording) {
        stopSpeechToText();
        if (userAnswer.length < 10) {
          toast("Error: Your answer is too short. Please record again.");
          return;
        }
        updateUserAnswer(); // ✅ Now calls AI feedback after stopping
      } else {
        startSpeechToText();
      }
    } catch (error) {
      console.error("Error in recording", error);
      toast.error("An error occurred while recording.");
    }
  };

  const updateUserAnswer = async () => {
    setLoading(true);
    const feedbackPrompt = `
    You are an expert interview evaluator assessing a candidate's response in a technical/mock interview. 
    Your task is to provide **constructive feedback** to help the candidate improve.

    **Context:**  
    - **Question:** ${mockInterviewQuestion[activeQuestionIndex]?.question}  
    - **User's Answer:** ${userAnswer}  

    **Evaluation Criteria:**  
    1. **Accuracy & Completeness**  
    2. **Clarity & Communication**  
    3. **Depth & Critical Thinking**  
    4. **Conciseness**  
    5. **Confidence & Delivery**  

    **Expected Output (JSON format):**  
    \`\`\`json
    {
      "rating": (integer from 1-10),
      "feedback": "Brief but insightful review.",
      "improvement_suggestions": [
        "First improvement suggestion.",
        "Second improvement suggestion.",
        "Third improvement suggestion."
      ]
    }
    \`\`\`
    `;

    try {
      const result = await model.generateContent(feedbackPrompt);
      const responseText = await result.response.text(); // ✅ Fixed `await`
      const cleanedResponse = responseText.replace(/```json|```/g, '');
      const feedbackData = JSON.parse(cleanedResponse);

      console.log("AI Feedback:", feedbackData);

      const resp = await db.insert(UserAnswer).values({
        mockIdRef: interviewData?.mockId,
        question: mockInterviewQuestion[activeQuestionIndex]?.question,
        correctAns: mockInterviewQuestion[activeQuestionIndex]?.answer,
        userAns: userAnswer, 
        feedback: feedbackData?.feedback,
        rating: feedbackData?.rating,
        userEmail: user?.primaryEmailAddress.emailAddress,
        createdAt: moment().format("DD-MM-YYYY"),
      });

      if (resp) {
        toast("User Answer recorded successfully");
      }

      setUserAnswer(""); // ✅ Reset only after successful feedback
      setLoading(false);
    } catch (error) {
      console.error("Error fetching AI feedback:", error);
      toast.error("Failed to fetch AI feedback. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center flex-col">
      <div className="flex flex-col mt-10 mb-2 justify-center items-center bg-black rounded-lg p-5 relative">
        <Image src={"/webcam.png"} width={200} height={200} alt="WebCam Placeholder" className="absolute" />
        <Webcam
          mirrored={true}
          style={{
            height: 300,
            width: "100%",
            zIndex: 10,
          }}
        />
      </div>

      <div className="-mt-0">
        <Button
          disabled={loading}
          variant="outline"
          className="w-full bg-white text-purple-800"
          onClick={StartStopRecording}
        >
          {isRecording ? (
            <h2 className="text-red-600 flex gap-2">
              <Mic /> Stop Recording...
            </h2>
          ) : (
            "Record Answer"
          )}
        </Button>
      </div>
    </div>
  );
}

export default RecordAnswerSection;
