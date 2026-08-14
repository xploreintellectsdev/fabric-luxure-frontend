"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useWishlist } from "../../context/wishlistContext";
import { useCart } from "../../context/cartContext";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";

export default function SignInHero() {
  const router = useRouter();
  const { syncGuestWishlist } = useWishlist();
  const { mergeGuestCart } = useCart();

  // "signin" | "signup" | "forgot_password"
  const [step, setStep] = useState("signin");

  // Form Fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");

  // OTP State
  const [otpSent, setOtpSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const queryEmail = params.get("email");
      if (params.get("step") === "signup" || params.get("signup") === "true" || queryEmail) {
        setStep("signup");
      }
      if (queryEmail) {
        setEmail(queryEmail);
      }
    }
  }, []);

  const handleGoogleSuccess = async (credentialResponse: any) => {
    const credential = credentialResponse.credential;
    if (!credential) return;

    setIsProcessing(true);
    setErrorMsg("");
    setSuccessMsg("Authenticating with Google...");

    try {
      const res = await fetch(`${backendUrl}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || "Google authentication failed.");

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      await syncGuestWishlist();
      await mergeGuestCart(data.token);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("auth-change"));
      }
      setSuccessMsg("Logged in successfully! Redirecting...");

      setTimeout(() => {
        router.push("/profile");
      }, 1000);
    } catch (error: any) {
      console.error("❌ Google Auth Error:", error);
      setErrorMsg(error.message);
      setSuccessMsg("");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setIsProcessing(true);

    try {
      const res = await fetch(`${backendUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed.");

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      await syncGuestWishlist();
      await mergeGuestCart(data.token);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("auth-change"));
      }
      setSuccessMsg("Logged in successfully! Redirecting...");

      setTimeout(() => {
        router.push("/profile");
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEmailVerified) return;
    setErrorMsg("");
    setSuccessMsg("");

    if (!/^\d{10}$/.test(mobile)) {
      setErrorMsg("Mobile number must be exactly 10 digits.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch(`${backendUrl}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, mobile, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed.");

      setSuccessMsg("Registration successful! Redirecting to login...");
      setTimeout(() => {
        resetState();
        setStep("signin");
        setEmail(email);
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendOtp = async (purpose: "signup" | "forgot_password") => {
    setErrorMsg("");
    setSuccessMsg("");
    setIsProcessing(true);
    try {
      const res = await fetch(`${backendUrl}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, purpose }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send OTP.");

      setOtpSent(true);
      setSuccessMsg("OTP has been sent to your email. Please check your inbox.");
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyOtp = async (purpose: "signup" | "forgot_password") => {
    setErrorMsg("");
    setSuccessMsg("");
    setIsProcessing(true);
    try {
      const res = await fetch(`${backendUrl}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, purpose }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid OTP.");

      setIsEmailVerified(true);
      setSuccessMsg("Email verified successfully.");
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch(`${backendUrl}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Password reset failed.");

      setSuccessMsg("Password Updated Successfully.");
      setTimeout(() => {
        resetState();
        setStep("signin");
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsProcessing(false);
    }
  };



  const resetState = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setFirstName("");
    setLastName("");
    setMobile("");
    setOtp("");
    setOtpSent(false);
    setIsEmailVerified(false);
    setErrorMsg("");
    setSuccessMsg("");
  };

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
    <section className="w-full min-h-screen bg-tertiary flex items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-hidden">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-brown/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-bg-blue/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-bg-light-blue/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] p-6 sm:p-8 flex flex-col relative z-10 transition-all duration-300 hover:border-brown/30 hover:shadow-[0_8px_32px_0_rgba(211,183,151,0.15)]">

        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-white rounded-full p-1.5 border border-white flex items-center justify-center filter drop-shadow-sm hover:scale-105 transition-transform duration-300">
            <Image
              src="/images/FL New Logo Final.png"
              alt="Fabric Luxure Logo"
              width={80}
              height={80}
              priority
              className="w-full h-full object-contain select-none pointer-events-none"
            />
          </div>
        </div>

        {step === "signin" && (
          <>
            <div className="text-center mb-6">
              <h1 className="font-instrumentserif text-3xl sm:text-4xl leading-tight uppercase text-light tracking-wide scale-y-110">Sign In</h1>
              <p className="mt-2 text-xs sm:text-sm text-Pinball tracking-wide">Welcome back to Fabric Luxure.</p>
            </div>

            <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required disabled={isProcessing} className="w-full px-4 py-3 text-sm placeholder:text-Pinball/40 text-light rounded-lg border border-white/10 bg-tertiary/60 focus:outline-none focus:border-brown focus:ring-1 focus:ring-brown/50 transition-all" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required disabled={isProcessing} className="w-full px-4 py-3 text-sm placeholder:text-Pinball/40 text-light rounded-lg border border-white/10 bg-tertiary/60 focus:outline-none focus:border-brown focus:ring-1 focus:ring-brown/50 transition-all" />

              <div className="flex justify-end">
                <button type="button" onClick={() => { resetState(); setStep("forgot_password"); }} className="text-xs text-Pinball hover:text-brown transition-colors">Forgot Password?</button>
              </div>

              {errorMsg && <p className="text-red-400 text-xs mt-1 font-mono bg-red-950/20 border border-red-500/20 px-3 py-1.5 rounded">{errorMsg}</p>}
              {successMsg && <p className="text-emerald-400 text-xs mt-1 font-mono bg-emerald-950/20 border border-emerald-500/20 px-3 py-1.5 rounded">{successMsg}</p>}

              <button type="submit" disabled={isProcessing} className="h-[46px] w-full bg-brown text-tertiary text-xs uppercase tracking-widest rounded-lg font-bold hover:bg-lightbrown/90 active:scale-[0.98] disabled:opacity-50 transition-all shadow-md">Sign In</button>

              <div className="text-center mt-2">
                <span className="text-xs text-Pinball">Don't have an account? </span>
                <button type="button" onClick={() => { resetState(); setStep("signup"); }} className="text-xs text-brown underline underline-offset-4 hover:text-light tracking-wider uppercase font-mono transition-colors">Create an account</button>
              </div>
            </form>
          </>
        )}

        {step === "signup" && (
          <>
            <div className="text-center mb-6">
              <h1 className="font-instrumentserif text-3xl sm:text-4xl leading-tight uppercase text-light tracking-wide scale-y-110">Create Your Account</h1>
              <p className="mt-2 text-xs sm:text-sm text-Pinball tracking-wide">Join Fabric Luxure to start shopping.</p>
            </div>

            <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First Name" required disabled={isProcessing || isEmailVerified} className="w-full px-4 py-3 text-sm placeholder:text-Pinball/40 text-light rounded-lg border border-white/10 bg-tertiary/60 focus:outline-none focus:border-brown disabled:opacity-50 transition-all" />
                <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last Name" required disabled={isProcessing || isEmailVerified} className="w-full px-4 py-3 text-sm placeholder:text-Pinball/40 text-light rounded-lg border border-white/10 bg-tertiary/60 focus:outline-none focus:border-brown disabled:opacity-50 transition-all" />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required disabled={isProcessing || isEmailVerified || otpSent} className="w-full px-4 py-3 text-sm placeholder:text-Pinball/40 text-light rounded-lg border border-white/10 bg-tertiary/60 focus:outline-none focus:border-brown disabled:opacity-50 transition-all" />
                  {!isEmailVerified && !otpSent && (
                    <button type="button" onClick={() => email && handleSendOtp("signup")} disabled={isProcessing || !email} className="px-4 bg-white/10 text-white text-xs uppercase rounded-lg hover:bg-white/20 disabled:opacity-50 transition-all border border-white/20">Verify</button>
                  )}
                </div>

                {!isEmailVerified && otpSent && (
                  <div className="flex gap-2 animate-in fade-in slide-in-from-top-2">
                    <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter OTP" maxLength={6} disabled={isProcessing} className="w-full px-4 py-3 text-sm placeholder:text-Pinball/40 text-light rounded-lg border border-white/10 bg-tertiary/60 focus:outline-none focus:border-brown disabled:opacity-50 transition-all text-center tracking-widest font-mono" />
                    <button type="button" onClick={() => handleVerifyOtp("signup")} disabled={isProcessing || !otp} className="px-4 bg-brown text-tertiary font-bold text-xs uppercase rounded-lg hover:bg-lightbrown/90 disabled:opacity-50 transition-all">Verify OTP</button>
                  </div>
                )}
                {!isEmailVerified && otpSent && (
                  <button type="button" onClick={() => handleSendOtp("signup")} disabled={isProcessing} className="text-xs text-brown text-right hover:text-light transition-colors">Resend OTP</button>
                )}
              </div>

              <input type="tel" value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="Mobile (10 digits)" required disabled={isProcessing || !isEmailVerified} className="w-full px-4 py-3 text-sm placeholder:text-Pinball/40 text-light rounded-lg border border-white/10 bg-tertiary/60 focus:outline-none focus:border-brown disabled:opacity-50 transition-all" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password (min 6 characters)" required disabled={isProcessing || !isEmailVerified} className="w-full px-4 py-3 text-sm placeholder:text-Pinball/40 text-light rounded-lg border border-white/10 bg-tertiary/60 focus:outline-none focus:border-brown disabled:opacity-50 transition-all" />

              {errorMsg && <p className="text-red-400 text-xs mt-1 font-mono bg-red-950/20 border border-red-500/20 px-3 py-1.5 rounded">{errorMsg}</p>}
              {successMsg && <p className="text-emerald-400 text-xs mt-1 font-mono bg-emerald-950/20 border border-emerald-500/20 px-3 py-1.5 rounded">{successMsg}</p>}

              <button type="submit" disabled={isProcessing || !isEmailVerified} className="h-[46px] w-full bg-brown text-tertiary text-xs uppercase tracking-widest rounded-lg font-bold hover:bg-lightbrown/90 active:scale-[0.98] disabled:opacity-50 transition-all shadow-md">Register</button>

              <div className="text-center mt-2">
                <span className="text-xs text-Pinball">Already have an account? </span>
                <button type="button" onClick={() => { resetState(); setStep("signin"); }} className="text-xs text-brown underline underline-offset-4 hover:text-light tracking-wider uppercase font-mono transition-colors">Sign In</button>
              </div>
            </form>
          </>
        )}

        {step === "forgot_password" && (
          <>
            <div className="text-center mb-6">
              <h1 className="font-instrumentserif text-3xl sm:text-4xl leading-tight uppercase text-light tracking-wide scale-y-110">Reset Password</h1>
              <p className="mt-2 text-xs sm:text-sm text-Pinball tracking-wide">Enter your email to receive an OTP.</p>
            </div>

            <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
              <div className="flex gap-2">
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email Address" required disabled={isProcessing || isEmailVerified || otpSent} className="w-full px-4 py-3 text-sm placeholder:text-Pinball/40 text-light rounded-lg border border-white/10 bg-tertiary/60 focus:outline-none focus:border-brown disabled:opacity-50 transition-all" />
                {!isEmailVerified && !otpSent && (
                  <button type="button" onClick={() => email && handleSendOtp("forgot_password")} disabled={isProcessing || !email} className="px-4 bg-white/10 text-white text-xs uppercase rounded-lg hover:bg-white/20 disabled:opacity-50 transition-all border border-white/20 whitespace-nowrap">Send OTP</button>
                )}
              </div>

              {!isEmailVerified && otpSent && (
                <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-2">
                  <div className="flex gap-2">
                    <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter OTP" maxLength={6} disabled={isProcessing} className="w-full px-4 py-3 text-sm placeholder:text-Pinball/40 text-light rounded-lg border border-white/10 bg-tertiary/60 focus:outline-none focus:border-brown disabled:opacity-50 transition-all text-center tracking-widest font-mono" />
                    <button type="button" onClick={() => handleVerifyOtp("forgot_password")} disabled={isProcessing || !otp} className="px-4 bg-brown text-tertiary font-bold text-xs uppercase rounded-lg hover:bg-lightbrown/90 disabled:opacity-50 transition-all whitespace-nowrap">Verify OTP</button>
                  </div>
                  <button type="button" onClick={() => handleSendOtp("forgot_password")} disabled={isProcessing} className="text-xs text-brown text-right hover:text-light transition-colors">Resend OTP</button>
                </div>
              )}

              {isEmailVerified && (
                <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-top-2">
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New Password" required disabled={isProcessing} className="w-full px-4 py-3 text-sm placeholder:text-Pinball/40 text-light rounded-lg border border-white/10 bg-tertiary/60 focus:outline-none focus:border-brown disabled:opacity-50 transition-all" />
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm New Password" required disabled={isProcessing} className="w-full px-4 py-3 text-sm placeholder:text-Pinball/40 text-light rounded-lg border border-white/10 bg-tertiary/60 focus:outline-none focus:border-brown disabled:opacity-50 transition-all" />
                  <button type="submit" disabled={isProcessing || !password} className="h-[46px] w-full bg-brown text-tertiary text-xs uppercase tracking-widest rounded-lg font-bold hover:bg-lightbrown/90 active:scale-[0.98] disabled:opacity-50 transition-all shadow-md">Reset Password</button>
                </div>
              )}

              {errorMsg && <p className="text-red-400 text-xs mt-1 font-mono bg-red-950/20 border border-red-500/20 px-3 py-1.5 rounded">{errorMsg}</p>}
              {successMsg && <p className="text-emerald-400 text-xs mt-1 font-mono bg-emerald-950/20 border border-emerald-500/20 px-3 py-1.5 rounded">{successMsg}</p>}

              <div className="text-center mt-2">
                <button type="button" onClick={() => { resetState(); setStep("signin"); }} className="text-xs text-brown underline underline-offset-4 hover:text-light tracking-wider uppercase font-mono transition-colors">Back to Sign In</button>
              </div>
            </form>
          </>
        )}

        {(step === "signin" || step === "signup") && (
          <>
            <div className="flex items-center justify-center my-5 select-none">
              <div className="flex-1 border-t border-white/10" />
              <span className="px-3 text-[10px] uppercase text-Pinball/60 tracking-widest font-mono">OR</span>
              <div className="flex-1 border-t border-white/10" />
            </div>

            <div className="w-full flex justify-center mt-2 pointer-events-auto">
              {!isProcessing && (
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setErrorMsg("Google authentication failed.")}
                  theme="filled_black"
                  shape="rectangular"
                  text="continue_with"
                  size="large"
                />
              )}
            </div>
          </>
        )}
      </div>
    </section>
    </GoogleOAuthProvider>
  );
}
