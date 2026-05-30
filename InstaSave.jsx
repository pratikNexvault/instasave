import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useInView } from "framer-motion";

/* ─── PALETTE ─────────────────────────────────────────── */
const C = {
  bg: "#F5F9FF",
  surface: "#FFFFFF",
  ocean1: "#E0F7FA",
  ocean2: "#80DEEA",
  ocean3: "#00ACC1",
  ocean4: "#006064",
  sky1: "#E1F5FE",
  sky2: "#81D4FA",
  sky3: "#03A9F4",
  sky4: "#0277BD",
  lavender: "#E6E6FA",
  purple: "#9370DB",
  powder: "#B0E0E6",
  slate: "#334155",
  muted: "#64748B",
  border: "rgba(0,172,193,0.12)",
};

/* ─── FONT IMPORT ─────────────────────────────────────── */
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,300&display=swap";
document.head.appendChild(fontLink);

const styleEl = document.createElement("style");
styleEl.textContent = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { background: ${C.bg}; font-family: 'DM Sans', sans-serif; color: ${C.slate}; overflow-x: hidden; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: ${C.bg}; }
  ::-webkit-scrollbar-thumb { background: ${C.ocean2}; border-radius: 3px; }
  ::selection { background: ${C.ocean2}; color: white; }
  @keyframes float { 0%,100%{transform:translateY(0px) rotate(0deg)} 33%{transform:translateY(-18px) rotate(1.5deg)} 66%{transform:translateY(-8px) rotate(-1deg)} }
  @keyframes blobPulse { 0%,100%{transform:scale(1) rotate(0deg)} 50%{transform:scale(1.08) rotate(5deg)} }
  @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
  @keyframes spin { to{transform:rotate(360deg)} }
  @keyframes countUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
  .hero-blob { animation: blobPulse 7s ease-in-out infinite; }
  .floating { animation: float 6s ease-in-out infinite; }
  .btn-shimmer {
    background: linear-gradient(90deg, ${C.ocean3} 0%, ${C.sky3} 40%, ${C.ocean2} 60%, ${C.ocean3} 100%);
    background-size: 200% auto;
    animation: shimmer 2.5s linear infinite;
  }
`;
document.head.appendChild(styleEl);

/* ─── HELPERS ─────────────────────────────────────────── */
const API_BASE = "https://social-down-api.crezybotz.workers.dev/?key=iamry27&url=";

function isValidInstaURL(url) {
  return /instagram\.com\/(reel|p|tv|reels)\//i.test(url);
}

function useMouseParallax(strength = 20) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const move = (e) => {
      const x = ((e.clientX / window.innerWidth) - 0.5) * strength;
      const y = ((e.clientY / window.innerHeight) - 0.5) * strength;
      setPos({ x, y });
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [strength]);
  return pos;
}

/* ─── SVG LOGO ────────────────────────────────────────── */
function Logo({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <defs>
        <linearGradient id="lg1" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor={C.ocean3} />
          <stop offset="1" stopColor={C.sky3} />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="12" fill="url(#lg1)" />
      <rect x="12" y="12" width="16" height="16" rx="4" stroke="white" strokeWidth="2" fill="none" />
      <circle cx="20" cy="20" r="4" stroke="white" strokeWidth="2" fill="none" />
      <circle cx="27" cy="13" r="1.5" fill="white" />
      <path d="M20 26v6M17 29l3 3 3-3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function useWindowWidth() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return w;
}


function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);
  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 999,
        padding: "0 5%",
        height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: scrolled ? "rgba(245,249,255,0.88)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? `1px solid ${C.border}` : "1px solid transparent",
        transition: "all 0.4s ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Logo size={34} />
        <span style={{ fontFamily: "Sora", fontWeight: 700, fontSize: 18, color: C.ocean4, letterSpacing: "-0.02em" }}>InstaSave</span>
      </div>
      <div style={{ display: "flex", gap: 28, fontSize: 14, fontWeight: 500, color: C.muted }}>
        {["Features", "How It Works", "FAQ"].map(l => (
          <a key={l} href={`#${l.toLowerCase().replace(/ /g, "-")}`}
            style={{ textDecoration: "none", color: C.muted, transition: "color 0.2s" }}
            onMouseEnter={e => e.target.style.color = C.ocean3}
            onMouseLeave={e => e.target.style.color = C.muted}>
            {l}
          </a>
        ))}
      </div>
    </motion.nav>
  );
}

