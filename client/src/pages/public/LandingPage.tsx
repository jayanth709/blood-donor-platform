import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import {
  HeartHandshake, Zap, Shield, ArrowRight, Clock,
  CheckCircle2, AlertTriangle, Activity, Users, Hospital,
  Droplets, ChevronDown, Star, MapPin, Phone
} from 'lucide-react';

// ─── Floating Particle ────────────────────────────────────────────────────
const Particle = ({ x, y, size, delay }: { x: number; y: number; size: number; delay: number }) => (
  <motion.div
    className="absolute rounded-full bg-red-500 pointer-events-none"
    style={{ left: `${x}%`, top: `${y}%`, width: size, height: size }}
    animate={{ y: [-10, 10, -10], opacity: [0.2, 0.6, 0.2], scale: [1, 1.2, 1] }}
    transition={{ duration: 4 + delay, repeat: Infinity, delay, ease: 'easeInOut' }}
  />
);

// ─── Animated Counter ─────────────────────────────────────────────────────
const Counter = ({ from, to, suffix = '', duration = 2 }: { from: number; to: number; suffix?: string; duration?: number }) => {
  const [count, setCount] = useState(from);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(from + (to - from) * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [inView, from, to, duration]);

  return <div ref={ref}>{count}{suffix}</div>;
};

// ─── Fade In when in view ────────────────────────────────────────────────
const FadeIn = ({ children, delay = 0, y = 30, className = '' }: { children: React.ReactNode; delay?: number; y?: number; className?: string }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </motion.div>
  );
};

// ─── Blood Drop SVG ──────────────────────────────────────────────────────
const BloodDrop = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 40 56" className={className} fill="currentColor">
    <path d="M20 0 C20 0 2 20 2 34 C2 45 10 54 20 54 C30 54 38 45 38 34 C38 20 20 0 20 0Z" />
  </svg>
);

// ─── Heartbeat Line SVG ───────────────────────────────────────────────────
const HeartbeatLine = () => (
  <svg viewBox="0 0 300 60" className="w-full h-10 text-red-500" fill="none" stroke="currentColor" strokeWidth="2.5">
    <motion.path
      d="M0 30 L60 30 L80 8 L95 52 L110 20 L125 40 L140 30 L300 30"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 2, ease: 'easeInOut', repeat: Infinity, repeatDelay: 1 }}
    />
  </svg>
);

// ─── STATS LABELS (values loaded live from backend) ──────────────────────
const STAT_DEFS = [
  { key: 'totalDonors',    label: 'Registered Donors',             suffix: '',  color: '#dc1a3c' },
  { key: 'totalHospitals', label: 'Partner Hospitals',             suffix: '',  color: '#f97316' },
  { key: 'totalRequests',  label: 'Emergency Requests Created',    suffix: '',  color: '#10b981' },
  { key: 'fulfilled',      label: 'Requests Successfully Fulfilled', suffix: '', color: '#6366f1' },
];

// ─── HOW IT WORKS ─────────────────────────────────────────────────────────
const STEPS = [
  {
    num: '01',
    icon: Hospital,
    title: 'Hospital Broadcasts Alert',
    desc: 'Emergency department logs blood group, units needed, urgency level (CRITICAL / HIGH / NORMAL), and pickup location in under 60 seconds.',
    color: 'from-red-600 to-rose-500',
    glow: 'rgba(220,26,60,0.4)',
  },
  {
    num: '02',
    icon: Zap,
    title: 'Smart Donor Matching',
    desc: 'The platform instantly cross-references blood compatibility, donor availability, eligibility status, and area/pincode proximity. No GPS API required.',
    color: 'from-orange-600 to-amber-500',
    glow: 'rgba(249,115,22,0.4)',
  },
  {
    num: '03',
    icon: Activity,
    title: 'Real-Time Response Tracking',
    desc: 'Matched donors receive alerts, accept with ETA, and hospitals track fulfillment live. Admin oversees the platform from a central monitoring dashboard.',
    color: 'from-emerald-600 to-teal-500',
    glow: 'rgba(16,185,129,0.4)',
  },
];

