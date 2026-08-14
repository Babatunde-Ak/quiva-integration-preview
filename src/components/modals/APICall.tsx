// "use client";
// import React, { useState } from "react";
// import { toast } from "react-toastify";
// import axiosInstance from '@/redux/axios-instance'; // Your existing axios
// import { useWalletAuth } from '@/providers/WalletProvider';

// const DirectAPIAuthModal = ({ onClose, onLoginSuccess }) => {
//   const [email, setEmail] = useState("");
//   const [otpCode, setOtpCode] = useState("");
//   const [step, setStep] = useState<'email' | 'otp'>('email');
//   const [isLoading, setIsLoading] = useState(false);
  
//   const { address, isConnected, signMessage } = useWalletAuth();

//   // Direct API call - Send OTP
//   const handleSendOTP = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!email) return;
    
//     setIsLoading(true);
//     try {
//       // Direct call to your existing endpoint
//       const response = await axiosInstance.post('/auth/send-otp', { email });
      
//       if (response.data.success) {
//         toast.success('OTP sent to your email!');
//         setStep('otp');
//       } else {
//         toast.error(response.data.message);
//       }
//     } catch (error: any) {
//       toast.error(error.response?.data?.message || 'Failed to send OTP');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Direct API call - Verify OTP
//   const handleVerifyOTP = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!otpCode || otpCode.length !== 6) return;
    
//     setIsLoading(true);
//     try {
//       // Direct call to your existing endpoint
//       const response = await axiosInstance.post('/auth/verify-otp', {
//         email,
//         otpCode
//       });
      
//       if (response.data.success) {
//         // Save token to localStorage
//         const userData = {
//           user: response.data.user,
//           token: response.data.token,
//           expiresAt: response.data.expiresAt,
//         };
//         localStorage.setItem('userData', JSON.stringify(userData));
//         localStorage.setItem('authToken', response.data.token);
        
//         toast.success('Authentication successful!');
//         onLoginSuccess?.();
//         onClose();
//       } else {
//         toast.error(response.data.message);
//       }
//     } catch (error: any) {
//       toast.error(error.response?.data?.message || 'OTP verification failed');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Direct API call - Wallet Authentication
//   const handleWalletAuth = async () => {
//     if (!address || !isConnected) {
//       toast.error('Please connect your wallet first');
//       return;
//     }

//     setIsLoading(true);
//     try {
//       // Step 1: Get nonce from your existing endpoint
//       const nonceResponse = await axiosInstance.post('/auth/wallet/nonce', { 
//         address 
//       });
      
//       const { nonce } = nonceResponse.data;
      
//       // Step 2: Create message and sign
//       const message = `Welcome to Quiva!\n\nSign this message to authenticate your wallet.\n\nWallet: ${address}\nNonce: ${nonce}`;
//       const signature = await signMessage({ message });
      
//       // Step 3: Verify signature with your existing endpoint
//       const authResponse = await axiosInstance.post('/auth/wallet/verify', {
//         address,
//         signature,
//         message
//       });
      
//       if (authResponse.data.success) {
//         // Save token to localStorage
//         const userData = {
//           user: authResponse.data.user,
//           token: authResponse.data.token,
//           expiresAt: authResponse.data.expiresAt,
//         };
//         localStorage.setItem('userData', JSON.stringify(userData));
//         localStorage.setItem('authToken', authResponse.data.token);
        
//         toast.success('Wallet authentication successful!');
//         onLoginSuccess?.();
//         onClose();
//       } else {
//         toast.error(authResponse.data.message);
//       }
//     } catch (error: any) {
//       toast.error(error.response?.data?.message || 'Wallet authentication failed');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="max-w-md mx-auto p-6 text-white">
//       {step === 'email' ? (
//         <form onSubmit={handleSendOTP} className="space-y-4">
//           <h2 className="text-xl font-bold">Enter Email</h2>
//           <input
//             type="email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             placeholder="Enter your email"
//             className="w-full p-3 bg-gray-800 border border-gray-600 rounded"
//             required
//           />
//           <button
//             type="submit"
//             disabled={isLoading}
//             className="w-full bg-yellow-500 text-black py-3 rounded font-semibold"
//           >
//             {isLoading ? 'Sending...' : 'Send OTP'}
//           </button>
          
//           <div className="text-center my-4">--- OR ---</div>
          
//           <button
//             type="button"
//             onClick={handleWalletAuth}
//             disabled={!isConnected || isLoading}
//             className="w-full bg-green-500 text-white py-3 rounded font-semibold"
//           >
//             {isLoading ? 'Authenticating...' : 'Sign with Wallet'}
//           </button>
//         </form>
//       ) : (
//         <form onSubmit={handleVerifyOTP} className="space-y-4">
//           <h2 className="text-xl font-bold">Enter 6-Digit Code</h2>
//           <p className="text-sm text-gray-400">
//             Check your email: {email}
//           </p>
//           <input
//             type="text"
//             value={otpCode}
//             onChange={(e) => setOtpCode(e.target.value)}
//             placeholder="123456"
//             maxLength={6}
//             className="w-full p-3 bg-gray-800 border border-gray-600 rounded text-center text-2xl tracking-widest"
//             required
//           />
//           <button
//             type="submit"
//             disabled={isLoading || otpCode.length !== 6}
//             className="w-full bg-yellow-500 text-black py-3 rounded font-semibold"
//           >
//             {isLoading ? 'Verifying...' : 'Verify OTP'}
//           </button>
//           <button
//             type="button"
//             onClick={() => setStep('email')}
//             className="w-full bg-gray-600 text-white py-2 rounded"
//           >
//             Back to Email
//           </button>
//         </form>
//       )}
//     </div>
//   );
// };

// export default DirectAPIAuthModal