import React, { useEffect, useState } from 'react';

const ApiKeySelect: React.FC<{ onReady: () => void }> = ({ onReady }) => {
  const [hasKey, setHasKey] = useState(false);
  const [checking, setChecking] = useState(true);

  const checkKey = async () => {
    if (window.aistudio) {
      const selected = await window.aistudio.hasSelectedApiKey();
      setHasKey(selected);
      if (selected) {
        onReady();
      }
    }
    setChecking(false);
  };

  useEffect(() => {
    checkKey();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio) {
      window.aistudio.openSelectKey();
      // Poll for key selection, as the dialog is external
      const interval = setInterval(async () => {
         const selected = await window.aistudio?.hasSelectedApiKey();
         if (selected) {
            setHasKey(true);
            onReady();
            clearInterval(interval);
         }
      }, 1000);
      
      // Stop polling after 60 seconds to prevent infinite loops
      setTimeout(() => clearInterval(interval), 60000);
    }
  };

  if (checking) return null;

  if (hasKey) {
    return (
       <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          Pro API Key Active
       </div>
    );
  }

  return (
    <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="text-amber-200 text-sm">
        <p className="font-semibold mb-1">Authentication Required</p>
        <p>To generate high-quality commercial images, please select a paid Google Cloud Project API Key.</p>
        <a 
            href="https://ai.google.dev/gemini-api/docs/billing" 
            target="_blank" 
            rel="noopener noreferrer"
            className="underline opacity-80 hover:opacity-100 text-xs mt-1 inline-block"
        >
            Learn about billing
        </a>
      </div>
      <button
        onClick={handleSelectKey}
        className="shrink-0 bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold py-2 px-4 rounded-md transition-colors text-sm"
      >
        Select API Key
      </button>
    </div>
  );
};

export default ApiKeySelect;