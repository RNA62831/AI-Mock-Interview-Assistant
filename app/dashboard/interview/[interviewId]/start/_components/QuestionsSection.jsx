import { Lightbulb, Volume2Icon } from 'lucide-react'
import React from 'react'

function QuestionsSection({mockInterviewQuestion, activeQuestionIndex}) {

    const textToSpeech=(text)=>{
        if('speechSynthesis' in window){
            const speech=new SpeechSynthesisUtterance(text);
            window.speechSynthesis.speak(speech)
        }
        else{
            alert('Sorry, Your browser does not support text to speech')
        }
    }

  return mockInterviewQuestion&&(
    <div className='p-5 border rounded-lg my-5'>
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5'>
        {mockInterviewQuestion && mockInterviewQuestion.map((question, index) => (
            <h2 key={index} className={`p-2 bg-secondary rounded-full text-xs md:text-sm text-center cursor-pointer
                ${activeQuestionIndex==index&&'bg-purple-800 text-white'}`}>Question #{index + 1}</h2>
        ))}

    </div>
    <h2 className='my-5 text-md md:text-md'>{mockInterviewQuestion[activeQuestionIndex]?.question}</h2>

    <Volume2Icon className='cursor-pointer' onClick={()=>textToSpeech(mockInterviewQuestion[activeQuestionIndex]?.question)}/>
        
    <div className='border rounded-lg p-5 bg-purple-100 mt-10'>
        <h2 className='flex gap-2 items-center text-purple-800'>
            <Lightbulb/>
            <strong>Note:</strong>
        </h2>
        <h2 className='text-sm text-purple-800 my-2'>{process.env.NEXT_PUBLIC_QUESTION_NOTE}</h2>
    </div>
      
    </div>
  )
}

export default QuestionsSection
