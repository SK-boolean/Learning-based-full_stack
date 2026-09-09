import React, { useState } from 'react';
import { 
  X, 
  Volume2, 
  HandMetal, 
  Sparkles, 
  Trash2, 
  Send, 
  Heart, 
  HelpCircle, 
  MessageSquare,
  Smile
} from 'lucide-react';
import { BerryAvatar } from './BerryAvatar';
import { DwellButton } from './DwellButton';
import { playSuccessChime, playSoftClick, speakText } from '../utils/audio';

interface AacBoardModalProps {
  onClose: () => void;
  dwellEnabled?: boolean;
  soundEnabled?: boolean;
  isCpMode?: boolean;
}

export const AacBoardModal: React.FC<AacBoardModalProps> = ({
  onClose,
  dwellEnabled = false,
  soundEnabled = true,
  isCpMode = false
}) => {
  const [sentence, setSentence] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'aac-tiles' | 'sign-cards'>('aac-tiles');

  const aacCategories = [
    {
      name: 'Customer Greetings',
      tiles: [
        { text: 'Namaste 🙏', spoken: 'Namaste! Welcome to our store.', icon: '🙏' },
        { text: 'How can I help you?', spoken: 'How may I help you today?', icon: '🤝' },
        { text: 'Please wait a moment', spoken: 'Please wait a moment while I assist you.', icon: '⏳' },
        { text: 'Thank you!', spoken: 'Thank you very much, have a wonderful day!', icon: '🌟' }
      ]
    },
    {
      name: 'Store & Billing',
      tiles: [
        { text: 'Total is ₹20', spoken: 'Your total is twenty rupees.', icon: '💵' },
        { text: 'Total is ₹50', spoken: 'Your total is fifty rupees.', icon: '💵' },
        { text: 'Here is your change', spoken: 'Here is your receipt and change.', icon: '🪙' },
        { text: 'Call my manager', spoken: 'Please wait, I will call my store manager to help.', icon: '👔' }
      ]
    },
    {
      name: 'Personal Needs',
      tiles: [
        { text: 'Need water 💧', spoken: 'I need a glass of water, please.', icon: '💧' },
        { text: 'Need a calm pause 🧘', spoken: 'I need a 2-minute quiet break.', icon: '🧘' },
        { text: 'Feeling good 😊', spoken: 'I am feeling great and ready to work.', icon: '😊' },
        { text: 'Need help 🆘', spoken: 'I need assistance, please.', icon: '🙋' }
      ]
    }
  ];

  const signCards = [
    { sign: 'Hello / Namaste', gestureDesc: 'Both palms folded gently at chest height', icon: '🙏' },
    { sign: 'Thank You', gestureDesc: 'Fingertips of flat hand touch chin and move forward toward the person', icon: '🤲' },
    { sign: 'Yes / Agree', gestureDesc: 'Fist nods up and down like a head nod', icon: '✊' },
    { sign: 'Help', gestureDesc: 'Closed fist resting on flat palm lifted upward', icon: '🤝' },
    { sign: 'Water', gestureDesc: 'Form letter W with 3 middle fingers and tap chin twice', icon: '💧' },
    { sign: 'Stop / Wait', gestureDesc: 'Flat hand facing outwards, palm upright', icon: '✋' }
  ];

  const handleAddTile = (spoken: string, label: string) => {
    if (soundEnabled) playSoftClick();
    setSentence((prev) => [...prev, label]);
    speakText(spoken);
  };

  const handleClearSentence = () => {
    if (soundEnabled) playSoftClick();
    setSentence([]);
  };

  const handleSpeakFullSentence = () => {
    if (sentence.length === 0) return;
    const full = sentence.join('. ');
    speakText(full);
    if (soundEnabled) playSuccessChime();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 overflow-y-auto">
      <div className="bg-white border-2 border-purple-200 rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-teal-700 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center text-2xl">
              🤟
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-md">
                  Deaf & Speech Bridge
                </span>
                <span className="text-xs text-purple-200 font-bold">Berry Digital Voice Avatar</span>
              </div>
              <h2 className="text-lg md:text-xl font-extrabold mt-0.5">
                AAC Communication Board & ISL Sign Bridge
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

        {/* Tab switcher */}
        <div className="bg-slate-100 p-2 flex gap-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('aac-tiles')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'aac-tiles'
                ? 'bg-white text-purple-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Tap-to-Speak AAC Board (Berry Voice Bridge)</span>
          </button>
          <button
            onClick={() => setActiveTab('sign-cards')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'sign-cards'
                ? 'bg-white text-purple-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <HandMetal className="w-4 h-4" />
            <span>Indian Sign Language (ISL) Visual Guide</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 md:p-8">
          {activeTab === 'aac-tiles' ? (
            <div>
              {/* Sentence Bar */}
              <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black uppercase tracking-wider text-purple-700">
                    Berry Speech Output Buffer:
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={handleClearSentence}
                      disabled={sentence.length === 0}
                      className="text-xs font-bold text-rose-600 hover:text-rose-800 disabled:opacity-30 flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear</span>
                    </button>
                  </div>
                </div>

                <div className="min-h-[50px] bg-white rounded-xl p-3 border border-purple-200 flex flex-wrap items-center gap-2">
                  {sentence.length === 0 ? (
                    <span className="text-xs text-gray-400 italic">
                      Tap tiles below. Berry will speak each phrase clearly for you!
                    </span>
                  ) : (
                    sentence.map((item, idx) => (
                      <span
                        key={idx}
                        className="bg-purple-100 text-purple-900 font-bold text-xs px-2.5 py-1 rounded-lg border border-purple-200"
                      >
                        {item}
                      </span>
                    ))
                  )}
                </div>

                {sentence.length > 0 && (
                  <div className="mt-3 flex justify-end">
                    <DwellButton
                      dwellEnabled={dwellEnabled}
                      soundEnabled={soundEnabled}
                      onClick={handleSpeakFullSentence}
                      className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>Berry Speaks Full Message</span>
                    </DwellButton>
                  </div>
                )}
              </div>

              {/* Berry Coach */}
              <BerryAvatar
                mood="sign"
                message="Tap any card to speak to your customer or mentor! I will be your clear, confident voice in any setting."
                size="md"
                soundEnabled={soundEnabled}
                className="mb-6"
              />

              {/* Categories of tiles */}
              <div className="space-y-4">
                {aacCategories.map((cat, catIdx) => (
                  <div key={catIdx}>
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-500 mb-2">
                      {cat.name}
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {cat.tiles.map((tile, tileIdx) => (
                        <DwellButton
                          key={tileIdx}
                          dwellEnabled={dwellEnabled}
                          soundEnabled={soundEnabled}
                          onClick={() => handleAddTile(tile.spoken, tile.text)}
                          isLargeCpTarget={isCpMode}
                          className="p-3 bg-white hover:bg-purple-50 border-2 border-slate-200 hover:border-purple-300 rounded-2xl text-center shadow-xs flex flex-col items-center justify-center gap-1.5 min-h-[80px]"
                        >
                          <span className="text-2xl">{tile.icon}</span>
                          <span className="font-bold text-xs text-gray-800 leading-tight">
                            {tile.text}
                          </span>
                        </DwellButton>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* ISL Flashcards */
            <div>
              <BerryAvatar
                mood="thinking"
                message="Here are essential Indian Sign Language gestures. You can practice them in front of your camera or show them to colleagues!"
                size="md"
                soundEnabled={soundEnabled}
                className="mb-6"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {signCards.map((sc, idx) => (
                  <div
                    key={idx}
                    onClick={() => speakText(`${sc.sign}. How to sign: ${sc.gestureDesc}`)}
                    className="p-4 bg-slate-50 border-2 border-slate-200 hover:border-purple-400 rounded-2xl cursor-pointer hover:bg-white transition-all shadow-xs"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-3xl">{sc.icon}</span>
                      <Volume2 className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="font-extrabold text-sm text-gray-900 mb-1">
                      {sc.sign}
                    </div>
                    <p className="text-xs text-gray-600 leading-snug">
                      {sc.gestureDesc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
