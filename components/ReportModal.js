    // components/ReportModal.js
    'use client';

    import { useState } from 'react';

    export default function ReportModal({ targetUserId, onClose, onSubmit }) {
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!reason) {
        alert('신고 사유를 선택해주세요.');
        return;
        }
        setIsSubmitting(true);
        await onSubmit(reason);
        setIsSubmitting(false);
    };

    const reasons = [
        '부적절한 프로필 사진',
        '불쾌감을 주는 메시지',
        '스팸 또는 사기 행위',
        '타인 사칭',
        '기타',
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-5 border-b">
            <h2 className="text-xl font-bold">사용자 신고하기</h2>
            </div>
            <div className="p-5 space-y-4">
            <p className="text-sm text-gray-600">신고 사유를 선택해주세요. 허위 신고 시 서비스 이용이 제한될 수 있습니다.</p>
            <div className="space-y-2">
                {reasons.map((r) => (
                <label key={r} className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                    type="radio"
                    name="reason"
                    value={r}
                    checked={reason === r}
                    onChange={(e) => setReason(e.target.value)}
                    className="mr-3"
                    />
                    {r}
                </label>
                ))}
            </div>
            </div>
            <div className="p-4 bg-gray-50 flex justify-end space-x-3">
            <button onClick={onClose} className="px-4 py-2 rounded text-gray-600 hover:bg-gray-200">취소</button>
            <button onClick={handleSubmit} disabled={isSubmitting || !reason} className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 disabled:bg-red-300">
                {isSubmitting ? '제출 중...' : '신고하기'}
            </button>
            </div>
        </div>
        </div>
    );
    }
