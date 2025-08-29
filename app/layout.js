// app/layout.js

// 전역 스타일시트를 가져옵니다.
import "./globals.css";

// 이 페이지의 메타데이터(예: 브라우저 탭에 표시되는 제목)를 설정합니다.
export const metadata = {
  title: "kbob",
  description: "Next.js와 MongoDB로 만드는 웹 기반 소개팅 앱",
};

// 모든 페이지를 감싸는 최상위 레이아웃 컴포넌트입니다.
export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        {/* page.js 파일의 내용이 이 위치에 렌더링됩니다. */}
        {children}
      </body>
    </html>
  );
}
