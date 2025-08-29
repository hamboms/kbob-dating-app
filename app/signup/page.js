// app/signup/page.js
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import TermsModal from '@/components/TermsModal';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');
  const [bio, setBio] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      setIsLoading(false);
      return;
    }

    if (!agreedToTerms) {
      setError('이용약관에 동의해주세요.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, age, gender, bio }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '회원가입에 실패했습니다.');
      }

      setSuccessMessage(data.message);
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setAge('');
      setGender('male');
      setBio('');
      setAgreedToTerms(false);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            계정 생성
          </h2>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
            {successMessage ? (
              <div className="text-center">
                <p className="text-green-600 font-semibold">{successMessage}</p>
                <p className="mt-2 text-sm text-gray-700">이제 로그인하여 kbob을 시작할 수 있습니다.</p>
                <Link href="/login" className="mt-4 inline-block w-full bg-black text-white font-bold py-2 px-4 rounded-md hover:bg-gray-800 text-center">
                    로그인 페이지로
                </Link>
              </div>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">이름</label>
                  <input id="name" name="name" type="text" required value={name} onChange={(e) => setName(e.target.value)} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"/>
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">이메일 주소</label>
                  <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"/>
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">비밀번호</label>
                  <input id="password" name="password" type="password" required minLength="6" value={password} onChange={(e) => setPassword(e.target.value)} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"/>
                </div>
                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">비밀번호 확인</label>
                  <input id="confirm-password" name="confirm-password" type="password" required minLength="6" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"/>
                </div>
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <label htmlFor="age" className="block text-sm font-medium text-gray-700">나이</label>
                    <input id="age" name="age" type="number" required value={age} onChange={(e) => setAge(e.target.value)} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"/>
                  </div>
                  <div className="flex-1">
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700">성별</label>
                    <select id="gender" name="gender" value={gender} onChange={(e) => setGender(e.target.value)} className="block w-full px-3 py-2 border border-gray-300 bg-white text-black rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                      <option value="male">남성</option>
                      <option value="female">여성</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700">자기소개</label>
                  <textarea id="bio" name="bio" rows="3" value={bio} onChange={(e) => setBio(e.target.value)} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"></textarea>
                </div>
                <div className="flex items-center">
                  <input id="terms" name="terms" type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"/>
                  <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                    <button type="button" onClick={() => setIsTermsModalOpen(true)} className="font-medium text-indigo-600 hover:text-indigo-500 underline">이용약관</button>에 동의합니다.
                  </label>
                </div>
                {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                <div>
                  <button type="submit" disabled={isLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:bg-gray-400">
                    {isLoading ? '가입 진행 중...' : '가입하기'}
                  </button>
                </div>
              </form>
            )}
            
            {!successMessage && (
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">이미 계정이 있으신가요?</span>
                  </div>
                </div>
                <div className="mt-6">
                  <Link href="/login" className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                    로그인
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {isTermsModalOpen && <TermsModal onClose={() => setIsTermsModalOpen(false)} />}
    </>
  );
}