// ─── FEATURES ─────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: Shield, title: 'Clinical Eligibility Engine', desc: 'Rule-based triage checks age (18–65), weight (≥50 kg), chronic illness, and 90-day donation gap. No AI — deterministic and auditable.' },
  { icon: Droplets, title: 'ABO + Rh Compatibility', desc: 'Full 8-group blood compatibility matrix built into the matching engine. Universal donors (O−) automatically flagged for CRITICAL requests.' },
  { icon: MapPin, title: 'Area-Based Local Matching', desc: 'Pincode & area-level matching within the same city. Closest donors always surface first. Zero paid location APIs used.' },
  { icon: Clock, title: '< 3 Minute Dispatch Target', desc: 'From request broadcast to first donor notification — the system targets sub-3 minute identification for CRITICAL urgency cases.' },
  { icon: Users, title: 'Role-Isolated Dashboards', desc: 'Donors, Hospitals, and Admins each access role-specific dashboards. JWT-secured endpoints prevent cross-role data leakage.' },
  { icon: CheckCircle2, title: 'Donation History & Audit Trail', desc: 'Every fulfilled donation is automatically recorded in the donation_history table with timestamp, hospital, and blood group for full traceability.' },
];

// ─── BLOOD GROUPS ─────────────────────────────────────────────────────────
const BLOOD_GROUPS = ['A+', 'A−', 'B+', 'B−', 'AB+', 'AB−', 'O+', 'O−'];

