import { useState, KeyboardEvent, useRef, useEffect, useCallback } from "react";

type View = "form" | "roulette";

type Selections = {
  weather: string;
  mood: string;
  people: number;
  allergies: string[];
  recentFood: string[];
  count: number;
};

const WEATHER_OPTIONS = [
  { id: "sunny", label: "맑음", icon: "○" },
  { id: "cloudy", label: "흐림", icon: "◑" },
  { id: "rainy", label: "비", icon: "↓" },
  { id: "snowy", label: "눈", icon: "✦" },
  { id: "hot", label: "더움", icon: "△" },
  { id: "cold", label: "추움", icon: "▽" },
];

const MOOD_OPTIONS = [
  { id: "happy", label: "행복", icon: "◡" },
  { id: "tired", label: "피곤", icon: "—" },
  { id: "excited", label: "쏘쏘", icon: ":]" },
  { id: "sad", label: "우울", icon: "◠" },
  { id: "stressed", label: "스트레스", icon: "×" },
  { id: "chill", label: "여유", icon: "~" },
];

// 백엔드(dinner-recommender-backend) 서버 주소.
// 로컬 개발 시 .env 파일에 VITE_API_BASE_URL을 지정하지 않으면 localhost:3000을 사용한다.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

type BackendRecommendation = {
  menu: string;
  reason: string;
  category: string;
};

type BackendResponse =
  | { success: true; mode: string; recommendations: BackendRecommendation[] }
  | { success: false; errors: string[] };

/**
 * 백엔드 /api/recommend 에 현재 선택값을 보내고 메뉴 이름 목록을 받아온다.
 * (더 이상 프론트엔드에서 메뉴를 하드코딩하지 않음)
 */
