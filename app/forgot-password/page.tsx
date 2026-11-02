import Link from "next/link";
import { PasswordResetForm } from "@/components/password-reset-form";
export const metadata={title:"Forgot Password"};
export default function ForgotPasswordPage(){return <section className="grid min-h-[70vh] place-items-center px-5 py-16"><div className="card w-full max-w-md p-8"><span className="eyebrow">Account security</span><h1 className="mt-4 text-3xl font-bold">Reset your password.</h1><p className="mb-8 mt-3 text-sm leading-7 text-[#68756a]">Enter the email address on your AgroBridge account. If it exists, we’ll send a time-limited reset link.</p><PasswordResetForm/><Link href="/login" className="mt-6 block text-center text-sm font-semibold text-[#1b5e20]">Return to sign in</Link></div></section>}
