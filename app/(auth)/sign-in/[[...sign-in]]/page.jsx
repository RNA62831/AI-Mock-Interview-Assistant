"use client";
import { SignIn } from '@clerk/nextjs'

export default function Page() {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-cover bg-center" 
         style={{ backgroundImage: "url('https://source.unsplash.com/random/1600x900?futuristic')" }}>
      <div className="backdrop-blur-lg bg-white/30 p-8 rounded-xl shadow-lg">
        <SignIn />
      </div>
    </div>
  );
}