async function getRecommendations(sel: Selections, count: number): Promise<string[]> {
  const weatherLabel = WEATHER_OPTIONS.find((o) => o.id === sel.weather)?.label ?? sel.weather;
  const moodLabel = MOOD_OPTIONS.find((o) => o.id === sel.mood)?.label ?? sel.mood;

  const response = await fetch(`${API_BASE_URL}/api/recommend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      weather: weatherLabel,
      mood: moodLabel,
      peopleCount: sel.people,
      dislikedFoods: sel.allergies,
      recentFoods: sel.recentFood,
      foodCount: count,
    }),
  });

  const data: BackendResponse = await response.json();

  if (!response.ok || !data.success) {
    const message =
      !data.success && Array.isArray(data.errors)
        ? data.errors.join(", ")
        : "메뉴 추천을 받아오지 못했습니다. 백엔드 서버가 켜져 있는지 확인해주세요.";
    throw new Error(message);
  }

  return data.recommendations.map((r) => r.menu);
}

// ── Tiger SVG mascot ──────────────────────────────────────────────────────────
function TigerMascot({ excited = false }: { excited?: boolean }) {
  return (
    <svg viewBox="0 0 130 165" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      {/* ── Body ── */}
      <ellipse cx="65" cy="118" rx="33" ry="36" fill="#edeae0" stroke="#222" strokeWidth="2.2"/>
      {/* Body stripes – thick diagonal, tiger-style */}
      <path d="M 40 100 Q 35 112 40 126" stroke="#555" strokeWidth="3" strokeLinecap="round" fill="none"/>
      <path d="M 50 96 Q 44 110 50 124" stroke="#555" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
      <path d="M 90 100 Q 95 112 90 126" stroke="#555" strokeWidth="3" strokeLinecap="round" fill="none"/>
      <path d="M 80 96 Q 86 110 80 124" stroke="#555" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
      {/* Belly – white patch */}
      <ellipse cx="65" cy="118" rx="18" ry="24" fill="white" stroke="none"/>
      {/* Tail with rings */}
      <path d="M 94 134 Q 118 120 112 98 Q 107 82 95 92" stroke="#222" strokeWidth="3" strokeLinecap="round" fill="none"/>
      <path d="M 108 106 Q 114 103 112 98" stroke="#555" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M 112 116 Q 118 113 116 108" stroke="#555" strokeWidth="2.5" strokeLinecap="round" fill="none"/>

      {/* ── Head ── big, round – more bear-like width for tiger */}
      <ellipse cx="65" cy="57" rx="35" ry="33" fill="#edeae0" stroke="#222" strokeWidth="2.2"/>

      {/* ── Ears – ROUNDED (not pointed) – key tiger trait ── */}
      {/* Left ear outer */}
      <path d="M 33 36 Q 20 16 42 24" stroke="#222" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="#edeae0"/>
      <path d="M 33 36 Q 26 20 42 24 Z" fill="#edeae0" stroke="#222" strokeWidth="2"/>
      {/* Left ear white inner spot (tigers have this on back of ear) */}
      <ellipse cx="34" cy="27" rx="5" ry="6" fill="white" stroke="none"/>
      {/* Right ear outer */}
      <path d="M 97 36 Q 110 16 88 24" stroke="#222" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="#edeae0"/>
      <path d="M 97 36 Q 104 20 88 24 Z" fill="#edeae0" stroke="#222" strokeWidth="2"/>
      {/* Right ear white inner spot */}
      <ellipse cx="96" cy="27" rx="5" ry="6" fill="white" stroke="none"/>

      {/* ── Forehead M-stripe (classic tiger marking) ── */}
      <path d="M 53 36 Q 54 29 56 36" stroke="#444" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
      <path d="M 57 34 Q 58 27 60 34" stroke="#444" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
      <path d="M 64 34 Q 65 27 67 34" stroke="#444" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
      <path d="M 69 36 Q 71 29 72 36" stroke="#444" strokeWidth="2.2" strokeLinecap="round" fill="none"/>

      {/* ── Cheek stripe marks (3 diagonal each side) ── */}
      <path d="M 35 58 Q 40 55 44 58" stroke="#555" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      <path d="M 33 64 Q 38 61 42 63" stroke="#555" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      <path d="M 34 70 Q 39 67 43 69" stroke="#555" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      <path d="M 95 58 Q 90 55 86 58" stroke="#555" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      <path d="M 97 64 Q 92 61 88 63" stroke="#555" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      <path d="M 96 70 Q 91 67 87 69" stroke="#555" strokeWidth="1.8" strokeLinecap="round" fill="none"/>

      {/* ── Muzzle – white wide area ── */}
      <ellipse cx="65" cy="70" rx="17" ry="13" fill="white" stroke="none"/>

      {/* ── Eyes ── */}
      <circle cx="50" cy="56" r="8" fill="white" stroke="#222" strokeWidth="1.8"/>
      <circle cx="80" cy="56" r="8" fill="white" stroke="#222" strokeWidth="1.8"/>
      {excited ? (
        <>
          <circle cx="51" cy="57" r="5.5" fill="#222"/>
          <circle cx="81" cy="57" r="5.5" fill="#222"/>
          <circle cx="53" cy="55" r="2" fill="white"/>
          <circle cx="83" cy="55" r="2" fill="white"/>
        </>
      ) : (
        <>
          <circle cx="51" cy="57" r="4" fill="#222"/>
          <circle cx="81" cy="57" r="4" fill="#222"/>
          <circle cx="52.5" cy="55.5" r="1.5" fill="white"/>
          <circle cx="82.5" cy="55.5" r="1.5" fill="white"/>
        </>
      )}
      {/* Eye brow accent */}
      <path d="M 43 49 Q 50 46 57 49" stroke="#444" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      <path d="M 73 49 Q 80 46 87 49" stroke="#444" strokeWidth="1.8" strokeLinecap="round" fill="none"/>

      {/* ── Nose – wide tiger nose ── */}
      <path d="M 59 68 Q 65 65 71 68 Q 65 74 59 68 Z" fill="#444" stroke="none"/>
      {/* Nose bridge line */}
      <line x1="65" y1="61" x2="65" y2="68" stroke="#555" strokeWidth="1.2" strokeLinecap="round"/>

      {/* ── Mouth ── */}
      {excited ? (
        <>
          <path d="M 59 73 Q 65 80 71 73" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round"/>
          <path d="M 65 73 L 65 80" stroke="#333" strokeWidth="1.5" strokeLinecap="round"/>
        </>
      ) : (
        <>
          <path d="M 59 73 Q 65 78 71 73" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round"/>
          <path d="M 65 73 L 65 78" stroke="#333" strokeWidth="1.5" strokeLinecap="round"/>
        </>
      )}

      {/* ── Whiskers ── */}
      <line x1="10" y1="67" x2="44" y2="69" stroke="#aaa" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="10" y1="73" x2="44" y2="72" stroke="#aaa" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="10" y1="79" x2="44" y2="76" stroke="#aaa" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="86" y1="69" x2="120" y2="67" stroke="#aaa" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="86" y1="72" x2="120" y2="73" stroke="#aaa" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="86" y1="76" x2="120" y2="79" stroke="#aaa" strokeWidth="1.2" strokeLinecap="round"/>

      {/* ── Paws ── */}
      <ellipse cx="48" cy="150" rx="15" ry="9" fill="#edeae0" stroke="#222" strokeWidth="2"/>
      <ellipse cx="82" cy="150" rx="15" ry="9" fill="#edeae0" stroke="#222" strokeWidth="2"/>
      {/* Toes */}
      <path d="M 38 147 Q 40 142 43 147" stroke="#444" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
      <path d="M 45 145 Q 47 140 50 145" stroke="#444" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
      <path d="M 52 147 Q 54 142 57 147" stroke="#444" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
      <path d="M 72 147 Q 74 142 77 147" stroke="#444" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
      <path d="M 79 145 Q 81 140 84 145" stroke="#444" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
      <path d="M 86 147 Q 88 142 91 147" stroke="#444" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

// ── Roulette wheel ────────────────────────────────────────────────────────────
function RouletteScreen({ items, onBack }: { items: string[]; onBack: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const angleRef = useRef(0);
  const rafRef = useRef<number>(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const n = items.length;
  const segAngle = (2 * Math.PI) / n;

  const WHEEL_SIZE = 280;

  const draw = useCallback(
    (angle: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const dpr = window.devicePixelRatio || 1;
      const cx = WHEEL_SIZE / 2;
      const cy = WHEEL_SIZE / 2;
      const r = cx - 10;

      ctx.clearRect(0, 0, WHEEL_SIZE * dpr, WHEEL_SIZE * dpr);

      // Segments
      for (let i = 0; i < n; i++) {
        const start = angle + i * segAngle;
        const end = start + segAngle;

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r, start, end);
        ctx.closePath();
        ctx.fillStyle = i % 2 === 0 ? "#ffffff" : "#f5f5ee";
        ctx.fill();
        ctx.strokeStyle = "#333";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Text label
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(start + segAngle / 2);
        ctx.textAlign = "right";
        ctx.fillStyle = "#222";
        const fontSize = Math.max(9, Math.min(13, Math.floor(r * 0.38 * segAngle)));
        ctx.font = `700 ${fontSize}px "Nanum Gothic", sans-serif`;
        ctx.fillText(items[i], r - 12, fontSize * 0.4);
        ctx.restore();
      }

      // Outer ring
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, 2 * Math.PI);
      ctx.strokeStyle = "#222";
      ctx.lineWidth = 3;
      ctx.stroke();

      // Center hub
      ctx.beginPath();
      ctx.arc(cx, cy, 16, 0, 2 * Math.PI);
      ctx.fillStyle = "#222";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, cy, 10, 0, 2 * Math.PI);
      ctx.fillStyle = "#fff";
      ctx.fill();
    },
    [items, n, segAngle]
  );

  // Init canvas with DPR scaling
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = WHEEL_SIZE * dpr;
    canvas.height = WHEEL_SIZE * dpr;
    canvas.style.width = WHEEL_SIZE + "px";
    canvas.style.height = WHEEL_SIZE + "px";
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.scale(dpr, dpr);
    // Wait for fonts to load
    document.fonts.ready.then(() => draw(angleRef.current));
  }, [draw]);

  const spin = () => {
    if (spinning || n === 0) return;
    setSpinning(true);
    setResult(null);

    const extraRotations = 2 * Math.PI * (6 + Math.floor(Math.random() * 5));
    const startAngle = angleRef.current;
    const targetAngle = startAngle + extraRotations;
    const duration = 4200;
    const startTime = performance.now();

    const animate = (now: number) => {
      const t = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 4);
      const current = startAngle + (targetAngle - startAngle) * eased;
      draw(current);

      if (t < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        const finalAngle = current % (2 * Math.PI);
        angleRef.current = finalAngle;
        draw(finalAngle);
        setSpinning(false);

        // Pointer is at top = -π/2; find which segment it lands on
        const ptr = ((-Math.PI / 2 - finalAngle) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
        const idx = Math.floor(ptr / segAngle) % n;
        setResult(items[idx]);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  return (
    <div className="grid-bg min-h-full w-full overflow-y-auto">
      <div className="max-w-md mx-auto px-4 py-8 pb-20">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={onBack}
            className="sketch-chip px-3 py-1.5 text-sm"
            style={{ borderRadius: "8px" }}
          >
            ← 돌아가기
          </button>
          <h1 className="text-2xl text-gray-800 headline">룰렛 돌리기</h1>
        </div>

        {/* Wheel card */}
        <div className="sketch-card p-6 mb-5">
          <div className="flex flex-col items-center gap-5">
            {/* Wheel + pointer */}
            <div className="relative" style={{ width: WHEEL_SIZE, height: WHEEL_SIZE + 20 }}>
              {/* Pointer triangle at top */}
              <div
                className="absolute left-1/2 -translate-x-1/2 z-10"
                style={{ top: 0, width: 0, height: 0, borderLeft: "10px solid transparent", borderRight: "10px solid transparent", borderTop: "22px solid #222" }}
              />
              <canvas ref={canvasRef} style={{ display: "block", marginTop: 18 }} />
            </div>

            {/* Tiger mascot */}
            <div
              className="relative"
              style={{ width: 90, height: 117 }}
            >
              <TigerMascot excited={!!result || spinning} />
              {spinning && (
                <div
                  className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-gray-500 whitespace-nowrap"
                  style={{ fontFamily: "'Nanum Gothic', sans-serif" }}
                >
                  두근두근...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Spin button */}
        <button
          onClick={spin}
          disabled={spinning}
          className="w-full py-4 text-xl font-bold transition-all duration-200 active:scale-95 mb-5"
          style={{
            fontFamily: "'Do Hyeon', sans-serif",
            background: spinning ? "#ccc" : "#222",
            color: spinning ? "#888" : "#fff",
            border: "2px solid #222",
            borderRadius: "12px",
            boxShadow: spinning ? "none" : "4px 4px 0 #888",
            letterSpacing: "0.05em",
            cursor: spinning ? "not-allowed" : "pointer",
          }}
        >
          {spinning ? "돌아가는 중 ..." : result ? "다시 돌리기 ↺" : "룰렛 돌리기 ▶"}
        </button>

        {/* Result */}
        {result && (
          <div
            className="sketch-card p-6 text-center"
            style={{ animation: "fadeIn 0.4s ease" }}
          >
            <p className="text-sm text-gray-400 mb-2 tracking-widest uppercase font-mono">오늘의 메뉴</p>
            <p className="text-3xl text-gray-900 headline tracking-wide mb-4">{result}</p>
            <div
              className="h-px mb-4"
              style={{ background: "repeating-linear-gradient(90deg, #ccc 0, #ccc 6px, transparent 6px, transparent 12px)" }}
            />
            <p className="text-xs text-gray-400" style={{ fontFamily: "'Nanum Gothic', sans-serif" }}>
              맛있게 드세요 🐯
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Shared sub-components ─────────────────────────────────────────────────────
type ChipProps = {
  icon: string;
  label: string;
  selected: boolean;
  onClick: () => void;
};

function Chip({ icon, label, selected, onClick }: ChipProps) {
  return (
    <button
      onClick={onClick}
      className={`sketch-chip flex items-center gap-1.5 px-3.5 py-1.5 text-sm active:scale-95 ${selected ? "selected" : ""}`}
    >
      <span className="font-mono text-xs w-3 text-center leading-none">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

type StepperProps = {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  unit?: string;
};

function Stepper({ value, min, max, onChange, unit = "" }: StepperProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        className="sketch-stepper-btn"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
      >
        −
      </button>
      <span className="text-2xl font-bold w-16 text-center headline">
        {value}{unit}
      </span>
      <button
        className="sketch-stepper-btn"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
      >
        +
      </button>
    </div>
  );
}

type TagInputProps = {
  tags: string[];
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
  placeholder?: string;
};

function TagInput({ tags, onAdd, onRemove, placeholder }: TagInputProps) {
  const [input, setInput] = useState("");

  const commit = () => {
    const val = input.trim().replace(/,$/, "");
    if (val && !tags.includes(val)) onAdd(val);
    setInput("");
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit();
    } else if (e.key === "Backspace" && !input && tags.length > 0) {
      onRemove(tags[tags.length - 1]);
    }
  };

  return (
    <div>
      <input
        className="sketch-input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKey}
        onBlur={commit}
        placeholder={placeholder}
      />
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {tags.map((tag) => (
            <span key={tag} className="tag-chip">
              {tag}
              <button onClick={() => onRemove(tag)} className="ml-1 text-gray-400 hover:text-gray-700 leading-none">
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

type SectionProps = {
  title: string;
  label: string;
  children: React.ReactNode;
};

function Section({ title, label, children }: SectionProps) {
  return (
    <div className="sketch-card p-5">
      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-xs font-mono text-gray-400 border border-gray-300 rounded px-1.5 py-0.5 tracking-widest uppercase">
          {label}
        </span>
        <h2 className="text-lg text-gray-800 headline">{title}</h2>
      </div>
      {children}
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState<View>("form");
  const [sel, setSel] = useState<Selections>({
    weather: "",
    mood: "",
    people: 1,
    allergies: [],
    recentFood: [],
    count: 3,
  });
  const [results, setResults] = useState<string[] | null>(null);
  const [animating, setAnimating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!sel.weather || !sel.mood) return;
    setAnimating(true);
    setError(null);
    try {
      const menus = await getRecommendations(sel, sel.count);
      setResults(menus);
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
    } finally {
      setAnimating(false);
    }
  };

  const canSubmit = sel.weather && sel.mood && !animating;

  if (view === "roulette" && results) {
    return <RouletteScreen items={results} onBack={() => setView("form")} />;
  }

  return (
    <div className="grid-bg min-h-full w-full overflow-y-auto">
      <div className="max-w-md mx-auto px-4 py-10 pb-20">

        {/* Header */}
        <div className="text-center mb-10">
          <div
            className="inline-block border-2 border-gray-800 rounded-2xl px-6 mb-4"
            style={{ boxShadow: "4px 4px 0 #222", paddingTop: "10px", paddingBottom: "10px" }}
          >
            <h1 className="text-4xl headline tracking-wide" style={{ color: "var(--color-gray-700)", borderStyle: "none", borderColor: "rgba(0,0,0,0)" }}>오늘 뭐 먹지?</h1>
          </div>
          <p className="text-gray-400 text-sm tracking-wide">
            지금 상황을 알려주면 메뉴를 추천해 드려요
          </p>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-5">
          <Section label="01" title="오늘 날씨는?">
            <div className="flex flex-wrap gap-2">
              {WEATHER_OPTIONS.map((o) => (
                <Chip key={o.id} icon={o.icon} label={o.label} selected={sel.weather === o.id} onClick={() => setSel((p) => ({ ...p, weather: o.id }))} />
              ))}
            </div>
          </Section>

          <Section label="02" title="지금 기분은?">
            <div className="flex flex-wrap gap-2">
              {MOOD_OPTIONS.map((o) => (
                <Chip key={o.id} icon={o.icon} label={o.label} selected={sel.mood === o.id} onClick={() => setSel((p) => ({ ...p, mood: o.id }))} />
              ))}
            </div>
          </Section>

          <Section label="03" title="몇 명이서 먹나요?">
            <Stepper value={sel.people} min={1} max={20} onChange={(v) => setSel((p) => ({ ...p, people: v }))} unit="명" />
          </Section>

          <Section label="04" title="못 먹는 음식">
            <TagInput
              tags={sel.allergies}
              onAdd={(t) => setSel((p) => ({ ...p, allergies: [...p.allergies, t] }))}
              onRemove={(t) => setSel((p) => ({ ...p, allergies: p.allergies.filter((x) => x !== t) }))}
              placeholder="예: 견과류, 해산물 — Enter로 추가"
            />
          </Section>

          <Section label="05" title="최근에 먹은 음식">
            <TagInput
              tags={sel.recentFood}
              onAdd={(t) => setSel((p) => ({ ...p, recentFood: [...p.recentFood, t] }))}
              onRemove={(t) => setSel((p) => ({ ...p, recentFood: p.recentFood.filter((x) => x !== t) }))}
              placeholder="예: 라면, 치킨 — Enter로 추가"
            />
          </Section>

          <Section label="06" title="추천 개수">
            <Stepper value={sel.count} min={1} max={10} onChange={(v) => setSel((p) => ({ ...p, count: v }))} unit="가지" />
          </Section>

          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full py-4 text-xl font-bold transition-all duration-200 active:scale-95 cursor-pointer"
            style={{
              fontFamily: "'Do Hyeon', sans-serif",
              background: canSubmit ? "#222" : "#ccc",
              color: canSubmit ? "#fff" : "#888",
              border: "2px solid #222",
              borderRadius: "12px",
              boxShadow: canSubmit ? "4px 4px 0 #888" : "none",
              letterSpacing: "0.05em",
            }}
          >
            {animating ? "메뉴 고르는 중 ..." : "메뉴 추천받기 →"}
          </button>

          {error && (
            <p className="text-sm text-red-500 text-center mt-1">{error}</p>
          )}
        </div>

        {/* Results */}
        {results && (
          <div className="mt-7 sketch-card p-6">
            <h2 className="text-2xl text-gray-900 text-center mb-5 headline tracking-wide">
              추천 메뉴
            </h2>
            <div className="flex flex-col">
              {results.map((menu, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 py-3 px-2"
                  style={{ borderBottom: i < results.length - 1 ? "1.5px dashed #ccc" : "none" }}
                >
                  <span className="font-mono text-gray-300 text-sm w-6 text-center flex-shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-gray-800 font-bold text-base">{menu}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2 mt-5">
              <button
                onClick={() => setView("roulette")}
                className="w-full py-3.5 text-base font-bold transition-all duration-200 active:scale-95 cursor-pointer"
                style={{
                  fontFamily: "'Do Hyeon', sans-serif",
                  background: "#fff",
                  color: "#222",
                  border: "2px solid #222",
                  borderRadius: "10px",
                  boxShadow: "3px 3px 0 #aaa",
                  letterSpacing: "0.04em",
                }}
              >
                모르겠어요. 룰렛 돌리기 🐯
              </button>
              <button
                onClick={() => setResults(null)}
                className="w-full py-2.5 text-sm font-bold text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
                style={{ border: "1.5px dashed #bbb", borderRadius: "8px", background: "transparent" }}
              >
                다시 선택하기
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
