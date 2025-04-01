"use client"
import React, { useEffect, useState } from 'react'
import { db } from '../../../../../utils/db'
import { UserAnswer } from '../../../../../utils/schema'
import { eq } from 'drizzle-orm'
// import { User } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../../../../components/ui/collapsible";
import { ChevronsUpDown } from 'lucide-react'
import { Button } from '../../../../../components/ui/button'
import { useRouter } from 'next/navigation'


function Feedback({params}) {

    const [feedbackList, setFeedbackList]=useState([]);
    const router=useRouter();
    useEffect(()=>{
        GetFeedback();
    },[])

    const GetFeedback=async()=>{
        const result=await db.select().from(UserAnswer).where(eq(UserAnswer.mockIdRef,params.interviewId))
        .orderBy(UserAnswer.id)

        console.log(result);
        setFeedbackList(result);

    }
  return (
    <div className='p-10'>
        <h2 className='text-2xl font-bold text-orange-500'>Congratulations!</h2>
        <h2 className='font-bold text-2xl'>Here is your interview feedback</h2>
        <h2 className='text-primary text-lg my-3'>Your overall interview rating: <strong>7/10</strong></h2>
        <h2 className='text-sm text-orange-500'>Find below interview questions with correct answers. </h2>

        {feedbackList&&feedbackList.map((item, index)=>
            <Collapsible key={index} className='mt-7'>
            <CollapsibleTrigger className='p-2 bg-secondary rounded-lg flex justify-end my-2 text-left gap-7 w-full'>
            {item.question} <ChevronsUpDown className='h-5 w-5'/>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className='flex flex-col gap-2'>
                <h2 className='text-orange-500 p-2 border rounded-lg'>
                    <strong>Rating:</strong>{item.rating}
                </h2>
                <h2 className='p-2 border rounded-lg bg-orange-50 text-orange-500 text-sm'><strong>Your Answer : </strong>{item.userAns}</h2>
                <h2 className='p-2 border rounded-lg bg-purple-50 text-purple-500 text-sm'><strong>Correct Answer : </strong>{item.correctAns}</h2>
                <h2 className='p-2 border rounded-lg bg-blue-50 text-blue-900 text-sm'><strong>Feedback : </strong>{item.feedback}</h2>
              </div>
            </CollapsibleContent>
            </Collapsible>
        )}

        <Button onClick={()=>router.replace('/dashboard')}>Go Home</Button>
    </div>
  )
}

export default Feedback
