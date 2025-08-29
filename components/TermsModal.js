// components/TermsModal.js
'use client';

export default function TermsModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">이용약관</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
        </div>
        <div className="p-6 overflow-y-auto space-y-4">
          <div>
            <h3 className="font-bold mb-2">제1조 (목적)</h3>
            <p className="text-sm text-gray-600">본 약관은 [회사명] (이하 "회사")가 제공하는 소개팅 애플리케이션 서비스(이하 "서비스")의 이용과 관련하여 회사와 회원 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.</p>
          </div>
          <div>
            <h3 className="font-bold mb-2">제2조 (용어의 정의)</h3>
            <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
              <li><strong>서비스:</strong> 회사가 제공하는 온라인 기반의 회원 간 소개 및 소통 플랫폼을 의미합니다.</li>
              <li><strong>회원:</strong> 본 약관에 따라 회사와 이용계약을 체결하고 회사가 제공하는 서비스를 이용하는 고객을 의미합니다.</li>
              <li><strong>계정:</strong> 회원의 식별과 서비스 이용을 위하여 회원이 선정하고 회사가 부여하는 이메일 주소와 비밀번호의 조합을 의미합니다.</li>
              <li><strong>콘텐츠:</strong> 회원이 서비스에 게시하거나 등록하는 프로필 사진, 자기소개, 메시지 등 모든 정보와 자료를 의미합니다.</li>
            </ol>
          </div>
          <div>
            <h3 className="font-bold mb-2">제3조 (회원가입 및 자격)</h3>
            <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
              <li>본 서비스는 만 19세 이상의 성인만 가입하고 이용할 수 있습니다.</li>
              <li>회원은 가입 신청 시 정확하고 사실에 입각한 정보(이름, 나이, 성별 등)를 제공해야 하며, 허위 정보를 기재하여 발생하는 모든 책임은 회원 본인에게 있습니다.</li>
              <li>회원은 자신의 계정 정보를 안전하게 관리할 책임이 있으며, 계정 정보 유출로 인한 피해에 대해 회사는 책임을 지지 않습니다.</li>
            </ol>
          </div>
          <div>
            <h3 className="font-bold mb-2">제4조 (회원의 의무 및 금지 행위)</h3>
            <p className="mb-2 text-sm text-gray-600">회원은 다음 각 호에 해당하는 행위를 하여서는 안 됩니다. 위반 시 회사는 사전 통보 없이 해당 콘텐츠를 삭제하거나 회원의 서비스 이용을 제한 또는 정지시킬 수 있습니다.</p>
            <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
              <li>타인에게 성적 수치심이나 불쾌감을 유발하는 외설적인 콘텐츠(사진, 메시지 등)를 게시하는 행위</li>
              <li>타인을 비방, 모욕하거나 명예를 훼손하는 행위</li>
              <li>타인의 개인정보를 무단으로 수집, 공개 또는 유포하는 행위</li>
              <li>사기, 금전 요구, 영업 활동 등 불순한 목적으로 서비스를 이용하는 행위</li>
              <li>욕설, 폭력적인 언어 사용 등 다른 회원에게 불쾌감을 주는 행위</li>
              <li>허위 프로필을 사용하거나 타인을 사칭하는 행위</li>
              <li>기타 현행법령 및 사회상규에 위배되는 모든 행위</li>
            </ol>
          </div>
          <div>
            <h3 className="font-bold mb-2">제5조 (콘텐츠의 책임과 권리)</h3>
             <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
              <li>회원이 서비스 내에 게시한 모든 콘텐츠에 대한 책임은 전적으로 회원 본인에게 있습니다. 회원은 자신이 게시한 콘텐츠가 제3자의 저작권, 초상권 등 지적재산권을 침해하지 않음을 보증해야 합니다.</li>
              <li>회원이 게시한 콘텐츠로 인해 발생하는 모든 법적 분쟁 및 손해에 대하여 회사는 면책되며, 모든 책임은 해당 회원에게 귀속됩니다.</li>
              <li>회사는 부적절하다고 판단되는 콘텐츠를 사전 통보 없이 삭제하거나 비공개 처리할 권리를 가집니다.</li>
            </ol>
          </div>
          <div>
            <h3 className="font-bold mb-2">제6조 (회사의 면책)</h3>
            <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
              <li>회사는 회원 간의 만남이나 교류 과정에서 발생하는 어떠한 문제(사기, 범죄, 감정적 피해 등)에 대해서도 직접적인 책임을 지지 않습니다. 모든 상호작용에 대한 판단과 책임은 회원 본인에게 있습니다.</li>
              <li>회사는 회원이 서비스에 제공한 정보의 정확성이나 신뢰도를 보증하지 않습니다.</li>
              <li>천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.</li>
            </ol>
          </div>
          <div>
            <h3 className="font-bold mb-2">제7조 (채팅 및 데이터 관리)</h3>
            <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
              <li>회원 간의 원활한 소통을 위해 채팅 메시지는 서버에 저장됩니다.</li>
              <li>매칭된 회원 중 어느 한쪽이라도 채팅방을 나갈 경우, 해당 채팅방의 모든 대화 기록은 서버에서 영구적으로 삭제되며 복구할 수 없습니다.</li>
              <li>회사는 회원의 대화 내용을 보관할 의무가 없으며, 대화 기록의 손실에 대해 책임을 지지 않습니다.</li>
            </ol>
          </div>
          <div>
            <h3 className="font-bold mb-2">제8조 (약관의 개정)</h3>
            <p className="text-sm text-gray-600">회사는 필요한 경우 관련 법령에 위배되지 않는 범위에서 본 약관을 개정할 수 있습니다. 개정된 약관은 서비스 내 공지를 통해 효력이 발생합니다.</p>
          </div>
        </div>
        <div className="p-4 border-t text-right">
          <button onClick={onClose} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">닫기</button>
        </div>
      </div>
    </div>
  );
}

