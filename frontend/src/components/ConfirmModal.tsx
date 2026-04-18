import React from 'react';

export const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }: { isOpen: boolean, onClose: () => void, onConfirm: () => void, title: string, message: string }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 transform transition-all animate-in fade-in zoom-in duration-200">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-600 mb-6">{message}</p>
                <div className="flex justify-end gap-3">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={() => { onConfirm(); onClose(); }}
                        className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
}
