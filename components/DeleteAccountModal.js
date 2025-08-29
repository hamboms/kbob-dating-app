'use client';

import React from 'react';

export default function DeleteAccountModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8 max-w-sm w-full mx-4">
        <h2 className="text-xl font-bold text-gray-800 mb-4">정말로 탈퇴하시겠습니까?</h2>
        <p className="text-gray-600 mb-6">
          이 작업은 되돌릴 수 없습니다. 회원님의 계정과 모든 활동 기록(프로필, 매치, 채팅 내역 등)이 영구적으로 삭제됩니다.
        </p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            탈퇴 확인
          </button>
        </div>
      </div>
    </div>
  );
}