/* ─── ANIMATED COUNTER ────────────────────────────────── */
function Counter({ target, suffix = "", prefix = "" }) {
  const [val, setVal] = useState(0);
  const ref = useRef();
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / 60;
    const timer = setInterval(() => {
      start = Math.min(start + step, target);
      setVal(Math.floor(start));
      if (start >= target) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);
  return <span ref={ref}>{prefix}{val.toLocaleString()}{suffix}</span>;
}

/* ─── FADE UP ─────────────────────────────────────────── */
function FadeUp({ children, delay = 0, style = {} }) {
  const ref = useRef();
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      style={style}
    >
      {children}
    </motion.div>
  );
}

/* ─── LOADING SPINNER ─────────────────────────────────── */
function Spinner() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, padding: "48px 0" }}>
      <div style={{ position: "relative", width: 64, height: 64 }}>
        <div style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          border: `3px solid ${C.ocean1}`,
          borderTopColor: C.ocean3,
          animation: "spin 0.9s linear infinite",
        }} />
        <div style={{
          position: "absolute", inset: 8, borderRadius: "50%",
          border: `2px solid ${C.sky1}`,
          borderTopColor: C.sky3,
          animation: "spin 1.4s linear infinite reverse",
        }} />
        <div style={{ position: "absolute", inset: "50%", transform: "translate(-50%,-50%)" }}>
          <Logo size={20} />
        </div>
      </div>
      <motion.p
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.6, repeat: Infinity }}
        style={{ color: C.muted, fontSize: 14, fontWeight: 500 }}>
        Fetching your content…
      </motion.p>
    </div>
  );
}

