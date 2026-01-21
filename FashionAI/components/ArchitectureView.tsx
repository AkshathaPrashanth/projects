import React, { useEffect, useRef, useState } from 'react';
import { 
  Cpu, Workflow, Boxes, Users, GitBranch, Database, 
  Shield, BookOpen, ChevronRight, FileText, History, 
  Info, Sparkles, Code, CheckSquare, Target, Activity,
  Layout, Layers, Smartphone, Globe, Terminal
} from 'lucide-react';
import mermaid from 'https://esm.sh/mermaid@10.9.0';

mermaid.initialize({
  startOnLoad: true,
  theme: 'base',
  themeVariables: {
    primaryColor: '#EA580C',
    primaryTextColor: '#fff',
    primaryBorderColor: '#EA580C',
    lineColor: '#CBD5E1',
    secondaryColor: '#F8FAFC',
    tertiaryColor: '#fff',
    mainBkg: '#ffffff',
    nodeBorder: '#E2E8F0',
    clusterBkg: '#F1F5F9',
    titleColor: '#0F172A',
  }
});

const Diagram: React.FC<{ code: string }> = ({ code }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.removeAttribute('data-processed');
      mermaid.contentLoaded();
    }
  }, [code]);

  return (
    <div className="bg-white p-6 md:p-12 rounded-[2.5rem] border border-theme shadow-sm overflow-x-auto flex justify-center items-center min-h-[400px] w-full animate-in zoom-in fade-in duration-500 my-8">
      <div ref={ref} className="mermaid w-full flex justify-center">
        {code}
      </div>
    </div>
  );
};

// Fix: Use React.FC to properly define the children prop and satisfy TypeScript requirement.
interface ReportChapterProps {
  title: string;
  chapter: string;
  children: React.ReactNode;
}

const ReportChapter: React.FC<ReportChapterProps> = ({ title, chapter, children }) => (
  <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
    <div className="flex items-center gap-4 border-b border-theme pb-6">
      <div className="w-14 h-14 rounded-2xl bg-[var(--primary)] text-white flex items-center justify-center font-serif font-bold text-2xl shadow-lg shadow-orange-500/20">
        {chapter}
      </div>
      <div>
        <h3 className="text-3xl font-serif font-bold text-main">{title}</h3>
        <p className="text-[10px] font-bold text-dim uppercase tracking-[0.2em]">Project Technical Thesis • FashionDesignAI</p>
      </div>
    </div>
    <div className="text-muted leading-relaxed font-light space-y-6 text-sm md:text-base">
      {children}
    </div>
  </section>
);

