"use client"
import React, { useEffect, useState } from 'react'
import { db } from '../../../../../utils/db';
import { MockInterview } from '../../../../../utils/schema';
import { eq } from 'drizzle-orm';
import QuestionsSection from './_components/QuestionsSection';
import RecordAnswerSection from './_components/RecordAnswerSection';
import { Button } from '../../../../../components/ui/button';
import Link from "next/link";




function StartInterview({params}) {
    const [interviewData, setInterviewData] = useState();
    const [mockInterviewQuestion, setMockInterviewQuestion] = useState();
    const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState([]);

    useEffect(()=>{
        console.log("Interview ID:", params.interviewId);

        GetInterviewDetails();

    },[]);



    const GetInterviewDetails=async()=>{
            const result=await db.select().from(MockInterview).where(eq(MockInterview.mockId,params.interviewId))
            console.log("Database result:", result); 

            if (result.length === 0) {
                console.error("No interview data found!");
                return;
            }

        //     if (result.length > 0 && result[0].jsonMockResp) {
        //         const jsonMockResp = JSON.parse(result[0].jsonMockResp);
        //         setMockInterviewQuestion(jsonMockResp);
        //         setInterviewData(result[0]);
        //     } else {
        //         console.error("No interview data or jsonMockResp found.");
        //     } 
        // };

        if (result[0].jsonMockResp) {
            const jsonMockResp = JSON.parse(result[0].jsonMockResp);
            setMockInterviewQuestion(jsonMockResp);
            setInterviewData(result[0]);
            setUserAnswers(Array(jsonMockResp.length).fill("")); // ✅ Initialize answers array
          } else {
            console.error("No interview data or jsonMockResp found.");
          }
        };

        const saveAnswer = (index, answer) => {
            setUserAnswers((prevAnswers) => {
              const newAnswers = [...prevAnswers];
              newAnswers[index] = answer;
              return newAnswers;
            });
          };

        const submitAnswers = async () => {
            console.log("Submitting all answers:", userAnswers);
            // ✅ Process all answers in one batch at the end
            try {
              const records = userAnswers.map((answer, index) => ({
                mockIdRef: interviewData?.mockId,
                question: mockInterviewQuestion[index]?.question,
                correctAns: mockInterviewQuestion[index]?.answer,
                userAns: answer,
                userEmail: interviewData?.userEmail,
                createdAt: new Date().toISOString(),
              }));
        
              await db.insert(UserAnswer).values(records);
              alert("Interview Completed!");
            } catch (error) {
              console.error("Error saving answers:", error);
            }
          };

  return (
    <div>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-10'>

        {/* Questions */}
        <QuestionsSection 
        mockInterviewQuestion={mockInterviewQuestion}
        activeQuestionIndex={activeQuestionIndex}
        />

        {/* Video/audio recording */}
        <RecordAnswerSection
        mockInterviewQuestion={mockInterviewQuestion}
        activeQuestionIndex={activeQuestionIndex}
        interviewData={interviewData}
        onSaveAnswer={saveAnswer}
        />
        

      </div>
      <div className='flex justify-end gap-6'>
        
        {activeQuestionIndex > 0 && (
          <Button onClick={() => setActiveQuestionIndex(activeQuestionIndex - 1)}>
            Back
          </Button>
        )}

        {activeQuestionIndex < (mockInterviewQuestion?.length || 0) - 1 && (
        <Button onClick={() => setActiveQuestionIndex(activeQuestionIndex + 1)}>
            Next
        </Button>
        )}

        {activeQuestionIndex === (mockInterviewQuestion?.length || 0) - 1 && (
        <Link href={`/dashboard/interview/${interviewData?.mockId}/feedback`}>
            <Button>End Interview</Button>
        </Link>
        )}

      </div>
    </div>
  );
}

        {/* {activeQuestionIndex === mockInterviewQuestion?.length - 1 && (
          <Button onClick={() => alert("Interview Ended!")}>
            End Interview
          </Button>
        )} */}


//       </div>
//     </div>
//   )
// }

export default StartInterview
