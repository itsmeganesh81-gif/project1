import { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, X, ArrowRight, CheckCircle, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { ClinicalMatchIcon } from '../common/CustomIcons';

export default function VoiceAssistantModal({ isOpen, onClose }) {
  const { lang, t } = useLanguage();
  const navigate = useNavigate();

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [parsedIntent, setParsedIntent] = useState(null);

  if (!isOpen) return null;

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setAiResponse('Speech recognition is not supported in this browser. Please type or use Chrome.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = lang === 'kn' ? 'kn-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setIsListening(true);
      setTranscript('');
      setAiResponse('Listening... Speak now.');
      setParsedIntent(null);

      recognition.onresult = (event) => {
        const spokenText = event.results[0][0].transcript;
        setTranscript(spokenText);
        setIsListening(false);
        processVoiceCommand(spokenText);
      };

      recognition.onerror = (event) => {
        setIsListening(false);
        setAiResponse(`Audio capture error: ${event.error}. Please try again or tap the quick phrases below.`);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
      setAiResponse('Microphone access blocked. You can click any quick command below.');
    }
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'kn' ? 'kn-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN';
      window.speechSynthesis.speak(utterance);
    }
  };

  const processVoiceCommand = (cmd) => {
    const text = cmd.toLowerCase();
    let reply = '';
    let intent = null;

    if (text.includes('o+') || text.includes('b+') || text.includes('a+') || text.includes('ab+') || text.includes('blood') || text.includes('ರಕ್ತ') || text.includes('रक्त')) {
      reply = 'I found verified blood stock and active voluntary donors in Bengaluru. Navigating you to Find Donors & Stock Locator.';
      intent = { type: 'find_donors', path: '/find-donors', label: 'Go to Find Donors' };
    } else if (text.includes('bank') || text.includes('stock') || text.includes('ನಿಧಿ') || text.includes('स्टॉक')) {
      reply = 'Opening the regional Verified Blood Bank Network dashboard with cold-chain inventory.';
      intent = { type: 'blood_bank', path: '/blood-bank', label: 'Open Blood Bank Hub' };
    } else if (text.includes('volunteer') || text.includes('courier') || text.includes('ಸ್ವಯಂಸೇವಕ') || text.includes('स्वयंसेवक')) {
      reply = 'Opening the Volunteer Rapid Transit Rescue Network.';
      intent = { type: 'volunteer', path: '/volunteers', label: 'Open Volunteer Rescue Hub' };
    } else if (text.includes('shortage') || text.includes('predict') || text.includes('ಮುನ್ಸೂಚನೆ') || text.includes('कमी')) {
      reply = 'Opening the AI Blood Shortage Forecaster and 7-day demand projections.';
      intent = { type: 'shortage', path: '/shortage-ai', label: 'View Shortage Analytics' };
    } else if (text.includes('surplus') || text.includes('expiry') || text.includes('ವಿನಿಮಯ') || text.includes('बचत')) {
      reply = 'Opening the Zero-Wastage Surplus Blood Exchange Board.';
      intent = { type: 'surplus', path: '/surplus-board', label: 'Open Surplus Board' };
    } else {
      reply = `Understood: "${cmd}". Here are the matching blood coordination services in Bengaluru.`;
      intent = { type: 'find_donors', path: '/find-donors', label: 'Search Donors' };
    }

    setAiResponse(reply);
    setParsedIntent(intent);
    speakText(reply);
  };

  const handleExecuteIntent = () => {
    if (parsedIntent?.path) {
      navigate(parsedIntent.path);
      onClose();
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 20
    }}>
      <div style={{
        background: 'white', borderRadius: 20, width: '100%', maxWidth: 500,
        padding: 32, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', textAlign: 'center'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ClinicalMatchIcon size={20} color="#D62839" />
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 }}>
              {t('voiceAssistant')}
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={20} />
          </button>
        </div>

        {/* Pulsing Mic Circle */}
        <div style={{ margin: '24px 0' }}>
          <button
            onClick={isListening ? () => setIsListening(false) : startListening}
            style={{
              width: 80, height: 80, borderRadius: '50%',
              background: isListening ? '#ef4444' : 'linear-gradient(135deg, #D62839, #8D1B2A)',
              color: 'white', border: 'none', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: isListening ? '0 0 0 12px rgba(239,68,68,0.25)' : '0 10px 25px rgba(214,40,57,0.3)',
              transition: 'all 0.3s ease'
            }}
          >
            {isListening ? <MicOff size={32} /> : <Mic size={32} />}
          </button>
          <div style={{ fontSize: 13, color: '#64748b', marginTop: 12, fontWeight: 600 }}>
            {isListening ? t('speakingPrompt') : t('micReady')}
          </div>
        </div>

        {/* Live Transcript Display */}
        {transcript && (
          <div style={{ background: '#f8fafc', padding: 14, borderRadius: 10, fontSize: 14, color: '#0f172a', fontWeight: 600, marginBottom: 14, border: '1px solid #e2e8f0' }}>
            "{transcript}"
          </div>
        )}

        {/* AI Voice Output */}
        {aiResponse && (
          <div style={{ background: '#f0fdf4', padding: 14, borderRadius: 10, fontSize: 13, color: '#166534', marginBottom: 20, border: '1px solid #bbf7d0', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, marginBottom: 4 }}>
              <Volume2 size={16} /> BloodBridge Voice Response
            </div>
            {aiResponse}
          </div>
        )}

        {/* Action Button */}
        {parsedIntent && (
          <button
            onClick={handleExecuteIntent}
            style={{
              width: '100%', padding: '12px', background: '#D62839', color: 'white',
              border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: '0 4px 12px rgba(214,40,57,0.3)', marginBottom: 16
            }}
          >
            {parsedIntent.label} <ArrowRight size={18} />
          </button>
        )}

        {/* Quick Voice Phrases */}
        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 16, textAlign: 'left' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 8 }}>
            Try saying in Kannada, Hindi, or English:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {[
              'Need O+ blood urgently',
              'ನನಗೆ B+ ರಕ್ತ ಬೇಕು',
              'ब्लड बैंक स्टॉक दिखाएं',
              'Find voluntary blood camp',
            ].map(phrase => (
              <button
                key={phrase}
                onClick={() => {
                  setTranscript(phrase);
                  processVoiceCommand(phrase);
                }}
                style={{
                  background: '#f1f5f9', border: 'none', borderRadius: 6,
                  padding: '6px 10px', fontSize: 12, color: '#334155', cursor: 'pointer', fontWeight: 500
                }}
              >
                "{phrase}"
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
