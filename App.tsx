import React, { useState, useRef } from 'react';
import { streamAnalyzeScript } from './services/geminiService';
import { VoiceAnalysisResult } from './types';
import { PartA } from './components/PartA';
import { PartB } from './components/PartB';
import { Background } from './components/Background';

const App = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [result, setResult] = useState<VoiceAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Use a ref to track if component is mounted to avoid state updates on unmount
  const isMounted = useRef(true);

  React.useEffect(() => {
    return () => { isMounted.current = false; };
  }, []);

  const handleGenerate = async () => {
    if (!input.trim()) return;
    
    setLoading(true);
    setStreaming(true);
    setError(null);
    setResult(null);

    try {
      // Use the generator to get partial results
      const stream = streamAnalyzeScript(input);
      
      for await (const partialResult of stream) {
        if (isMounted.current) {
          setResult(partialResult);
          // Once we have at least one script section, we consider the "loading spinner" phase done
          // and move to "streaming" phase (user can read while it completes)
          if (partialResult.productionPlan) {
            setLoading(false);
          }
        }
      }
    } catch (err: any) {
      if (isMounted.current) {
        setError(err.message || "Something went wrong.");
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
        setStreaming(false);
      }
    }
  };

  const handleSample = () => {
    setInput(`"ကိုယ့်ပစ္စည်းက သူများထက်ကောင်းပေမယ့် ဘာလို့ ရောင်းအားမတက်တာလဲ စဉ်းစားဖူးလား? အဖြေက ရှင်းရှင်းလေးပါ။ Customer တွေက လူ စည်တဲ့ဆိုင်ကိုပဲ စိတ်ဝင်စားလေ့ရှိကြလို့ပါ။"

"Online မှာက Page Like နည်းနေရင် ဆိုင်သစ်ဖွင့်ထားပြီး လူသူမရှိ ခြောက်ကပ်နေတဲ့ ဆိုင်တစ်ဆိုင်လိုပါပဲ။ ယုံကြည်မှုမရှိရင် ဝယ်ဖို့ဝန်လေးနေတတ်ကြပါတယ်။"

"လူကြီးမင်းရဲ့ Page ကလည်း Like များမှ၊ Follower များမှ Customer တွေက အထင် ကြီးပြီး ယုံကြည်မှာပါ။ ဒါက Digital ခေတ်ရဲ့ စီးပွားရေးလျှို့ဝှက်ချက်တစ်ခုပါပဲ။"

"ဒါကြောင့် လူကြီးမင်းရဲ့ Page ကို ယုံကြည်မှုအပြည့်ရှိတဲ့ Brand တစ်ခုဖြစ်လာစေဖို့ ကျွန်တော်တို့ဆီမှာ Boosting Service အပ်လို့ရပါပြီ။ အချိန်တိုအတွင်းမှာ Organic နဲ့တူဆုံး Quality အကောင်းဆုံး Service ကို ပေးနေတာပါ။"

"Myanmar Account အစစ်တွေနဲ့ (100%) အာမခံပေးထားလို့ Page ထိခိုက်မှာ လုံးဝ စိတ်ပူစရာမလိုပါဘူး။ Like ပြန်ကျရင်လည်း ပြန်ဖြည့်ပေးမယ့် Warranty ပါဝင်ပါတယ်။"

"ကော်ဖီတစ်ခွက်ဖိုးလောက် အရင်းအနှီးသုံးလိုက်တာနဲ့ ကိုယ့် Page က Level တစ်ခုကို ရောက်သွားမှာနော်။ Review ပေါင်းများစွာနဲ့ လက်ရာကောင်းတဲ့ Service မို့ လူကြီးမင်းတို့ Page အတွက် အခုပဲ နေရာဦးထားလိုက်တော့နော်။"

"Facebook page like ‌တွေကို ငါးထောင် တစ်သောင်းကျပ်ကနေစပြီးဝယ်ယူလို့ရပါတယ်။ 5000ကျပ်လောက်သုံးပြီး ကိုယ့်page နဲ့ onlineဈေးဆိုင်လေးကို လူရာဝင်သွားစေမှာပါ။ Boosting service အစုံကိုအခုပဲလာရောက်ဆက်သွယ်ဝယ်ယူနိုင်ပါပြီ။"`);
  };

  return (
    <div className="min-h-screen pb-20 relative text-slate-100 font-sans selection:bg-blue-500/30">
      <Background />
      
      {/* Header */}
      <header className="relative z-10 sticky top-0 border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 h-20 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-[0_0_15px_rgba(59,130,246,0.5)] border border-white/10">V</div>
                <div className="leading-none">
                  <h1 className="text-xl font-bold text-white tracking-tight uppercase">Burmese Voice Director</h1>
                  <span className="text-[10px] font-semibold text-blue-300 tracking-[0.2em] uppercase">AI Production Studio</span>
                </div>
            </div>
            <div className="hidden sm:block text-xs font-medium text-slate-400 border border-white/10 px-3 py-1.5 rounded-full bg-black/20 backdrop-blur">
                Powered by Gemini 2.5
            </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 relative z-10">
        
        {/* Input Section */}
        <section className="bg-black/30 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/10 p-6 mb-8 transition-all hover:border-white/20">
            <div className="flex justify-between items-center mb-4">
                <label className="text-sm font-bold text-blue-200/80 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                  Original Script or Topic
                </label>
                <button onClick={handleSample} className="text-xs text-blue-400 hover:text-blue-300 font-medium hover:underline flex items-center gap-1 transition-colors">
                    <span>Use Sample Text</span>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
            </div>
            
            <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste your Burmese text here, or describe what you want the script to be about..."
                className="w-full h-40 p-4 rounded-xl border border-white/10 bg-black/20 focus:bg-black/40 focus:ring-2 focus:ring-blue-500/50 focus:border-transparent outline-none transition-all resize-none font-burmese text-lg leading-relaxed placeholder:text-slate-600 text-slate-100"
            />

            <div className="mt-4 flex justify-end items-center gap-4">
                {streaming && !result && (
                  <span className="text-xs text-slate-400 animate-pulse font-mono">
                    INITIALIZING AI...
                  </span>
                )}
                <button
                    onClick={handleGenerate}
                    disabled={(loading && !result) || !input.trim()}
                    className={`
                        flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all transform
                        ${(loading && !result) || !input.trim() 
                          ? 'bg-slate-800/50 cursor-not-allowed text-slate-500 border border-white/5' 
                          : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 hover:shadow-blue-500/20 hover:scale-[1.02] active:scale-95 border border-white/10'}
                    `}
                >
                    {loading && !result ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white/70" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Working...
                        </>
                    ) : (
                        <>
                            <span>{result ? 'Regenerate Plan' : 'Generate Production Plan'}</span>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </>
                    )}
                </button>
            </div>
        </section>

        {/* Error Message */}
        {error && (
            <div className="bg-red-500/10 backdrop-blur-md text-red-200 p-4 rounded-xl border border-red-500/20 mb-8 flex items-start gap-3 animate-fade-in-up">
                <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p>{error}</p>
            </div>
        )}

        {/* Results */}
        <div className="space-y-12">
            {result?.productionPlan && (
              <PartA plan={result.productionPlan} />
            )}
            
            {(result?.scriptSections || loading || streaming) && (
              <PartB 
                sections={result?.scriptSections || []} 
                isStreaming={streaming} 
              />
            )}
        </div>

        {/* Empty State */}
        {!result && !loading && !error && (
            <div className="text-center py-20 opacity-40">
                <div className="text-7xl mb-6 grayscale brightness-150">🎬</div>
                <h3 className="text-2xl font-bold text-white tracking-wide">Ready to Direct</h3>
                <p className="text-slate-300 max-w-sm mx-auto mt-3 text-lg font-light">Enter your script above to generate a professional Burmese voiceover plan.</p>
            </div>
        )}

      </main>
    </div>
  );
};

export default App;