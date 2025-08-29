// app/page.js
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* 배경 이미지 */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(https://images.unsplash.com/photo-1519575706483-4ab6ad752118?q=80&w=2670&auto=format&fit=crop)`,
        }}
      >
        <div className="absolute inset-0 bg-black opacity-50"></div>
      </div>

      {/* 콘텐츠 */}
      <div className="relative z-10 text-center text-white p-8">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-4 animate-fade-in-down">
          Find Your Connection
        </h1>
        <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8 animate-fade-in-up">
          새로운 인연을 만나는 가장 확실한 방법. 지금 바로 시작하여 당신의 특별한 사람을 찾아보세요.
        </p>
        <div className="flex justify-center gap-4 animate-fade-in">
          <Link href="/login">
            <button className="bg-white text-black font-bold py-3 px-8 rounded-full text-lg hover:bg-gray-200 transition-transform transform hover:scale-105 duration-300">
              로그인
            </button>
          </Link>
          <Link href="/signup">
            <button className="bg-pink-500 text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-pink-600 transition-transform transform hover:scale-105 duration-300">
              회원가입
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
