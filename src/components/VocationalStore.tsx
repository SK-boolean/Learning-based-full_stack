import React, { useState } from 'react';
import { 
  X, 
  Store, 
  Volume2, 
  CheckCircle2, 
  Receipt, 
  Coins, 
  Sparkles, 
  UserCheck, 
  ShoppingBag,
  Award,
  ArrowRight,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { BerryAvatar } from './BerryAvatar';
import { DwellButton } from './DwellButton';
import { playSuccessChime, playSoftClick, speakText } from '../utils/audio';

interface VocationalStoreProps {
  onClose: () => void;
  onEarnGems: (amount: number) => void;
  dwellEnabled?: boolean;
  soundEnabled?: boolean;
  isCpMode?: boolean;
}

export const VocationalStore: React.FC<VocationalStoreProps> = ({
  onClose,
  onEarnGems,
  dwellEnabled = false,
  soundEnabled = true,
  isCpMode = false
}) => {
  // Scenario: Customer wants:
  // 2 x Organic Apples @ ₹10 = ₹20
  // 1 x Fresh Milk @ ₹20 = ₹20
  // Total = ₹40
  // Customer gives a ₹50 note.
  // Change to return = ₹10.
  
  const [step, setStep] = useState<'greeting' | 'billing' | 'change' | 'receipt' | 'certificate'>('greeting');
  const [selectedPhrase, setSelectedPhrase] = useState<string | null>(null);
  const [enteredTotal, setEnteredTotal] = useState<number | null>(null);
  const [givenChange, setGivenChange] = useState<number>(0);
  const [hasError, setHasError] = useState(false);

  const orderItems = [
    { name: 'Crisp Apples', icon: '🍎', qty: 2, pricePer: 10, subtotal: 20 },
    { name: 'Fresh Milk', icon: '🥛', qty: 1, pricePer: 20, subtotal: 20 }
  ];
  const grandTotal = 40;
  const customerPaid = 50;
  const correctChange = 10;

  const handleSpeakPhrase = (phrase: string) => {
    setSelectedPhrase(phrase);
    speakText(phrase);
    if (soundEnabled) playSoftClick();
  };

  const handleConfirmGreeting = () => {
    if (!selectedPhrase) return;
    setStep('billing');
    if (soundEnabled) playSuccessChime();
  };

  const handleSelectTotal = (amt: number) => {
    setEnteredTotal(amt);
    if (amt === grandTotal) {
      setHasError(false);
      if (soundEnabled) playSuccessChime();
      setTimeout(() => setStep('change'), 600);
    } else {
      setHasError(true);
    }
  };

  const handleAddChangeCoin = (val: number) => {
    if (soundEnabled) playSoftClick();
    setGivenChange((prev) => prev + val);
  };

  const handleClearChange = () => {
    if (soundEnabled) playSoftClick();
    setGivenChange(0);
  };

  const handleConfirmChange = () => {
    if (givenChange === correctChange) {
      setHasError(false);
      if (soundEnabled) playSuccessChime();
      setStep('receipt');
      onEarnGems(50);
    } else {
      setHasError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 overflow-y-auto">
      <div className="bg-white border-2 border-amber-300 rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center text-2xl">
              🏪
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider bg-black/20 px-2 py-0.5 rounded-md">
                  Vocational Work Sandbox
                </span>
                <span className="text-xs text-amber-100 font-bold">Shift Simulator</span>
              </div>
              <h2 className="text-lg md:text-xl font-extrabold mt-0.5">
                Berry Kirana & Mart Checkout Counter
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 md:p-8">
          {/* Step 1: Customer Arrival & Professional Greeting */}
          {step === 'greeting' && (
            <div>
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6 flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-amber-200 flex items-center justify-center text-3xl flex-shrink-0">
                  👵
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-gray-900 text-base">Customer Priya Aunty</span>
                    <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                      At Your Counter
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm md:text-base font-medium italic">
                    "Namaste beta! I have 2 red apples and 1 milk packet. Can you prepare my bill?"
                  </p>
                </div>
              </div>

              <BerryAvatar
                mood="talking"
                message="Choose how you would like to greet Priya Aunty. You can use your own voice or let me speak for you!"
                size="md"
                soundEnabled={soundEnabled}
                className="mb-6"
              />

              <div className="space-y-3 mb-6">
                {[
                  "Namaste Aunty! Welcome, I will scan your items right away.",
                  "Hello! Good morning, let me calculate your total.",
                  "Namaste! Thank you for waiting, having a wonderful day?"
                ].map((phrase, idx) => {
                  const isSelected = selectedPhrase === phrase;
                  return (
                    <DwellButton
                      key={idx}
                      dwellEnabled={dwellEnabled}
                      soundEnabled={soundEnabled}
                      onClick={() => handleSpeakPhrase(phrase)}
                      isLargeCpTarget={isCpMode}
                      className={`w-full p-4 border-2 text-left rounded-2xl flex items-center justify-between transition-all ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-400/30 font-bold text-amber-950'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-gray-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">💬</span>
                        <span className="text-sm md:text-base">{phrase}</span>
                      </div>
                      <Volume2 className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    </DwellButton>
                  );
                })}
              </div>

              <div className="flex justify-end">
                <DwellButton
                  dwellEnabled={dwellEnabled}
                  soundEnabled={soundEnabled}
                  disabled={!selectedPhrase}
                  onClick={handleConfirmGreeting}
                  isLargeCpTarget={isCpMode}
                  className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-bold flex items-center gap-2 shadow-md disabled:opacity-40"
                >
                  <span>Begin Item Calculation</span>
                  <ArrowRight className="w-4 h-4" />
                </DwellButton>
              </div>
            </div>
          )}

          {/* Step 2: Item Calculation */}
          {step === 'billing' && (
            <div>
              <BerryAvatar
                mood="thinking"
                message="Look at the items in Aunty's basket. Let's add them up to find the Grand Total!"
                size="md"
                soundEnabled={soundEnabled}
                className="mb-6"
              />

              {/* Order Basket */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-6">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3">
                  Customer Basket Items
                </h4>
                <div className="space-y-3">
                  {orderItems.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{item.icon}</span>
                        <div>
                          <span className="font-bold text-gray-900 block text-sm">{item.name}</span>
                          <span className="text-xs text-gray-500">Qty: {item.qty} × ₹{item.pricePer} each</span>
                        </div>
                      </div>
                      <span className="font-extrabold text-teal-700 text-base">
                        ₹{item.subtotal}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                  <span className="font-bold text-gray-700">Calculate: ₹20 + ₹20 = ?</span>
                  <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2 py-1 rounded-md">
                    Target Total
                  </span>
                </div>
              </div>

              {hasError && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 mb-4 font-medium flex items-center gap-2">
                  <span>💡</span>
                  <span>Think about adding two ₹20 notes together: 20 + 20 is 40!</span>
                </div>
              )}

              {/* Total Choices */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[30, 40, 50].map((amt) => (
                  <DwellButton
                    key={amt}
                    dwellEnabled={dwellEnabled}
                    soundEnabled={soundEnabled}
                    onClick={() => handleSelectTotal(amt)}
                    isLargeCpTarget={isCpMode}
                    className={`p-4 border-2 rounded-2xl font-black text-xl text-center transition-all ${
                      enteredTotal === amt
                        ? amt === grandTotal
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                          : 'border-rose-400 bg-rose-50 text-rose-800'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-gray-800'
                    }`}
                  >
                    ₹{amt}
                  </DwellButton>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Change Calculation & Currency Counter */}
          {step === 'change' && (
            <div>
              <BerryAvatar
                mood="celebrate"
                message={`Priya Aunty hands you a ₹${customerPaid} note for a ₹${grandTotal} bill. Tap the coins below to return the correct change (₹10)!`}
                size="md"
                soundEnabled={soundEnabled}
                className="mb-6"
              />

              {/* Cash Register Till */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-xs text-gray-500 block">Customer Handed:</span>
                    <span className="text-xl font-extrabold text-gray-900">₹{customerPaid} Note 💵</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Total Bill:</span>
                    <span className="text-xl font-extrabold text-teal-700">₹{grandTotal}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Change in Till:</span>
                    <span className="text-xl font-black text-amber-600">₹{givenChange}</span>
                  </div>
                </div>

                {/* Coin Dispensers */}
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
                  Tap Coins / Notes to give change:
                </h4>
                <div className="grid grid-cols-4 gap-2.5 mb-3">
                  {[
                    { val: 1, label: '₹1 Coin', icon: '🪙' },
                    { val: 2, label: '₹2 Coin', icon: '🪙' },
                    { val: 5, label: '₹5 Coin', icon: '🪙' },
                    { val: 10, label: '₹10 Coin', icon: '🪙' }
                  ].map((c) => (
                    <DwellButton
                      key={c.val}
                      dwellEnabled={dwellEnabled}
                      soundEnabled={soundEnabled}
                      onClick={() => handleAddChangeCoin(c.val)}
                      isLargeCpTarget={isCpMode}
                      className="p-3 bg-white hover:bg-amber-50 border-2 border-slate-200 hover:border-amber-400 rounded-2xl text-center shadow-xs"
                    >
                      <span className="text-xl block">{c.icon}</span>
                      <span className="font-extrabold text-xs text-gray-900 block mt-0.5">+{c.label}</span>
                    </DwellButton>
                  ))}
                </div>

                <div className="flex justify-between items-center text-xs text-gray-500">
                  <button
                    onClick={handleClearChange}
                    className="text-rose-600 hover:text-rose-800 font-bold underline"
                  >
                    Reset Change to ₹0
                  </button>
                  <span className="font-medium">Needed: ₹10 (₹50 - ₹40)</span>
                </div>
              </div>

              {hasError && (
                <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-900 mb-4 font-medium flex items-center gap-2">
                  <span>⚠️</span>
                  <span>Currently you have given ₹{givenChange}. You need exactly ₹10 change. Tap 'Reset' and pick one ₹10 coin or two ₹5 coins!</span>
                </div>
              )}

              <div className="flex justify-end">
                <DwellButton
                  dwellEnabled={dwellEnabled}
                  soundEnabled={soundEnabled}
                  onClick={handleConfirmChange}
                  isLargeCpTarget={isCpMode}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold flex items-center gap-2 shadow-md"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Hand Change to Customer</span>
                </DwellButton>
              </div>
            </div>
          )}

          {/* Step 4: Printed Receipt & Earned Reward */}
          {step === 'receipt' && (
            <div className="text-center animate-in fade-in duration-300">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-emerald-100 border-2 border-emerald-300 text-3xl mb-3 shadow-inner">
                🧾
              </div>
              <h3 className="text-2xl font-black text-gray-900">
                Transaction Completed!
              </h3>
              <p className="text-sm text-gray-600 max-w-sm mx-auto mt-1 mb-6">
                Customer Priya Aunty smiled and thanked you for such neat, accurate service!
              </p>

              {/* Digital Kirana Receipt */}
              <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-5 max-w-sm mx-auto text-left mb-6 shadow-sm">
                <div className="text-center pb-3 border-b border-slate-200">
                  <div className="font-extrabold text-gray-900 text-base">BERRY KIRANA & MART</div>
                  <div className="text-[11px] text-gray-500 font-medium">Inclusive Checkout Station #1</div>
                </div>

                <div className="py-3 space-y-1.5 text-xs text-gray-700 border-b border-slate-200">
                  <div className="flex justify-between">
                    <span>2 × Apples @ ₹10</span>
                    <span className="font-bold">₹20</span>
                  </div>
                  <div className="flex justify-between">
                    <span>1 × Fresh Milk</span>
                    <span className="font-bold">₹20</span>
                  </div>
                </div>

                <div className="pt-3 space-y-1 text-xs">
                  <div className="flex justify-between font-extrabold text-sm text-gray-900">
                    <span>Grand Total:</span>
                    <span>₹40</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Cash Paid:</span>
                    <span>₹50</span>
                  </div>
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Change Returned:</span>
                    <span>₹10</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 text-center text-[11px] text-gray-500">
                  Served with pride by Berry Inclusive Associate ⭐
                </div>
              </div>

              <div className="flex justify-center gap-3">
                <DwellButton
                  dwellEnabled={dwellEnabled}
                  soundEnabled={soundEnabled}
                  onClick={() => setStep('certificate')}
                  isLargeCpTarget={isCpMode}
                  className="px-6 py-3.5 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-extrabold text-sm flex items-center gap-2 shadow-md"
                >
                  <Award className="w-5 h-5 text-amber-300" />
                  <span>View My Vocational Skill Badge & Certificate</span>
                </DwellButton>
              </div>
            </div>
          )}

          {/* Step 5: Official LearnBuddy Vocational Certificate & Employer Badge */}
          {step === 'certificate' && (
            <div className="text-center animate-in fade-in duration-300">
              <div className="bg-gradient-to-b from-amber-50 to-orange-50 border-4 border-amber-300 rounded-3xl p-6 md:p-8 max-w-lg mx-auto shadow-xl relative overflow-hidden mb-6">
                <div className="absolute top-2 right-2 opacity-10 text-8xl">🦆</div>
                
                <div className="flex items-center justify-center gap-2 mb-2">
                  <ShieldCheck className="w-6 h-6 text-teal-600" />
                  <span className="text-xs font-black uppercase tracking-widest text-teal-800">
                    LearnBuddy Verified Micro-Credential
                  </span>
                </div>

                <h3 className="text-2xl font-black text-gray-900 mb-1">
                  Certificate of Vocational Readiness
                </h3>
                <p className="text-xs text-gray-500 mb-4">
                  Problem Statement 207 • Smart Inclusive Education & Employment
                </p>

                <div className="w-20 h-20 rounded-full bg-amber-100 border-2 border-amber-400 mx-auto flex items-center justify-center text-4xl mb-4 shadow-md">
                  🪙
                </div>

                <div className="bg-white rounded-2xl p-4 border border-amber-200 text-left space-y-2 text-xs text-gray-700 mb-4">
                  <div className="flex justify-between">
                    <span className="font-bold">Credential:</span>
                    <span className="text-gray-900 font-extrabold">Retail Billing & Cashier Level 1</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold">Competency:</span>
                    <span className="text-emerald-700 font-bold">100% Currency Addition & Change Accuracy</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold">Mascot Mentor:</span>
                    <span className="text-teal-700 font-bold">Berry the Platypus AI Assistant</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold">Inclusive Employer Target:</span>
                    <span className="text-purple-700 font-bold">Lemon Tree, Amazon AHEAD, Local Marts</span>
                  </div>
                </div>

                <div className="text-[11px] text-gray-500 italic">
                  "Empowering neurodivergent individuals toward dignified financial independence."
                </div>
              </div>

              <div className="flex justify-center gap-3">
                <DwellButton
                  dwellEnabled={dwellEnabled}
                  soundEnabled={soundEnabled}
                  onClick={onClose}
                  isLargeCpTarget={isCpMode}
                  className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-bold flex items-center gap-2 shadow-md"
                >
                  <span>Return to Learning Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </DwellButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
