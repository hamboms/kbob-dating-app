// app/profile/edit/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function EditProfilePage() {
  const [formData, setFormData] = useState({ name: '', age: '', bio: '', gender: '' });
  const [profileImage, setProfileImage] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/profile');
        if (!response.ok) throw new Error('프로필 정보를 불러오는데 실패했습니다.');
        const data = await response.json();
        setFormData({
          name: data.name || '',
          age: data.age || '',
          bio: data.bio || '',
          gender: data.gender || '', // 성별 정보 추가
        });
        setCurrentImageUrl(data.profileImage || '');
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setProfileImage(e.target.files[0]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    const data = new FormData();
    data.append('name', formData.name);
    data.append('age', formData.age);
    data.append('bio', formData.bio);
    data.append('gender', formData.gender); // 성별 정보 추가
    if (profileImage) {
      data.append('profileImage', profileImage);
    }

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        body: data,
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || '프로필 업데이트에 실패했습니다.');
      
      setSuccess('프로필이 성공적으로 업데이트되었습니다!');
      setTimeout(() => {
        router.push('/profile');
        router.refresh();
      }, 2000);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !formData.name) {
    return <div className="min-h-screen flex items-center justify-center">로딩 중...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center py-12">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-2xl w-full">
        <h1 className="text-2xl font-bold text-center mb-6">프로필 수정</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">프로필 사진</label>
            {currentImageUrl && <img src={currentImageUrl} alt="Current profile" className="w-32 h-32 rounded-full object-cover mb-4" />}
            <input type="file" onChange={handleFileChange} accept="image/*" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
          </div>
          <div>
            <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">이름</label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className="input-field" required />
          </div>
          {/* 성별 선택 필드 추가 */}
          <div>
            <label htmlFor="gender" className="block text-gray-700 text-sm font-bold mb-2">성별</label>
            <select id="gender" name="gender" value={formData.gender} onChange={handleChange} className="input-field" required>
              <option value="">선택하세요</option>
              <option value="male">남성</option>
              <option value="female">여성</option>
            </select>
          </div>
          <div>
            <label htmlFor="age" className="block text-gray-700 text-sm font-bold mb-2">나이</label>
            <input type="number" id="age" name="age" value={formData.age} onChange={handleChange} className="input-field" required />
          </div>
          <div>
            <label htmlFor="bio" className="block text-gray-700 text-sm font-bold mb-2">자기소개</label>
            <textarea id="bio" name="bio" value={formData.bio} onChange={handleChange} className="input-field" rows="5"></textarea>
          </div>
          
          <div className="flex items-center justify-end space-x-4 pt-4">
            <Link href="/profile" className="text-gray-600 hover:text-gray-800 font-medium">취소</Link>
            <button type="submit" disabled={isLoading} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400">
              {isLoading ? '저장 중...' : '저장하기'}
            </button>
          </div>
        </form>
        {error && <p className="mt-4 text-center text-sm text-red-600">{error}</p>}
        {success && <p className="mt-4 text-center text-sm text-green-600">{success}</p>}
      </div>
      <style jsx>{`.input-field { box-shadow: inset 0 1px 2px rgba(0,0,0,0.07); appearance: none; border-radius: 0.375rem; border: 1px solid #d1d5db; width: 100%; padding: 0.5rem 0.75rem; color: #374151; }`}</style>
    </div>
  );
}
