'use client';

interface DeleteConfirmDialogProps {
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmDialog({ onClose, onConfirm }: DeleteConfirmDialogProps) {
  return (
    <>
      <div className="absolute inset-0 bg-black/50 z-[510]" onClick={onClose} />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white rounded-xl shadow-2xl z-[520] overflow-hidden">
        <div className="p-6 text-center">
          <div className="flex flex-col items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Are you sure want to delete area?</h3>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button onClick={onConfirm} className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
              Delete
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