/* ─── DOWNLOAD RESULT ─────────────────────────────────── */
function DownloadResult({ data }) {
  const [active, setActive] = useState(0);
  const medias = Array.isArray(data) ? data : data?.medias ?? (data?.url ? [data] : []);
  if (!medias.length) return <p style={{ textAlign: "center", color: C.muted, padding: 24 }}>No downloadable media found.</p>;

  const item = medias[active];
  const thumb = item?.thumbnail || item?.cover || null;
  const title = data?.title || data?.caption || "Instagram Media";
  const mediaType = item?.type?.toUpperCase() || "MEDIA";

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
      style={{ background: "white", borderRadius: 20, overflow: "hidden", boxShadow: "0 8px 48px rgba(0,172,193,0.12)", border: `1px solid ${C.border}` }}>
      {/* Thumbnail */}
      {thumb && (
        <div style={{ position: "relative", background: C.ocean1, minHeight: 220, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <img src={thumb} alt="Preview" style={{ width: "100%", maxHeight: 340, objectFit: "cover", display: "block" }}
            onError={e => e.target.style.display = "none"} />
          <span style={{
            position: "absolute", top: 12, right: 12, background: C.ocean3, color: "white",
            fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", padding: "4px 10px", borderRadius: 20,
          }}>{mediaType}</span>
        </div>
      )}
      <div style={{ padding: "24px 28px" }}>
        {title && (
          <p style={{ fontSize: 14, color: C.slate, fontWeight: 500, marginBottom: 16, lineHeight: 1.5,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{title}</p>
        )}
        {/* Carousel navigation */}
        {medias.length > 1 && (
          <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
            {medias.map((_, i) => (
              <button key={i} onClick={() => setActive(i)}
                style={{
                  width: 32, height: 32, borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600,
                  background: i === active ? C.ocean3 : C.ocean1, color: i === active ? "white" : C.ocean4,
                  transition: "all 0.2s",
                }}>{i + 1}</button>
            ))}
          </div>
        )}
        {/* Download buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {item?.url && (
            <a href={item.url} target="_blank" rel="noreferrer" download
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                padding: "13px 24px", borderRadius: 12, textDecoration: "none",
                background: `linear-gradient(135deg, ${C.ocean3}, ${C.sky3})`,
                color: "white", fontWeight: 600, fontSize: 14,
                boxShadow: `0 4px 16px rgba(3,169,244,0.3)`,
                transition: "transform 0.15s, box-shadow 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = `0 8px 24px rgba(3,169,244,0.4)`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = `0 4px 16px rgba(3,169,244,0.3)`; }}>
              ⬇ Download {mediaType === "VIDEO" ? "Video" : "Photo"} (HD)
            </a>
          )}
          {item?.downloadUrl && item.downloadUrl !== item.url && (
            <a href={item.downloadUrl} target="_blank" rel="noreferrer" download
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                padding: "13px 24px", borderRadius: 12, textDecoration: "none",
                background: C.ocean1, color: C.ocean4, fontWeight: 600, fontSize: 14,
                border: `1px solid ${C.ocean2}`, transition: "all 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = C.ocean2}
              onMouseLeave={e => e.currentTarget.style.background = C.ocean1}>
              ⬇ Alternate Download
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── HERO SECTION ────────────────────────────────────── */
function Hero() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const mouse = useMouseParallax(14);
  const windowWidth = useWindowWidth();
  const isDesktop = windowWidth >= 1024;

  const handleDownload = useCallback(async () => {
    const trimmed = url.trim();
    if (!trimmed) { setError("Please paste an Instagram URL first."); return; }
    if (!isValidInstaURL(trimmed)) { setError("Please enter a valid Instagram URL (reel, post, IGTV)."); return; }
    setError(""); setResult(null); setLoading(true);
    try {
      const res = await fetch(`${API_BASE}${encodeURIComponent(trimmed)}`);
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const json = await res.json();
      if (json.error || json.status === false) throw new Error(json.message || "Could not fetch media.");
      setResult(json);
    } catch (e) {
      setError(e.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [url]);

  const handleKeyDown = (e) => { if (e.key === "Enter") handleDownload(); };

  const pills = ["No Watermark", "Instant Download", "Mobile Friendly", "Unlimited Usage", "Fast Processing"];

  return (
    <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      position: "relative", overflow: "hidden", paddingTop: 80 }}>
      {/* Background blobs */}
      <div className="hero-blob" style={{ position: "absolute", width: 600, height: 600, borderRadius: "60% 40% 70% 30% / 50% 60% 40% 50%",
        background: `radial-gradient(ellipse, ${C.ocean1}cc, transparent)`, top: -120, right: -100, pointerEvents: "none" }} />
      <div className="hero-blob" style={{ position: "absolute", width: 400, height: 400, borderRadius: "40% 60% 30% 70% / 60% 40% 60% 40%",
        background: `radial-gradient(ellipse, ${C.lavender}99, transparent)`, bottom: -80, left: -80, pointerEvents: "none", animationDelay: "-3s" }} />
      <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%",
        background: `radial-gradient(ellipse, ${C.sky1}88, transparent)`, top: "20%", left: "5%", pointerEvents: "none",
        transform: `translate(${mouse.x * 0.3}px, ${mouse.y * 0.3}px)`, transition: "transform 0.12s ease-out" }} />

      {/* Floating decorative cards — desktop only */}
      {isDesktop && <>
        <motion.div className="floating" style={{ position: "absolute", left: "3%", top: "35%", zIndex: 1,
          background: "white", borderRadius: 16, padding: "12px 18px", boxShadow: "0 8px 32px rgba(0,172,193,0.15)",
          border: `1px solid ${C.border}`, fontSize: 13, fontWeight: 600, color: C.ocean4,
          transform: `translate(${mouse.x * 0.6}px, ${mouse.y * 0.6}px)`, animationDelay: "-1s" }}>
          🎬 Reels Ready
        </motion.div>
        <motion.div className="floating" style={{ position: "absolute", right: "3%", top: "30%", zIndex: 1,
          background: "white", borderRadius: 16, padding: "12px 18px", boxShadow: "0 8px 32px rgba(147,112,219,0.15)",
          border: `1px solid rgba(147,112,219,0.15)`, fontSize: 13, fontWeight: 600, color: C.purple,
          transform: `translate(${mouse.x * -0.5}px, ${mouse.y * -0.5}px)`, animationDelay: "-2.5s" }}>
          📸 HD Photos
        </motion.div>
        <motion.div className="floating" style={{ position: "absolute", right: "3%", bottom: "22%", zIndex: 1,
          background: "white", borderRadius: 16, padding: "12px 18px", boxShadow: "0 8px 32px rgba(3,169,244,0.12)",
          border: `1px solid rgba(3,169,244,0.12)`, fontSize: 13, fontWeight: 600, color: C.sky4,
          transform: `translate(${mouse.x * 0.4}px, ${mouse.y * 0.4}px)`, animationDelay: "-4s" }}>
          ⚡ Instant DL
        </motion.div>
      </>}

      <div style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: 720, padding: "0 24px", textAlign: "center" }}>
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, background: `linear-gradient(90deg, ${C.ocean1}, ${C.sky1})`,
            border: `1px solid ${C.ocean2}`, borderRadius: 40, padding: "6px 14px", marginBottom: 28, fontSize: 12, fontWeight: 600, color: C.ocean4 }}>
          ✨ Free · No signup · No watermark
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
          style={{ fontFamily: "Sora", fontSize: "clamp(2.2rem, 5vw, 3.8rem)", fontWeight: 800, lineHeight: 1.12,
            letterSpacing: "-0.03em", color: C.ocean4, marginBottom: 16 }}>
          Download Instagram<br />
          <span style={{ background: `linear-gradient(135deg, ${C.ocean3}, ${C.sky3})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Content Beautifully.
          </span>
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
          style={{ fontSize: 17, color: C.muted, marginBottom: 28, fontWeight: 400, lineHeight: 1.6 }}>
          Fast, Free and High Quality Instagram Downloader — Reels, Videos, Photos & Carousels.
        </motion.p>

        {/* Pills */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
          style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 32 }}>
          {pills.map((p, i) => (
            <motion.span key={p} initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + i * 0.07 }}
              style={{ background: "white", border: `1px solid ${C.border}`, borderRadius: 20, padding: "5px 14px",
                fontSize: 12, fontWeight: 500, color: C.muted, boxShadow: "0 2px 8px rgba(0,172,193,0.07)" }}>
              ✓ {p}
            </motion.span>
          ))}
        </motion.div>

        {/* Input box */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.6 }}
          style={{ background: "white", borderRadius: 20, padding: 8, boxShadow: "0 8px 48px rgba(0,172,193,0.14)",
            border: `1.5px solid ${error ? "#f87171" : C.ocean2}`, display: "flex", gap: 8, alignItems: "center",
            transition: "border-color 0.3s" }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, padding: "0 12px" }}>
            <span style={{ fontSize: 20 }}>🔗</span>
            <input
              value={url}
              onChange={e => { setUrl(e.target.value); setError(""); }}
              onKeyDown={handleKeyDown}
              placeholder="Paste Instagram URL here…"
              aria-label="Instagram URL input"
              style={{ flex: 1, border: "none", outline: "none", fontSize: 15, color: C.slate, background: "transparent",
                fontFamily: "'DM Sans', sans-serif", fontWeight: 400 }}
            />
          </div>
          <button
            onClick={handleDownload}
            disabled={loading}
            aria-label="Download"
            style={{
              padding: "13px 28px", borderRadius: 14, border: "none", cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 14, color: "white",
              background: loading ? C.ocean2 : `linear-gradient(135deg, ${C.ocean3}, ${C.sky3})`,
              boxShadow: loading ? "none" : "0 4px 16px rgba(3,169,244,0.35)",
              transition: "all 0.2s", whiteSpace: "nowrap",
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = "scale(1.02)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ""; }}>
            {loading ? "Fetching…" : "⬇ Download"}
          </button>
        </motion.div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ marginTop: 12, background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: 10,
                padding: "10px 16px", color: "#ef4444", fontSize: 13, fontWeight: 500 }}>
              ⚠ {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading */}
        <AnimatePresence>{loading && <Spinner />}</AnimatePresence>

        {/* Result */}
        <AnimatePresence>
          {result && !loading && (
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ marginTop: 28, textAlign: "left" }}>
              <DownloadResult data={result} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

/* ─── STATS ───────────────────────────────────────────── */
function Stats() {
  const stats = [
    { label: "Downloads Served", value: 12500000, suffix: "+" },
    { label: "Happy Users", value: 890000, suffix: "+" },
    { label: "Uptime", value: 99, suffix: ".9%", prefix: "" },
    { label: "Countries", value: 180, suffix: "+" },
  ];
  return (
    <section style={{ padding: "80px 5%", background: `linear-gradient(135deg, ${C.ocean4}, ${C.sky4})` }}>
      <div style={{ maxWidth: 960, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 32 }}>
        {stats.map((s, i) => (
          <FadeUp key={s.label} delay={i * 0.1}>
            <div style={{ textAlign: "center", color: "white" }}>
              <div style={{ fontFamily: "Sora", fontSize: "clamp(2rem, 4vw, 2.8rem)", fontWeight: 800, letterSpacing: "-0.03em" }}>
                <Counter target={s.value} suffix={s.suffix} prefix={s.prefix} />
              </div>
              <div style={{ opacity: 0.75, fontSize: 14, marginTop: 4, fontWeight: 500 }}>{s.label}</div>
            </div>
          </FadeUp>
        ))}
      </div>
    </section>
  );
}

/* ─── FEATURES ────────────────────────────────────────── */
function Features() {
  const features = [
    { icon: "🎬", title: "Reel Downloader", desc: "Save any Instagram Reel in full HD quality directly to your device." },
    { icon: "🎥", title: "Video Downloader", desc: "Download any Instagram video including IGTV content instantly." },
    { icon: "📸", title: "Photo Downloader", desc: "Save high-resolution Instagram photos without compression." },
    { icon: "🖼️", title: "Carousel Downloader", desc: "Download every image and video from multi-post carousels." },
    { icon: "📱", title: "Mobile Optimized", desc: "Perfectly designed for Android and iPhone — no app needed." },
    { icon: "⚡", title: "Fast API Response", desc: "Powered by a low-latency global API for instant media fetching." },
    { icon: "🔒", title: "Secure Processing", desc: "Your URLs are never stored. 100% private and anonymous." },
    { icon: "♾️", title: "Unlimited Downloads", desc: "No daily limits. Download as much content as you need for free." },
  ];
  return (
    <section id="features" style={{ padding: "100px 5%", background: C.bg }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <FadeUp>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", color: C.ocean3, textTransform: "uppercase" }}>Everything You Need</span>
            <h2 style={{ fontFamily: "Sora", fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", fontWeight: 800, color: C.ocean4,
              marginTop: 10, letterSpacing: "-0.025em" }}>Powerful Features,<br />Simple Experience.</h2>
          </div>
        </FadeUp>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 20 }}>
          {features.map((f, i) => (
            <FadeUp key={f.title} delay={i * 0.06}>
              <motion.div whileHover={{ y: -6, boxShadow: `0 16px 48px rgba(0,172,193,0.14)` }}
                transition={{ type: "spring", stiffness: 300 }}
                style={{ background: "white", borderRadius: 20, padding: "28px 24px",
                  border: `1px solid ${C.border}`, cursor: "default",
                  boxShadow: "0 2px 12px rgba(0,172,193,0.06)" }}>
                <div style={{ fontSize: 32, marginBottom: 14 }}>{f.icon}</div>
                <div style={{ fontFamily: "Sora", fontWeight: 700, fontSize: 15, color: C.ocean4, marginBottom: 8 }}>{f.title}</div>
                <div style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.6 }}>{f.desc}</div>
              </motion.div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── HOW IT WORKS ────────────────────────────────────── */
function HowItWorks() {
  const steps = [
    { num: "01", icon: "📋", title: "Paste the URL", desc: "Copy any Instagram post, reel, or video URL and paste it into the input field above." },
    { num: "02", icon: "🔍", title: "Fetch Content", desc: "Our API instantly retrieves the media metadata and available download qualities." },
    { num: "03", icon: "💾", title: "Download Media", desc: "Click the download button to save photos or videos to your device in HD." },
  ];
  return (
    <section id="how-it-works" style={{ padding: "100px 5%", background: `linear-gradient(180deg, ${C.sky1}40, ${C.ocean1}30)` }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <FadeUp>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", color: C.ocean3, textTransform: "uppercase" }}>Simple Process</span>
            <h2 style={{ fontFamily: "Sora", fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", fontWeight: 800, color: C.ocean4,
              marginTop: 10, letterSpacing: "-0.025em" }}>Done in 3 Simple Steps.</h2>
          </div>
        </FadeUp>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 32 }}>
          {steps.map((s, i) => (
            <FadeUp key={s.num} delay={i * 0.15}>
              <div style={{ textAlign: "center" }}>
                <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center",
                  width: 80, height: 80, borderRadius: "50%", marginBottom: 20,
                  background: `linear-gradient(135deg, ${C.ocean1}, ${C.sky1})`,
                  border: `2px solid ${C.ocean2}`, boxShadow: `0 8px 24px rgba(0,172,193,0.15)` }}>
                  <span style={{ fontSize: 32 }}>{s.icon}</span>
                  <span style={{ position: "absolute", top: -4, right: -4, background: C.ocean3, color: "white",
                    width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, fontWeight: 800, fontFamily: "Sora" }}>{i + 1}</span>
                </div>
                <h3 style={{ fontFamily: "Sora", fontWeight: 700, fontSize: 17, color: C.ocean4, marginBottom: 10 }}>{s.title}</h3>
                <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.65 }}>{s.desc}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── TESTIMONIALS ────────────────────────────────────── */
function Testimonials() {
  const items = [
    { name: "Alex M.", role: "Content Creator", text: "InstaSave is the cleanest downloader I've used. No ads, no watermarks — just pure speed.", avatar: "👨‍💻" },
    { name: "Sofia K.", role: "Social Media Manager", text: "I use it daily for archiving client content. The carousel support is a lifesaver!", avatar: "👩‍💼" },
    { name: "Raj P.", role: "Photographer", text: "Finally a downloader that doesn't compromise on quality. HD every single time.", avatar: "📷" },
    { name: "Emma L.", role: "Influencer", text: "The interface is beautiful and it works perfectly on my iPhone. 10/10.", avatar: "🌟" },
    { name: "Marcus T.", role: "Developer", text: "Fast API, clean UI, and no annoying popups. Exactly what a downloader should be.", avatar: "⚡" },
    { name: "Yuki N.", role: "Digital Marketer", text: "I recommend InstaSave to my entire team. It's become essential to our workflow.", avatar: "🚀" },
  ];
  return (
    <section style={{ padding: "100px 5%", background: C.bg }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <FadeUp>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", color: C.ocean3, textTransform: "uppercase" }}>Loved Worldwide</span>
            <h2 style={{ fontFamily: "Sora", fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", fontWeight: 800, color: C.ocean4,
              marginTop: 10, letterSpacing: "-0.025em" }}>What Our Users Say.</h2>
          </div>
        </FadeUp>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
          {items.map((t, i) => (
            <FadeUp key={t.name} delay={i * 0.07}>
              <div style={{ background: "white", borderRadius: 20, padding: "24px 24px 28px",
                border: `1px solid ${C.border}`, boxShadow: "0 2px 12px rgba(0,172,193,0.06)" }}>
                <div style={{ color: C.ocean3, fontSize: 18, marginBottom: 12 }}>★★★★★</div>
                <p style={{ color: C.slate, fontSize: 14, lineHeight: 1.65, marginBottom: 20, fontStyle: "italic" }}>"{t.text}"</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: `linear-gradient(135deg, ${C.ocean1}, ${C.sky1})`,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{t.avatar}</div>
                  <div>
                    <div style={{ fontFamily: "Sora", fontWeight: 700, fontSize: 13, color: C.ocean4 }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: C.muted }}>{t.role}</div>
                  </div>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── YOUTUBE PROMO ───────────────────────────────────── */
function YouTubePromo() {
  return (
    <section style={{ padding: "80px 5%" }}>
      <div style={{ maxWidth: 780, margin: "0 auto" }}>
        <FadeUp>
          <div style={{ background: `linear-gradient(135deg, ${C.ocean4}, ${C.sky4})`,
            borderRadius: 28, padding: "48px 40px", textAlign: "center", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%",
              background: "rgba(255,255,255,0.05)", top: -80, right: -80 }} />
            <div style={{ position: "absolute", width: 200, height: 200, borderRadius: "50%",
              background: "rgba(255,255,255,0.07)", bottom: -60, left: -60 }} />
            <span style={{ fontSize: 40, display: "block", marginBottom: 16 }}>▶️</span>
            <h2 style={{ fontFamily: "Sora", fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 800, color: "white",
              marginBottom: 12, letterSpacing: "-0.02em" }}>Need YouTube Downloads Too?</h2>
            <p style={{ color: "rgba(255,255,255,0.78)", fontSize: 15, marginBottom: 28, lineHeight: 1.6 }}>
              Download YouTube videos in HD using our dedicated YouTube downloader.
            </p>
            <a href="#"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "white",
                color: C.ocean4, textDecoration: "none", padding: "13px 28px", borderRadius: 14,
                fontFamily: "Sora", fontWeight: 700, fontSize: 14,
                boxShadow: "0 4px 20px rgba(0,0,0,0.2)", transition: "transform 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.transform = "scale(1.03)"}
              onMouseLeave={e => e.currentTarget.style.transform = ""}>
              Visit YouTube Downloader →
            </a>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

/* ─── FAQ ─────────────────────────────────────────────── */
function FAQ() {
  const [open, setOpen] = useState(null);
  const faqs = [
    { q: "Is InstaSave completely free to use?", a: "Yes, InstaSave is 100% free with no hidden charges, subscriptions, or paywalls. Download unlimited content at no cost." },
    { q: "Do I need to create an account to download Instagram content?", a: "No account or registration is required. Just paste your Instagram URL and click download — that's it." },
    { q: "Can I download Instagram Reels?", a: "Absolutely. InstaSave fully supports Instagram Reels. Paste the Reel URL and download in HD quality instantly." },
    { q: "Does InstaSave add a watermark to downloads?", a: "Never. All downloads are completely watermark-free in their original quality." },
    { q: "How do I download a carousel post?", a: "Paste the carousel post URL and InstaSave will detect all media items. Navigate between them using the numbered buttons and download each one." },
    { q: "Can I download private Instagram content?", a: "InstaSave only works with publicly accessible Instagram content. Private accounts or content behind login are not supported." },
    { q: "Is InstaSave safe to use?", a: "Yes. We never store your URLs, personal data, or downloaded media. All processing is done securely and anonymously." },
    { q: "Which devices does InstaSave support?", a: "InstaSave works on all devices — Android, iPhone, iPad, Mac, Windows, and Linux — in any modern web browser." },
    { q: "What Instagram content types are supported?", a: "We support Reels, Videos, Photos, Carousel Posts, IGTV, and Stories (when publicly available)." },
    { q: "Why isn't my Instagram URL working?", a: "Make sure the URL is from a public Instagram post and formatted correctly (e.g. instagram.com/reel/... or instagram.com/p/...). Private content is not supported." },
    { q: "How long does downloading take?", a: "Most downloads complete in under 3 seconds thanks to our globally distributed API infrastructure." },
    { q: "Is there a daily download limit?", a: "No. InstaSave is completely unlimited — download as many files as you need, as many times as you like." },
  ];
  return (
    <section id="faq" style={{ padding: "100px 5%", background: `linear-gradient(180deg, ${C.bg}, ${C.ocean1}30)` }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <FadeUp>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", color: C.ocean3, textTransform: "uppercase" }}>Got Questions?</span>
            <h2 style={{ fontFamily: "Sora", fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", fontWeight: 800, color: C.ocean4,
              marginTop: 10, letterSpacing: "-0.025em" }}>Frequently Asked Questions.</h2>
          </div>
        </FadeUp>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {faqs.map((f, i) => (
            <FadeUp key={i} delay={i * 0.03}>
              <div style={{ background: "white", borderRadius: 16, border: `1px solid ${open === i ? C.ocean2 : C.border}`,
                overflow: "hidden", transition: "border-color 0.25s" }}>
                <button onClick={() => setOpen(open === i ? null : i)}
                  style={{ width: "100%", textAlign: "left", padding: "18px 22px", border: "none", background: "transparent",
                    cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center",
                    fontFamily: "'DM Sans', sans-serif", fontSize: 14.5, fontWeight: 600, color: C.ocean4 }}>
                  {f.q}
                  <span style={{ fontSize: 18, color: C.ocean3, transition: "transform 0.3s", display: "inline-block",
                    transform: open === i ? "rotate(45deg)" : "rotate(0deg)" }}>+</span>
                </button>
                <AnimatePresence>
                  {open === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}
                      style={{ overflow: "hidden" }}>
                      <p style={{ padding: "0 22px 18px", color: C.muted, fontSize: 14, lineHeight: 1.7 }}>{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── FOOTER ──────────────────────────────────────────── */
function Footer() {
  return (
    <footer style={{ background: C.ocean4, color: "rgba(255,255,255,0.7)", padding: "56px 5% 32px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 40, marginBottom: 48 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <Logo size={32} />
              <span style={{ fontFamily: "Sora", fontWeight: 700, fontSize: 17, color: "white" }}>InstaSave</span>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.7, color: "rgba(255,255,255,0.6)" }}>
              The premium Instagram downloader for Reels, Videos, Photos & Carousels. Free, fast and watermark-free.
            </p>
          </div>
          <div>
            <h4 style={{ fontFamily: "Sora", fontWeight: 700, fontSize: 13, color: "white", letterSpacing: "0.08em",
              textTransform: "uppercase", marginBottom: 16 }}>Product</h4>
            {["Home", "Features", "How It Works", "FAQ"].map(l => (
              <a key={l} href="#" style={{ display: "block", fontSize: 13.5, color: "rgba(255,255,255,0.6)",
                textDecoration: "none", marginBottom: 9, transition: "color 0.2s" }}
                onMouseEnter={e => e.target.style.color = "white"}
                onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.6)"}>{l}</a>
            ))}
          </div>
          <div>
            <h4 style={{ fontFamily: "Sora", fontWeight: 700, fontSize: 13, color: "white", letterSpacing: "0.08em",
              textTransform: "uppercase", marginBottom: 16 }}>Legal</h4>
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map(l => (
              <a key={l} href="#" style={{ display: "block", fontSize: 13.5, color: "rgba(255,255,255,0.6)",
                textDecoration: "none", marginBottom: 9, transition: "color 0.2s" }}
                onMouseEnter={e => e.target.style.color = "white"}
                onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.6)"}>{l}</a>
            ))}
          </div>
          <div>
            <h4 style={{ fontFamily: "Sora", fontWeight: 700, fontSize: 13, color: "white", letterSpacing: "0.08em",
              textTransform: "uppercase", marginBottom: 16 }}>Support</h4>
            {["Contact Us", "Report a Bug", "Request Feature"].map(l => (
              <a key={l} href="#" style={{ display: "block", fontSize: 13.5, color: "rgba(255,255,255,0.6)",
                textDecoration: "none", marginBottom: 9, transition: "color 0.2s" }}
                onMouseEnter={e => e.target.style.color = "white"}
                onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.6)"}>{l}</a>
            ))}
          </div>
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.12)", paddingTop: 24, display: "flex",
          justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <span style={{ fontSize: 13 }}>© 2025 InstaSave. Not affiliated with Instagram or Meta.</span>
          <span style={{ fontSize: 13 }}>Made with ♥ for creators worldwide</span>
        </div>
      </div>
    </footer>
  );
}

/* ─── APP ─────────────────────────────────────────────── */
export default function App() {
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <Features />
        <HowItWorks />
        <Testimonials />
        <YouTubePromo />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