// ═════════════════════════════════════════════════════════════════════════════
// LANDING PAGE COMPONENT
// ═════════════════════════════════════════════════════════════════════════════
export const LandingPage: React.FC = () => {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [navScrolled, setNavScrolled] = useState(false);

  // ── Live stats from backend ──────────────────────────────────────────────
  const [liveStats, setLiveStats] = useState({ totalDonors: 0, totalHospitals: 0, totalRequests: 0, fulfilled: 0 });

  useEffect(() => {
    // Fetch real counts from the backend — no mock numbers
    fetch('http://localhost:5000/api/public/stats')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.stats) {
          const s = data.stats;
          setLiveStats({
            totalDonors:    s.total_donors    ?? s.totalDonors    ?? 0,
            totalHospitals: s.total_hospitals ?? s.totalHospitals ?? 0,
            totalRequests:  s.total_requests  ?? s.totalEmergenciesLogged ?? 0,
            fulfilled:      s.completed_requests ?? s.completedRequests ?? 0,
          });
        }
      })
      .catch(() => {}); // silently fail — stats are decorative on landing
  }, []);

  useEffect(() => {
    const handleScroll = () => setNavScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Particles config
  const particles = [
    { x: 10, y: 20, size: 4, delay: 0 },
    { x: 85, y: 15, size: 6, delay: 1.2 },
    { x: 25, y: 70, size: 3, delay: 0.5 },
    { x: 70, y: 60, size: 5, delay: 2 },
    { x: 50, y: 85, size: 4, delay: 1.5 },
    { x: 92, y: 75, size: 3, delay: 0.8 },
    { x: 5, y: 55, size: 5, delay: 3 },
    { x: 60, y: 10, size: 3, delay: 1.8 },
  ];

  return (
    <div className="min-h-screen bg-[#050810] text-white overflow-x-hidden">

      {/* ── NAVBAR ──────────────────────────────────────────────────────────── */}
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          navScrolled
            ? 'bg-[#050810]/90 backdrop-blur-xl border-b border-white/[0.06] shadow-2xl shadow-black/50'
            : 'bg-transparent'
        }`}
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <motion.div className="flex items-center gap-2.5" whileHover={{ scale: 1.03 }}>
            <div className="relative w-9 h-9">
              <div className="absolute inset-0 rounded-xl bg-red-600 blur-md opacity-60" />
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-red-700 to-rose-500 flex items-center justify-center shadow-lg shadow-red-900/40">
                <HeartHandshake className="w-5 h-5 text-white animate-heartbeat" />
              </div>
            </div>
            <div>
              <span className="text-lg font-black tracking-tight">
                Blood<span className="text-red-500">Link</span>
              </span>
              <div className="text-[9px] text-white/40 font-medium tracking-widest uppercase -mt-0.5">Emergency Platform</div>
            </div>
          </motion.div>

          {/* Nav Actions */}
          <div className="flex items-center gap-3">
            <Link to="/login">
              <motion.button
                className="px-4 py-2 text-sm font-semibold text-white/70 hover:text-white transition-colors duration-200"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Sign In
              </motion.button>
            </Link>
            <Link to="/register/donor">
              <motion.button
                className="relative px-5 py-2.5 text-sm font-bold text-white rounded-xl overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #dc1a3c, #ff1744)' }}
                whileHover={{ scale: 1.04, boxShadow: '0 0 25px rgba(220,26,60,0.5)' }}
                whileTap={{ scale: 0.96 }}
              >
                <span className="relative z-10">Register as Donor</span>
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.header>


      {/* ── HERO SECTION ────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-28">

        {/* Background gradient orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="blob-orb w-[600px] h-[600px] bg-red-700/20"
            style={{ top: '-10%', left: '-10%' }}
            animate={{ scale: [1, 1.15, 1], x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="blob-orb w-[500px] h-[500px] bg-rose-900/15"
            style={{ bottom: '-5%', right: '-5%' }}
            animate={{ scale: [1, 1.2, 1], x: [0, -25, 0], y: [0, 20, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          />
          <motion.div
            className="blob-orb w-[300px] h-[300px] bg-red-600/10"
            style={{ top: '40%', left: '40%' }}
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
          />

          {/* Grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />

          {/* Particles */}
          {particles.map((p, i) => <Particle key={i} {...p} />)}
        </div>

        <motion.div
          className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
          style={{ y: heroY, opacity: heroOpacity }}
        >

          {/* Main headline */}
          <motion.h1
            className="text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight leading-[0.95] mb-6"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <span className="block text-white">When Seconds</span>
            <span className="block" style={{
              background: 'linear-gradient(135deg, #ff4d6d 0%, #dc1a3c 50%, #ff1744 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>Determine</span>
            <span className="block text-white">Survival.</span>
          </motion.h1>

          {/* Spacer — heartbeat line removed */}
          <div className="mb-6" />

          {/* Sub-headline */}
          <motion.p
            className="text-base sm:text-lg text-white/55 max-w-2xl mx-auto leading-relaxed font-normal mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
          >
            BloodLink connects verified, available, and compatible blood donors with hospitals during emergencies — through deterministic matching, not guesswork.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.75 }}
          >
            <Link to="/register/donor">
              <motion.button
                className="group relative px-8 py-4 rounded-2xl font-bold text-white text-base overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #dc1a3c, #ff1744)',
                  boxShadow: '0 8px 32px rgba(220,26,60,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
                }}
                whileHover={{ scale: 1.05, boxShadow: '0 12px 40px rgba(220,26,60,0.6), inset 0 1px 0 rgba(255,255,255,0.1)' }}
                whileTap={{ scale: 0.97 }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Droplets className="w-4 h-4" />
                  Register as Blood Donor
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </motion.button>
            </Link>

            <Link to="/register/hospital">
              <motion.button
                className="group px-8 py-4 rounded-2xl font-semibold text-white/80 hover:text-white text-base border border-white/[0.12] hover:border-white/25 transition-all duration-300"
                style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(10px)' }}
                whileHover={{ scale: 1.03, background: 'rgba(255,255,255,0.08)' }}
                whileTap={{ scale: 0.97 }}
              >
                <span className="flex items-center gap-2">
                  <Hospital className="w-4 h-4" />
                  Hospital Onboarding
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </motion.button>
            </Link>

            <Link to="/login">
              <motion.button
                className="px-6 py-4 font-semibold text-white/50 hover:text-white/80 text-base transition-colors duration-200"
                whileHover={{ scale: 1.02 }}
              >
                Sign In →
              </motion.button>
            </Link>
          </motion.div>

          {/* Blood Group Selector (decorative + interactive) */}
          <motion.div
            className="max-w-xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1 }}
          >
            <p className="text-white/30 text-xs font-semibold uppercase tracking-widest mb-3">All blood groups supported</p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {BLOOD_GROUPS.map((group) => (
                <motion.button
                  key={group}
                  className={`w-12 h-12 rounded-xl text-sm font-black border transition-all duration-200 ${
                    activeGroup === group
                      ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-900/40'
                      : 'bg-white/[0.04] border-white/[0.08] text-white/50 hover:bg-white/[0.08] hover:text-white/80 hover:border-white/20'
                  }`}
                  onClick={() => setActiveGroup(activeGroup === group ? null : group)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.92 }}
                >
                  {group}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-white/20 text-[10px] font-semibold uppercase tracking-widest">Scroll</span>
            <ChevronDown className="w-4 h-4 text-white/20" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── STATS SECTION ────────────────────────────────────────────────────── */}
      <section className="py-20 relative">
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'linear-gradient(180deg, transparent 0%, rgba(220,26,60,0.04) 50%, transparent 100%)'
        }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {STAT_DEFS.map((stat, i) => (
              <FadeIn key={stat.label} delay={i * 0.1}>
                <div className="glass-card rounded-2xl p-6 text-center glass-card-hover">
                  <div className="text-4xl lg:text-5xl font-black mb-2" style={{ color: stat.color }}>
                    <Counter from={0} to={(liveStats as any)[stat.key] ?? 0} suffix={stat.suffix} duration={2.5} />
                  </div>
                  <div className="text-white/50 text-xs font-semibold uppercase tracking-wider">{stat.label}</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────────── */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-5"
              style={{ background: 'rgba(220,26,60,0.1)', border: '1px solid rgba(220,26,60,0.2)' }}>
              <Activity className="w-3.5 h-3.5 text-red-500" />
              <span className="text-red-400 text-xs font-bold uppercase tracking-widest">Response Pipeline</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white mb-4">
              Three Stages.<br /><span style={{ color: '#dc1a3c' }}>One Mission.</span>
            </h2>
            <p className="text-white/45 text-base max-w-xl mx-auto leading-relaxed">
              Engineered for speed. Designed for hospitals. Trusted by donors.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-1/3 left-[25%] right-[25%] h-px"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(220,26,60,0.4), transparent)' }} />

            {STEPS.map((step, i) => (
              <FadeIn key={step.num} delay={i * 0.15}>
                <motion.div
                  className="relative glass-card rounded-3xl p-8 overflow-hidden group cursor-default"
                  whileHover={{ scale: 1.02, borderColor: 'rgba(220,26,60,0.3)' }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Step number glow */}
                  <div className="absolute top-6 right-6 text-6xl font-black text-white/[0.04] select-none">{step.num}</div>

                  {/* Icon */}
                  <div className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-6 shadow-lg`}
                    style={{ boxShadow: `0 8px 24px ${step.glow}` }}>
                    <step.icon className="w-7 h-7 text-white" />
                  </div>

                  <h3 className="text-lg font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-white/45 text-sm leading-relaxed">{step.desc}</p>

                  {/* Bottom accent line */}
                  <motion.div
                    className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r ${step.color}`}
                    initial={{ width: '0%' }}
                    whileInView={{ width: '100%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.3 + i * 0.15 }}
                  />
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ─────────────────────────────────────────────────────── */}
      <section className="py-24 relative">
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% 50%, rgba(220,26,60,0.05) 0%, transparent 70%)'
        }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-5"
              style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
              <Shield className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-indigo-400 text-xs font-bold uppercase tracking-widest">Platform Capabilities</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white mb-4">
              Built for the{' '}
              <span style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Healthcare
              </span>{' '}
              Ecosystem
            </h2>
            <p className="text-white/45 text-base max-w-xl mx-auto leading-relaxed">
              Every feature is clinically grounded, technically rigorous, and privacy-conscious.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((feat, i) => (
              <FadeIn key={feat.title} delay={i * 0.08} y={20}>
                <motion.div
                  className="glass-card rounded-2xl p-6 group h-full"
                  whileHover={{ y: -6, boxShadow: '0 20px 60px rgba(0,0,0,0.4), 0 0 1px rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.12)' }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="w-11 h-11 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center mb-4 group-hover:bg-red-600/20 group-hover:border-red-500/30 transition-all duration-300">
                    <feat.icon className="w-5 h-5 text-white/60 group-hover:text-red-400 transition-colors duration-300" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{feat.title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed">{feat.desc}</p>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── ROLE CARDS SECTION ──────────────────────────────────────────────── */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4 tracking-tight">
              Who Uses BloodLink?
            </h2>
            <p className="text-white/40 text-base max-w-lg mx-auto">Three distinct roles. One unified emergency response network.</p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* DONOR CARD */}
            <FadeIn delay={0}>
              <motion.div
                className="relative rounded-3xl overflow-hidden group"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <div className="absolute inset-0" style={{
                  background: 'linear-gradient(135deg, rgba(220,26,60,0.2) 0%, rgba(220,26,60,0.05) 100%)',
                  border: '1px solid rgba(220,26,60,0.2)',
                }} />
                <div className="relative p-8">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                    style={{ background: 'rgba(220,26,60,0.2)', border: '1px solid rgba(220,26,60,0.3)' }}>
                    <Droplets className="w-7 h-7 text-red-400" />
                  </div>
                  <div className="text-red-400 text-xs font-bold uppercase tracking-widest mb-2">For Donors</div>
                  <h3 className="text-xl font-black text-white mb-3">Be the Hero Someone Needs</h3>
                  <p className="text-white/45 text-sm leading-relaxed mb-6">
                    Register, set your availability, and receive emergency blood request alerts matching your blood group and location.
                  </p>
                  <ul className="space-y-2 mb-8">
                    {['One-time registration', 'Toggle availability anytime', 'Accept/decline alerts freely', 'Full donation history'].map((item) => (
                      <li key={item} className="flex items-center gap-2 text-white/60 text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link to="/register/donor">
                    <motion.button
                      className="w-full py-3 rounded-xl font-bold text-sm text-white"
                      style={{ background: 'linear-gradient(135deg, #dc1a3c, #ff1744)', boxShadow: '0 4px 20px rgba(220,26,60,0.4)' }}
                      whileHover={{ boxShadow: '0 8px 30px rgba(220,26,60,0.6)' }}
                    >
                      Register as Donor
                    </motion.button>
                  </Link>
                </div>
              </motion.div>
            </FadeIn>

            {/* HOSPITAL CARD */}
            <FadeIn delay={0.1}>
              <motion.div
                className="relative rounded-3xl overflow-hidden group"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <div className="absolute inset-0" style={{
                  background: 'linear-gradient(135deg, rgba(249,115,22,0.15) 0%, rgba(249,115,22,0.04) 100%)',
                  border: '1px solid rgba(249,115,22,0.2)',
                }} />
                <div className="relative p-8">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                    style={{ background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.25)' }}>
                    <Hospital className="w-7 h-7 text-orange-400" />
                  </div>
                  <div className="text-orange-400 text-xs font-bold uppercase tracking-widest mb-2">For Hospitals</div>
                  <h3 className="text-xl font-black text-white mb-3">Emergency Blood, Fast</h3>
                  <p className="text-white/45 text-sm leading-relaxed mb-6">
                    Broadcast emergency blood requests in under 60 seconds. Track donor responses in real time from your dedicated dashboard.
                  </p>
                  <ul className="space-y-2 mb-8">
                    {['Post CRITICAL/HIGH/NORMAL alerts', 'Auto-matched compatible donors', 'Track response timeline', 'Mark requests as fulfilled'].map((item) => (
                      <li key={item} className="flex items-center gap-2 text-white/60 text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link to="/register/hospital">
                    <motion.button
                      className="w-full py-3 rounded-xl font-bold text-sm text-white"
                      style={{ background: 'linear-gradient(135deg, #ea580c, #f97316)', boxShadow: '0 4px 20px rgba(249,115,22,0.4)' }}
                      whileHover={{ boxShadow: '0 8px 30px rgba(249,115,22,0.6)' }}
                    >
                      Register Hospital
                    </motion.button>
                  </Link>
                </div>
              </motion.div>
            </FadeIn>

            {/* ADMIN CARD */}
            <FadeIn delay={0.2}>
              <motion.div
                className="relative rounded-3xl overflow-hidden group"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <div className="absolute inset-0" style={{
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(99,102,241,0.04) 100%)',
                  border: '1px solid rgba(99,102,241,0.2)',
                }} />
                <div className="relative p-8">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                    style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)' }}>
                    <Shield className="w-7 h-7 text-indigo-400" />
                  </div>
                  <div className="text-indigo-400 text-xs font-bold uppercase tracking-widest mb-2">For Admins</div>
                  <h3 className="text-xl font-black text-white mb-3">Central Command</h3>
                  <p className="text-white/45 text-sm leading-relaxed mb-6">
                    Monitor the full platform — all donors, hospitals, emergency requests — from one intelligent administrative control panel.
                  </p>
                  <ul className="space-y-2 mb-8">
                    {['Platform-wide stats dashboard', 'Manage donor/hospital accounts', 'Hospital verification workflow', 'Emergency request monitoring'].map((item) => (
                      <li key={item} className="flex items-center gap-2 text-white/60 text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link to="/login">
                    <motion.button
                      className="w-full py-3 rounded-xl font-bold text-sm text-white"
                      style={{ background: 'linear-gradient(135deg, #4f46e5, #6366f1)', boxShadow: '0 4px 20px rgba(99,102,241,0.4)' }}
                      whileHover={{ boxShadow: '0 8px 30px rgba(99,102,241,0.6)' }}
                    >
                      Admin Sign In
                    </motion.button>
                  </Link>
                </div>
              </motion.div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── MEDICAL DISCLAIMER ───────────────────────────────────────────────── */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <FadeIn>
            <div className="rounded-2xl p-6 flex items-start gap-4"
              style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-amber-400 font-bold text-sm mb-1">Important Clinical Disclaimer</div>
                <p className="text-white/40 text-xs leading-relaxed">
                  BloodLink is a donor discovery and emergency coordination platform. It does not perform medical diagnosis, laboratory serology, or replace official blood bank cross-matching procedures. Final donor screening, hemoglobin validation, and medical safety clearance are always the responsibility of licensed medical personnel at the receiving hospital.
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── CTA BANNER ──────────────────────────────────────────────────────── */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="blob-orb w-[500px] h-[500px] bg-red-700/25"
            style={{ top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <FadeIn>
            <motion.div
              className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-8 mx-auto"
              style={{ background: 'linear-gradient(135deg, #dc1a3c, #ff1744)', boxShadow: '0 0 60px rgba(220,26,60,0.5)' }}
              animate={{ boxShadow: ['0 0 40px rgba(220,26,60,0.4)', '0 0 80px rgba(220,26,60,0.7)', '0 0 40px rgba(220,26,60,0.4)'] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              <HeartHandshake className="w-10 h-10 text-white" />
            </motion.div>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tight">
              Your blood type could be<br />
              <span style={{ color: '#dc1a3c' }}>saving a life right now.</span>
            </h2>
            <p className="text-white/45 text-base max-w-lg mx-auto mb-10 leading-relaxed">
              Join thousands of registered donors who are on standby, making a real difference in their community — one unit at a time.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register/donor">
                <motion.button
                  className="px-10 py-4 rounded-2xl font-black text-white text-lg"
                  style={{
                    background: 'linear-gradient(135deg, #dc1a3c, #ff1744)',
                    boxShadow: '0 8px 40px rgba(220,26,60,0.5)',
                  }}
                  whileHover={{ scale: 1.06, boxShadow: '0 12px 50px rgba(220,26,60,0.7)' }}
                  whileTap={{ scale: 0.96 }}
                >
                  Join the Network Today
                </motion.button>
              </Link>
              <Link to="/login">
                <motion.button
                  className="px-10 py-4 rounded-2xl font-semibold text-white/70 hover:text-white text-base border border-white/15 hover:border-white/30 transition-all"
                  style={{ background: 'rgba(255,255,255,0.05)' }}
                  whileHover={{ scale: 1.03 }}
                >
                  Already registered? Sign in
                </motion.button>
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.06] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 rounded-xl bg-red-600 blur-md opacity-40" />
                <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-red-700 to-rose-500 flex items-center justify-center">
                  <HeartHandshake className="w-5 h-5 text-white" />
                </div>
              </div>
              <div>
                <div className="text-white font-black">BloodLink Emergency Platform</div>
                <div className="text-white/30 text-xs">© {new Date().getFullYear()} · Real-Time Blood Donor Coordination</div>
              </div>
            </div>

            {/* Links */}
            <div className="flex items-center gap-6">
              {[
                { to: '/login', label: 'Sign In' },
                { to: '/register/donor', label: 'Donor Registration' },
                { to: '/register/hospital', label: 'Hospital Registration' },
              ].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-white/40 hover:text-white/80 text-sm font-medium transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Emergency badge */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-full"
              style={{ background: 'rgba(220,26,60,0.1)', border: '1px solid rgba(220,26,60,0.2)' }}>
              <motion.div
                className="w-2 h-2 rounded-full bg-red-500"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
              <span className="text-red-400 text-xs font-bold uppercase tracking-widest">Emergency Network Active</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
