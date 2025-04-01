"use client";

import React, { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    // DialogTrigger,
  } from "/components/ui/dialog"
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Textarea } from '../../../components/ui/textarea'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { LoaderCircle, LoaderIcon } from 'lucide-react';
import { db } from '../../../utils/db'
import { MockInterview } from '../../../utils/schema';
import { v4 as uuidv4 } from 'uuid';
import { useUser } from '@clerk/nextjs';
import moment from 'moment';
import { useRouter } from 'next/navigation';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY); // Use API key from env
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

function AddNewInterview() {
    const [openDialog,setOpenDialog] = useState(false)
    const [jobPosition, setJobPosition]=useState("");
    const [jobDesc, setJobDesc]=useState("");
    const [jobExperience, setJobExperience]=useState("");
    const [loading, setLoading]=useState(false);
    const [jsonResponse, setJsonResponse] = useState([]);
    const router=useRouter();
    const {user}=useUser();

    const onSubmit=async(e)=>{
        setLoading(true)
        e.preventDefault()
        console.log(jobPosition,jobDesc,jobExperience);

        const inputPrompt="You are the best counselor, and you take mock interviews before the actual interviews of the person so that students would get 100 percent placed. You are given with job position as "+jobPosition+", job description as "+jobDesc+" and job experience as "+jobExperience+". Depending on these three, analyze them and generate exactly "+process.env.NEXT_PUBLIC_INTERVIEW_QUESTION_COUNT+" interview questions along with answers in JSON format. The response must contain exactly the number specified objects inside an array each having question string and answer detailed string. do not provide fewer or more questions. do not include any extra text outside of the JSON response."
    //     const result=await ChatSession.sendMessage(InputPrompt);
    //     console.log(result.response.text());
    // }

    try {
        // ✅ Corrected AI request format
        const chatSession = model.startChat();
        const result = await chatSession.sendMessage(inputPrompt);
        const MockJsonResp=(result.response.text()).replace('```json','').replace('```','')
        // const responseText = await result.response.text();
        console.log(JSON.parse(MockJsonResp));
        setJsonResponse(MockJsonResp);

        if(MockJsonResp)
        {
        const resp=await db.insert(MockInterview)
        .values({
            mockId:uuidv4(),
            jsonMockResp:MockJsonResp,
            jobPosition:jobPosition,
            jobDesc:jobDesc,
            jobExperience:jobExperience,
            createdBy:user?.primaryEmailAddress?.emailAddress,
            createdAt:moment().format('DD-MM-yyyy')

        }).returning({mockId:MockInterview.mockId})

        console.log("Inserted ID:",resp)
        if(resp){
            setOpenDialog(false);
            router.push('/dashboard/interview/'+resp[0]?.mockId)
        }
    }
    else{
        console.log("Error");
    }
        setLoading(false);
      } catch (error) {
        console.error("Error in AI Response:", error);
      }
    };

  return (
    <div>
      <div className='p-10 border rounded-lg bg-secondary
      hover:scale-105 hover:shadow-md cursor-pointer
      transition-all'
      onClick={()=>setOpenDialog(true)}>
        <h2 className='text-lg text-center'>+ Add New </h2>
      </div>
      <Dialog open={openDialog}>
      
      <DialogContent className="max-w-xl">
          <DialogHeader>
          <DialogTitle className='text-2xl text-center'>Job Interview Details</DialogTitle>
          <DialogDescription>
            <form onSubmit={onSubmit}>
              <div>
                
                <h2>
                    Add Details about your job role, job description and years of experience
                </h2>
                <div className='mt-5 my-3'>
                    <label>Job Role/Position</label>
                    <Input placeholder="Ex. ML Engineer" required
                    onChange={(event)=>setJobPosition(event.target.value)}/>
                    
                </div>

                <div className='my-3'>
                    <label>Job Description/Tech Stack (In Short)</label>
                    <Textarea placeholder="Ex. LLM, Supervised Learning, CNN, RNN etc." required
                    onChange={(event)=>setJobDesc(event.target.value)}/>
                    
                </div>

                <div className='my-3'>
                    <label>Years of Experience</label>
                    <Input placeholder="Ex. 5" type="number" max="50" required
                    onChange={(event)=>setJobExperience(event.target.value)}/>
                    
                </div>
                

              </div>
              <div className='flex gap-5 justify-end'>
                <Button type="button" variant="ghost" onClick={()=>setOpenDialog(false)}>Cancel</Button>
                <Button type="submit" disabled={loading}>
                    {loading?
                    <>
                    <LoaderCircle className='animate-spin'/>'Analyzing your role'
                    </>:'Start Interview'
                }
                </Button>
              </div>
              </form>
          </DialogDescription>
          </DialogHeader>
      </DialogContent>
      </Dialog>

    </div>
  )
}

export default AddNewInterview