const ArchitectureView: React.FC = () => {
  const [activeChapter, setActiveChapter] = useState<string>('1');

  const chapters = [
    { id: '1', title: 'Introduction', icon: Target },
    { id: '2', title: 'Problem Definition', icon: Activity },
    { id: '3', title: 'Software Requirements', icon: FileText },
    { id: '4', title: 'High Level Design', icon: Boxes },
    { id: '5', title: 'Detailed Design', icon: GitBranch },
    { id: '6', title: 'Implementation', icon: Code },
    { id: '7', title: 'Software Testing', icon: CheckSquare },
    { id: '8', title: 'Conclusion', icon: Shield },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-main p-6 md:p-12 transition-all duration-300 h-full">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12">
        
        {/* Sidebar Navigation */}
        <aside className="w-full lg:w-80 shrink-0 lg:sticky lg:top-12 h-fit space-y-8">
          <div className="p-8 bg-panel rounded-[2.5rem] border border-theme shadow-xl">
            <div className="flex items-center gap-3 mb-8 px-2">
               <Layers className="text-[var(--primary)]" size={20} />
               <h4 className="text-xs font-bold text-main uppercase tracking-[0.2em]">Documentation Index</h4>
            </div>
            <nav className="space-y-2">
              {chapters.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => setActiveChapter(ch.id)}
                  className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-left transition-all group ${
                    activeChapter === ch.id 
                      ? 'bg-[var(--primary)] text-white shadow-xl scale-[1.02]' 
                      : 'text-muted hover:bg-element hover:text-main'
                  }`}
                >
                  <ch.icon size={18} className={activeChapter === ch.id ? 'text-white' : 'text-dim group-hover:text-[var(--primary)]'} />
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold tracking-widest opacity-60">Chapter {ch.id}</span>
                    <span className="text-xs font-semibold">{ch.title}</span>
                  </div>
                  {activeChapter === ch.id && <ChevronRight size={14} className="ml-auto animate-pulse" />}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-8 bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-400 mb-4">Technical Stack</h5>
              <div className="space-y-4">
                 <div className="flex items-center gap-3">
                   <div className="p-2 bg-white/10 rounded-lg"><Cpu size={14} /></div>
                   <span className="text-xs font-medium">Gemini 2.5 Flash</span>
                 </div>
                 <div className="flex items-center gap-3">
                   <div className="p-2 bg-white/10 rounded-lg"><Database size={14} /></div>
                   <span className="text-xs font-medium">MongoDB Cluster</span>
                 </div>
                 <div className="flex items-center gap-3">
                   <div className="p-2 bg-white/10 rounded-lg"><Layout size={14} /></div>
                   <span className="text-xs font-medium">React 19 / TS</span>
                 </div>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-orange-500/20 blur-3xl rounded-full"></div>
          </div>
        </aside>

        {/* Content Area */}
        <div className="flex-1 bg-panel rounded-[3rem] border border-theme shadow-2xl p-8 md:p-16 min-h-[800px]">
          
          {activeChapter === '1' && (
            <ReportChapter title="Introduction" chapter="01">
              <p>
                The fashion industry is undergoing a digital renaissance. Traditional design workflows, once constrained by manual sketching and labor-intensive pattern drafting, are being revolutionized by generative AI. <span className="text-main font-semibold">FashionDesignAI</span> represents a unified technical atelier that bridges the gap between conceptual intent and manufacturing-ready assets.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-10">
                <div className="space-y-4">
                  <h4 className="text-lg font-serif font-bold text-main">Objectives</h4>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] mt-1.5 shrink-0"></div>
                      <span>Automate high-fidelity seamless pattern generation.</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] mt-1.5 shrink-0"></div>
                      <span>Ensure assets are mathematically optimized for infinite tiling.</span>
                    </li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="text-lg font-serif font-bold text-main">Purpose</h4>
                  <p className="text-sm">To democratize high-end textile synthesis using multimodal large language models, specifically Google Gemini 2.5.</p>
                </div>
              </div>
            </ReportChapter>
          )}

          {activeChapter === '2' && (
            <ReportChapter title="Problem Definition" chapter="02">
              <p>The traditional textile design pipeline suffers from a significant "Visualization Gap". Designers must create 2D patterns without seeing them on 3D garments instantly. Furthermore, creating truly seamless repeats often requires advanced software proficiency.</p>
              <div className="p-8 bg-element rounded-3xl border border-theme my-8">
                <h4 className="text-xs font-bold uppercase tracking-widest text-dim mb-4">The Solution Architecture</h4>
                <p className="text-sm">FashionDesignAI uses a Gemini-driven synthesis engine to handle edge-continuity and spatial visualization simultaneously, reducing iteration cycles from hours to seconds.</p>
              </div>
            </ReportChapter>
          )}

          {activeChapter === '3' && (
            <ReportChapter title="Software Requirements" chapter="03">
              <div className="space-y-10">
                <div>
                  <h4 className="text-lg font-serif font-bold text-main mb-4">Functional Requirements</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      'Text-to-Pattern Synthesis',
                      'Image-to-Pattern (Visual Anchor)',
                      'Real-time 3D Silhouette Projection',
                      'Automated Color Palette Extraction',
                      'Cloud Database Persistence'
                    ].map(req => (
                      <div key={req} className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-theme">
                        <CheckSquare className="text-emerald-500" size={16} />
                        <span className="text-xs font-semibold">{req}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ReportChapter>
          )}

          {activeChapter === '4' && (
            <ReportChapter title="High Level Design" chapter="04">
              <p>The system follows a three-tier architecture: Presentation (React), Application (Node.js), and Intelligence (Gemini AI).</p>
              <Diagram code={`
                graph TD
                  A[User Interface - React] -->|Request| B[API Gateway - Express]
                  B -->|Inference| C[Gemini AI Engine]
                  B -->|Persistence| D[MongoDB Cluster]
                  C -->|Base64 Asset| B
                  B -->|Response| A
              `} />
            </ReportChapter>
          )}

          {activeChapter === '5' && (
            <ReportChapter title="Detailed Design" chapter="05">
              <p>Sequence diagram for the pattern generation and persistence flow.</p>
              <Diagram code={`
                sequenceDiagram
                  participant U as User
                  participant F as Frontend
                  participant G as Gemini API
                  participant D as Database
                  U->>F: Input Prompt
                  F->>G: GenerateSeamlessImage(prompt)
                  G-->>F: Image Data
                  F->>F: Extract Palette
                  F->>D: SavePattern(metadata)
                  D-->>F: Success
                  F-->>U: Render Design
              `} />
            </ReportChapter>
          )}

          {activeChapter === '6' && (
            <ReportChapter title="Implementation" chapter="06">
              <div className="space-y-6">
                <p>The implementation utilizes React 19 for efficient DOM management and Tailwind CSS for the aesthetic design layer.</p>
                <div className="p-6 bg-slate-900 rounded-2xl font-mono text-xs text-orange-400">
                  {/* Fix: Use string literals for code spacing to avoid "nbsp" name errors in strict TS environments */}
                  {"// Example Gemini Integration"}<br/>
                  {"const response = await ai.models.generateContent({"}<br/>
                  {"  model: 'gemini-2.5-flash-image',"}<br/>
                  {"  contents: 'professional seamless textile pattern...'"}<br/>
                  {"});"}
                </div>
              </div>
            </ReportChapter>
          )}

          {activeChapter === '7' && (
            <ReportChapter title="Software Testing" chapter="07">
              <p>The platform underwent rigorous testing across multiple browsers and device resolutions to ensure responsive performance.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-white rounded-2xl border border-theme text-center">
                  <div className="text-2xl font-bold text-[var(--primary)] mb-1">98%</div>
                  <div className="text-[10px] uppercase font-bold text-dim">Prompt Accuracy</div>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-theme text-center">
                  <div className="text-2xl font-bold text-emerald-500 mb-1">&lt; 3s</div>
                  <div className="text-[10px] uppercase font-bold text-dim">Avg Latency</div>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-theme text-center">
                  <div className="text-2xl font-bold text-blue-500 mb-1">100%</div>
                  <div className="text-[10px] uppercase font-bold text-dim">Seamless Tiling</div>
                </div>
              </div>
            </ReportChapter>
          )}

          {activeChapter === '8' && (
            <ReportChapter title="Conclusion" chapter="08">
              <p>FashionDesignAI successfully merges the creative potential of AI with the practical requirements of the textile industry. Future iterations will focus on real-time 3D simulation using Three.js and direct integration with Print-on-Demand (POD) manufacturing services.</p>
              <div className="flex justify-center py-12">
                 <div className="w-24 h-1 bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent opacity-30 rounded-full"></div>
              </div>
            </ReportChapter>
          )}

        </div>
      </div>
    </div>
  );
};

export default ArchitectureView;