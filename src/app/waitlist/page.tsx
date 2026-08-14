// "use client";
// import React, { useState } from "react";
// import Image from "next/image";

// const Webd = () => {
//   const [email, setEmail] = useState("");

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!email) {
//       alert("Please enter your email");
//       return;
//     }
//     alert(`Thanks for joining the waitlist, ${email}!`);
//     setEmail("");
//   };

//   return (
//     <div className="relative w-screen h-screen overflow-hidden">
//       {/* Background with Black Overlay */}
//       <div
//         className="absolute inset-0 bg-cover bg-center z-0"
//         style={{
//           backgroundImage:
//             "linear-gradient(rgba(0,0,0,0.9), rgba(0,0,0,0.9)), url('/bg.png')",
//         }}
//       />

//       {/* Left Mascot + Mobile Progress (hidden on small, visible on md+) */}
//       <div className="absolute left-0 bottom-0 hidden md:flex items-end space-x-6 pl-4 z-20">
//         <Image
//           src="/mascot_three_quarter.png"
//           alt="Mascot"
//           width={350}
//           height={600}
//           className="object-contain max-w-[40vw] h-auto"
//         />
//         <Image
//           src="/mobile-progress-4.png"
//           alt="Mobile Progress"
//           width={260}
//           height={500}
//           className="object-contain max-w-[30vw] h-auto"
//         />
//       </div>

//       {/* Main Content */}
//       <div className="relative z-30 flex flex-col items-center justify-start h-full pt-16 md:pt-24 px-4 text-center text-white">
//         {/* Logo */}
//         <Image
//           src="/logo.png"
//           alt="Quiva Logo"
//           width={110}
//           height={45}
//           className="mb-6 w-28 md:w-32"
//         />

//         {/* Title */}
//         <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-4 leading-snug max-w-xl">
//           Bring Your Comic to Life. Get Discovered
//         </h1>

//         {/* Subtitle */}
//         <p className="text-sm sm:text-base md:text-lg text-gray-200 mb-6 max-w-md">
//           Join our exclusive creator community and showcase your stories to
//           readers worldwide.
//         </p>

//         {/* Email Input + Button */}
//         {/* Email Input + Button */}
// <form
//   onSubmit={handleSubmit}
//   className="relative w-full max-w-md mx-auto px-2"
// >
//   <input
//     type="email"
//     placeholder="Enter your email"
//     value={email}
//     onChange={(e) => setEmail(e.target.value)}
//     aria-label="Email address"
//     className="w-full px-4 py-3 pr-32 rounded-xl bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500"
//   />

//   <button
//     type="submit"
//     className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-yellow-500 text-black px-8 py-2 rounded-full font-semibold hover:bg-yellow-400 transition"
//   >
//     Join Waitlist
//   </button>
// </form>

//       </div>
//     </div>
//   );
// };

// export default Webd;

import Waitlist from '@/features/waitlist/components/waitlist-view'
import React from 'react'

function page() {
  return (
    <Waitlist/>
  )
}

export default page