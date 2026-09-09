import React, { useEffect, useState } from 'react';
import { LogOut, X, AlertTriangle, ShieldCheck, Heart } from 'lucide-react';

interface SignOutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  userDisplayName?: string;
  userEmail?: string;
  userRole?: string;
}

export const SignOutConfirmModal: React.FC<SignOutConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  userDisplayName,
  userEmail,
  userRole,
}) => {
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSigningOut) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSigningOut, onClose]);

  if (!isOpen) return null;

  const handleConfirmSignOut = async () => {
    setIsSigningOut(true);
    try {
      await onConfirm();
    } catch (err) {
      console.error('Error during sign out:', err);
    } finally {
      setIsSigningOut(false);
      onClose();
    }
  };

  const roleLabel = {
    learner: 'Learner',
    mentor: 'Mentor / Therapist',
    ngo: 'NGO Representative',
    admin: 'Administrator',
  }[userRole || 'learner'] || 'Learner';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="signout-dialog-title"
      aria-describedby="signout-dialog-desc"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={() => {
        if (!isSigningOut) onClose();
      }}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border-2 border-rose-100 p-6 md:p-7 space-y-5 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          id="btn-close-signout-modal"
          onClick={onClose}
          disabled={isSigningOut}
          aria-label="Cancel and close dialog"
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Visual Badge & Header */}
        <div className="flex flex-col items-center text-center space-y-3 pt-2">
          <div className="w-16 h-16 rounded-3xl bg-rose-50 border-2 border-rose-200 flex items-center justify-center text-rose-600 shadow-inner">
            <LogOut className="w-8 h-8 ml-0.5" />
          </div>

          <div>
            <h2
              id="signout-dialog-title"
              className="text-xl md:text-2xl font-black text-slate-900 tracking-tight"
            >
              Sign Out of LearnBuddy?
            </h2>
            <p
              id="signout-dialog-desc"
              className="text-sm text-slate-600 mt-1.5 leading-relaxed"
            >
              Are you sure you want to sign out? You will be safely returned to the welcome landing page.
            </p>
          </div>
        </div>

        {/* User Status Card & Progress Reassurance */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-2 text-left">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Active Account
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
              <ShieldCheck className="w-3 h-3 text-teal-600" />
              <span>{roleLabel}</span>
            </span>
          </div>

          <div className="font-extrabold text-sm text-slate-800 truncate">
            {userDisplayName || userEmail || 'LearnBuddy User'}
          </div>

          {userEmail && userDisplayName && (
            <div className="text-xs text-slate-500 truncate">{userEmail}</div>
          )}

          <div className="pt-2 border-t border-slate-200/60 flex items-center gap-2 text-xs text-emerald-700 font-medium">
            <Heart className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>All your coins, stars, completed lessons, and settings remain securely saved.</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row gap-2.5 pt-2">
          {/* Cancel / Stay Signed In */}
          <button
            id="btn-cancel-signout"
            onClick={onClose}
            disabled={isSigningOut}
            className="flex-1 py-3 px-4 rounded-2xl font-bold text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all text-center disabled:opacity-50 min-h-[48px] flex items-center justify-center"
          >
            Stay Signed In
          </button>

          {/* Confirm Sign Out */}
          <button
            id="btn-confirm-signout"
            onClick={handleConfirmSignOut}
            disabled={isSigningOut}
            className="flex-1 py-3 px-4 rounded-2xl font-black text-sm text-white bg-rose-600 hover:bg-rose-700 active:scale-95 shadow-md shadow-rose-200 transition-all text-center flex items-center justify-center gap-2 disabled:opacity-50 min-h-[48px]"
          >
            <LogOut className="w-4 h-4" />
            <span>{isSigningOut ? 'Signing out...' : 'Yes, Sign Out'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
