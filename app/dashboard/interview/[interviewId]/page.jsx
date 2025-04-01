"use client"
import React, { useEffect, useState } from 'react'
import { MockInterview } from '../../../../utils/schema'
import { db } from '../../../../utils/db'
import { eq } from 'drizzle-orm'
import Webcam from 'react-webcam'
import { Lightbulb, LightbulbIcon, WebcamIcon } from 'lucide-react'
import { Button } from '../../../../components/ui/button'
import Link from 'next/link'

function Interview({params}) {

    const [interviewData,setInterviewData]=useState({});
    const [WebCamEnabled, setWebCamEnabled]=useState(false);
    useEffect(()=>{
        console.log(params.interviewId)
        GetInterviewDetails();
    },[])
    //to get interview details by mockid

    const GetInterviewDetails=async()=>{
        const result=await db.select().from(MockInterview).where(eq(MockInterview.mockId,params.interviewId))
        
        setInterviewData(result[0]);
    }

  return (
    <div className='my-10 '>
        <h2 className='font-bold text-2xl'>Let's get Started</h2>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-10'>

        
        <div>
            {WebCamEnabled? < Webcam
            onUserMedia={()=>setWebCamEnabled(true)}
            onUserMediaError={()=>setWebCamEnabled(false)}
            mirrored={true}
            style={{
                height:300,
                width:300
            }
            }
            />
            :
            <>
             <WebcamIcon className='h-60 w-full my-7 p-20 bg-secondary rounded-lg border'/>
             <Button variant="ghost" onClick={()=>setWebCamEnabled(true)}>Enable Web Cam and Microphone</Button>
             </>

            }
        </div>
        <div className='flex flex-col my-5 gap-5 '> 
            <div className='flex flex-col gap-3 p-5 rounded-lg border'>
            <h2 className='text-lg'><strong>Job Role/Position: </strong>{interviewData? interviewData.jobPosition:"Loading..."}</h2>
            <h2 className='text-lg'><strong>Job Description/Tech Stack: </strong>{interviewData? interviewData.jobDesc:"Loading..."}</h2>
            <h2 className='text-lg'><strong>Years of Experience: </strong>{interviewData? interviewData.jobExperience:"Loading..."}</h2>
            </div>
            <div className='p-5 border rounded-lg border-yellow-300 bg-yellow-50'>
                <h2 className='flex gap-2 items-center text-yellow-700'><LightbulbIcon/><strong>Information</strong></h2>
                <h2 className='mt-3 text-yellow-600'>{process.env.NEXT_PUBLIC_INFORMATION}</h2>
            
        </div>
        </div>

      </div>
        <div className='flex justify-end items-end'>
            <Link href={'/dashboard/interview/'+params.interviewId+'/start'}>
      <Button >Start Interview</Button>
      </Link>
      
    </div>
    </div>
  )
}

export default Interview
