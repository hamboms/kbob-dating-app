// app/login/page.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/users');
      } else {
        setError(data.error || '로그인에 실패했습니다.');
      }
    } catch (err) {
      setError('로그인 중 오류가 발생했습니다.');
      console.error('Login error:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="relative flex flex-col m-6 space-y-8 bg-white shadow-2xl rounded-2xl md:flex-row md:space-y-0">
            {/* Left Side */}
            <div className="flex flex-col justify-center p-8 md:p-14">
                <span className="mb-3 text-4xl font-bold">Welcome back</span>
                <span className="font-light text-gray-400 mb-8">
                    Welcome back! Please enter your details
                </span>
                <form onSubmit={handleSubmit}>
                    <div className="py-4">
                        <span className="mb-2 text-md">Email</span>
                        <input
                            type="email"
                            className="w-full p-2 border border-gray-300 rounded-md placeholder:font-light placeholder:text-gray-500"
                            name="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="py-4">
                        <span className="mb-2 text-md">Password</span>
                        <input
                            type="password"
                            name="pass"
                            id="pass"
                            className="w-full p-2 border border-gray-300 rounded-md placeholder:font-light placeholder:text-gray-500"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-black text-white p-2 rounded-lg mb-6 hover:bg-white hover:text-black hover:border hover:border-gray-300"
                    >
                        Sign in
                    </button>
                </form>
                {error && <p className="mt-4 text-center text-sm text-red-600">{error}</p>}
                <div className="text-center text-gray-400">
                    Dont'have an account?
                    <Link href="/signup" className="font-bold text-black"> Sign up for free</Link>
                </div>
            </div>
            {/* Right Side */}
            <div className="relative">
                <img
                    src="https://images.unsplash.com/photo-1527719327859-c6ce80353573?q=80&w=2564&auto=format&fit=crop"
                    alt="img"
                    className="w-[400px] h-full hidden rounded-r-2xl md:block object-cover"
                />
            </div>
        </div>
    </div>
  );
}
