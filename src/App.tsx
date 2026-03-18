/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  BookOpen, 
  MessageSquare, 
  Users, 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Download,
  X,
  Share2,
  Facebook,
  MessageCircle
} from 'lucide-react';
import { auth, signInWithGoogle, logEvent } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [showPwaPrompt, setShowPwaPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [candidateCount, setCandidateCount] = useState(12450);
  const [testimonialIndex, setTestimonialIndex] = useState(0);

  const testimonials = [
    { 
      quote: "The mock exams are exactly like the real thing. I feel so much more confident now!", 
      name: "Musa A.", 
      img: "https://picsum.photos/seed/musa/100/100" 
    },
    { 
      quote: "Joining the WhatsApp community was the best decision. The daily updates are life-savers.", 
      name: "Chinelo O.", 
      img: "https://picsum.photos/seed/chinelo/100/100" 
    },
    { 
      quote: "AI interview practice helped me fix my speaking errors. Highly recommended!", 
      name: "Ibrahim K.", 
      img: "https://picsum.photos/seed/ibrahim/100/100" 
    }
  ];

  // Refs for scroll tracking
  const sectionsRef = useRef<{ [key: string]: boolean }>({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsAuthReady(true);
    });

    // PWA Install Prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPwaPrompt(true);
    });

    // Scroll Tracking
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollY / height) * 100;
      setScrollProgress(progress);

      // Track section visibility
      const sections = ['hero', 'trust', 'value', 'social', 'urgency', 'testimonials', 'cta', 'close'];
      sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top < window.innerHeight && rect.bottom > 0 && !sectionsRef.current[id]) {
            sectionsRef.current[id] = true;
            logEvent('scroll', { section: id });
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    
    // TikTok ViewContent
    if (typeof (window as any).ttq !== 'undefined') {
      (window as any).ttq.track('ViewContent', {
        content_name: 'NPFprepAi Landing Page',
        content_type: 'landing_page'
      });
    }

    // Dynamic Counter
    const interval = setInterval(() => {
      setCandidateCount(prev => prev + Math.floor(Math.random() * 3));
    }, 5000);

    return () => {
      unsubscribe();
      window.removeEventListener('scroll', handleScroll);
      clearInterval(interval);
    };
  }, []);

  const handleAuth = async () => {
    try {
      await logEvent('click', { button: 'start_preparing_now', target: 'https://npfprepai.online' });
      
      // TikTok Tracking
      if (typeof (window as any).ttq !== 'undefined') {
        (window as any).ttq.track('ClickButton', {
          content_name: 'CTA Click - Start Preparing',
          destination: 'npfprepai.online'
        });
        (window as any).ttq.track('CompleteRegistration', {
          content_name: 'Start Free Practice',
          content_category: 'Button Click'
        });
      }

      window.open('https://npfprepai.online', '_blank');
    } catch (error) {
      console.error(error);
    }
  };

  const handleWhatsApp = () => {
    logEvent('click', { button: 'join_whatsapp' });
    logEvent('whatsapp_join');

    // TikTok Tracking
    if (typeof (window as any).ttq !== 'undefined') {
      (window as any).ttq.track('Contact', {
        content_name: 'Join WhatsApp Community',
        content_category: 'Button Click'
      });
    }

    window.open('https://whatsapp.com/channel/0029VbBfoGRAu3aYVwMtnc2L', '_blank');
  };

  const handleShare = async (index: number) => {
    const testimonial = testimonials[index];
    const shareData = {
      title: 'NPF Prep Success Story',
      text: `"${testimonial.quote}" - ${testimonial.name} is preparing for the NPF screening with NPF Prep. Join us!`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        logEvent('click', { action: 'testimonial_share_native', index });
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        alert('Testimonial copied to clipboard!');
        logEvent('click', { action: 'testimonial_share_clipboard', index });
      }

      // TikTok Tracking
      if (typeof (window as any).ttq !== 'undefined') {
        (window as any).ttq.track('Share', {
          content_name: 'Testimonial Share',
          content_id: index.toString()
        });
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const handleWhatsAppShare = (index: number) => {
    const testimonial = testimonials[index];
    const text = `"${testimonial.quote}" - ${testimonial.name}\n\nPrepare for NPF screening here: ${window.location.href}`;
    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    
    window.open(waUrl, '_blank');
    
    logEvent('click', { action: 'testimonial_share_whatsapp', index });
    
    // TikTok Tracking
    if (typeof (window as any).ttq !== 'undefined') {
      (window as any).ttq.track('Share', {
        content_name: 'WhatsApp Share',
        content_id: index.toString()
      });
    }
  };

  const handleFacebookShare = (index: number) => {
    const testimonial = testimonials[index];
    const text = `"${testimonial.quote}" - ${testimonial.name}`;
    const url = window.location.href;
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
    
    window.open(fbUrl, '_blank', 'width=600,height=400');
    
    logEvent('click', { action: 'testimonial_share_facebook', index });
    
    // TikTok Tracking
    if (typeof (window as any).ttq !== 'undefined') {
      (window as any).ttq.track('Share', {
        content_name: 'Facebook Share',
        content_id: index.toString()
      });
    }
  };

  const installPwa = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        logEvent('click', { button: 'pwa_install_accepted' });
      }
      setDeferredPrompt(null);
      setShowPwaPrompt(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-neutral-200 z-50">
        <motion.div 
          className="h-full bg-emerald-500"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* PWA Prompt */}
      <AnimatePresence>
        {showPwaPrompt && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-24 left-4 right-4 bg-white p-4 rounded-2xl shadow-2xl border border-neutral-100 z-40 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                <Download size={20} />
              </div>
              <div>
                <p className="text-sm font-bold">Install NPF Prep App</p>
                <p className="text-xs text-neutral-500">Fast access to mock exams</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={installPwa}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold active:scale-95 transition-transform"
              >
                Install
              </button>
              <button 
                onClick={() => setShowPwaPrompt(false)}
                className="p-2 text-neutral-400"
              >
                <X size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticky CTA */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: scrollProgress > 10 ? 0 : 100 }}
        className="fixed bottom-0 left-0 w-full p-4 bg-white/80 backdrop-blur-md border-t border-neutral-100 z-30"
      >
        <button 
          onClick={handleAuth}
          className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          Start Preparing Now <Zap size={20} fill="currentColor" />
        </button>
      </motion.div>

      {/* Section 1: Hero */}
      <section id="hero" className="relative min-h-[90vh] flex flex-col items-center justify-center px-6 pt-12 text-center overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-50/50 via-transparent to-transparent" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-bold uppercase tracking-wider mb-6"
        >
          <AlertTriangle size={14} /> NPF Screening is Ongoing
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-black tracking-tight leading-[0.9] mb-6"
        >
          THOUSANDS APPLIED... <br />
          <span className="text-emerald-600">ONLY THE PREPARED</span> <br />
          WILL PASS.
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-neutral-500 max-w-md mb-10"
        >
          Don't leave your future to chance. Get access to real past questions and AI-powered interview prep.
        </motion.p>

        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          onClick={handleAuth}
          className="group relative bg-emerald-600 text-white px-8 py-5 rounded-2xl font-black text-xl shadow-2xl shadow-emerald-600/30 flex items-center gap-3 overflow-hidden active:scale-95 transition-transform"
        >
          <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
          👉 Start Preparing Now <span className="text-emerald-200">(Free)</span>
        </motion.button>
      </section>

      {/* Section 2: Trust */}
      <section id="trust" className="py-12 px-6">
        <div className="bg-neutral-900 text-white p-8 rounded-[2rem] text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />
          <AlertTriangle className="mx-auto mb-4 text-emerald-500" size={40} />
          <h2 className="text-2xl font-black mb-2 uppercase italic">NPF Recruitment is 100% Free</h2>
          <p className="text-neutral-400 text-sm">DO NOT PAY ANYONE. Beware of scammers posing as recruitment officers.</p>
        </div>
      </section>

      {/* Section 3: Value Stack */}
      <section id="value" className="py-16 px-6 bg-white">
        <div className="max-w-md mx-auto space-y-4">
          {[
            { icon: <Zap />, title: "Real NPF Mock Exams", desc: "Simulate the actual screening environment." },
            { icon: <MessageSquare />, title: "AI Interview Practice", desc: "Get instant feedback on your answers." },
            { icon: <BookOpen />, title: "Past Questions & Answers", desc: "Study materials from 2018 to 2024." },
            { icon: <AlertTriangle />, title: "Daily Study Updates", desc: "Never miss a critical screening date." },
            { icon: <Users />, title: "Join Thousands Preparing", desc: "Learn with the most serious candidates." }
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex items-start gap-4 p-5 rounded-2xl bg-neutral-50 border border-neutral-100"
            >
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-emerald-600 shrink-0">
                {item.icon}
              </div>
              <div>
                <h3 className="font-bold text-lg">{item.title}</h3>
                <p className="text-neutral-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Section 4: Social Proof */}
      <section id="social" className="py-20 px-6 text-center bg-emerald-600 text-white">
        <div className="max-w-md mx-auto">
          <div className="text-6xl font-black mb-4 tracking-tighter">
            {candidateCount.toLocaleString()}
          </div>
          <p className="text-emerald-100 font-medium text-lg">
            Serious candidates are preparing daily. Don't be the one who fails because of lack of information.
          </p>
          <div className="mt-8 flex justify-center -space-x-4">
            {[1, 2, 3, 4, 5].map(i => (
              <img 
                key={i}
                src={`https://picsum.photos/seed/user${i}/100/100`} 
                alt="User" 
                className="w-12 h-12 rounded-full border-4 border-emerald-600"
                referrerPolicy="no-referrer"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Section 5: Urgency */}
      <section id="urgency" className="py-24 px-6 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-md mx-auto"
        >
          <h2 className="text-4xl font-black mb-6 leading-tight">
            IF YOU ARE NOT PREPARING, <br />
            <span className="text-red-600 underline decoration-4 underline-offset-8">YOU ARE ALREADY BEHIND.</span>
          </h2>
          <p className="text-neutral-500">
            The screening is competitive. Only the top 5% will make it to the next stage. Will you be among them?
          </p>
        </motion.div>
      </section>

      {/* Section: Testimonials Carousel */}
      <section id="testimonials" className="py-24 px-6 bg-neutral-900 text-white overflow-hidden relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/20 blur-[100px] rounded-full -z-10" />
        
        <div className="max-w-md mx-auto relative">
          <h2 className="text-2xl font-black mb-12 text-center uppercase tracking-widest italic text-emerald-500">Success Stories</h2>
          
          <div className="relative h-[280px] flex items-center justify-center">
            <AnimatePresence mode="popLayout">
              <motion.div
                key={testimonialIndex}
                initial={{ opacity: 0, x: 100, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -100, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 300, damping: 300 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={(_, info) => {
                  if (info.offset.x > 50) {
                    setTestimonialIndex(prev => (prev - 1 + testimonials.length) % testimonials.length);
                    logEvent('click', { action: 'testimonial_swipe', direction: 'prev' });
                  }
                  if (info.offset.x < -50) {
                    setTestimonialIndex(prev => (prev + 1) % testimonials.length);
                    logEvent('click', { action: 'testimonial_swipe', direction: 'next' });
                  }
                }}
                className="absolute w-full bg-neutral-800/50 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 shadow-[0_0_50px_-12px_rgba(16,185,129,0.3)] cursor-grab active:cursor-grabbing"
              >
                <div className="mb-6 text-emerald-400">
                  {[1, 2, 3, 4, 5].map(i => (
                    <span key={i} className="text-xl">★</span>
                  ))}
                </div>
                
                <p className="text-xl font-medium leading-relaxed mb-8 italic">
                  "{testimonials[testimonialIndex].quote}"
                </p>
                
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-emerald-500 blur-md opacity-50 rounded-full" />
                    <img 
                      src={testimonials[testimonialIndex].img} 
                      alt={testimonials[testimonialIndex].name} 
                      className="relative w-12 h-12 rounded-full border-2 border-emerald-500 object-cover" 
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <p className="font-black text-lg tracking-tight">{testimonials[testimonialIndex].name}</p>
                    <p className="text-xs text-emerald-500 font-bold uppercase tracking-widest">Verified Candidate</p>
                  </div>
                  
                  <div className="ml-auto flex gap-2">
                    <button 
                      onClick={() => handleWhatsAppShare(testimonialIndex)}
                      className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-green-500"
                      title="Share on WhatsApp"
                    >
                      <MessageCircle size={20} fill="currentColor" />
                    </button>
                    <button 
                      onClick={() => handleFacebookShare(testimonialIndex)}
                      className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-blue-500"
                      title="Share on Facebook"
                    >
                      <Facebook size={20} fill="currentColor" />
                    </button>
                    <button 
                      onClick={() => handleShare(testimonialIndex)}
                      className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-emerald-500"
                      title="Share this testimonial"
                    >
                      <Share2 size={20} />
                    </button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Indicators */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setTestimonialIndex(i);
                  logEvent('click', { action: 'testimonial_indicator', index: i });
                }}
                className={`h-1 transition-all duration-300 rounded-full ${i === testimonialIndex ? 'w-8 bg-emerald-500' : 'w-2 bg-white/20'}`}
              />
            ))}
          </div>
          
          <p className="text-center text-neutral-500 text-xs mt-6 font-medium uppercase tracking-widest">Swipe to read more</p>
        </div>
      </section>

      {/* Section 6: Double CTA */}
      <section id="cta" className="py-16 px-6 bg-neutral-900 text-white">
        <div className="max-w-md mx-auto space-y-4">
          <button 
            onClick={handleAuth}
            className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3 active:scale-95 transition-transform"
          >
            👉 Start Free Practice <Zap size={20} fill="currentColor" />
          </button>
          <button 
            onClick={handleWhatsApp}
            className="w-full bg-white text-neutral-900 py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3 active:scale-95 transition-transform"
          >
            👉 Join WhatsApp Community <MessageSquare size={20} fill="currentColor" />
          </button>
        </div>
      </section>

      {/* Section 7: Final Close */}
      <section id="close" className="py-24 px-6 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-8">
            <ShieldCheck size={40} />
          </div>
          <h2 className="text-3xl font-black mb-6 italic">
            "Your success tomorrow depends on what you do today."
          </h2>
          <p className="text-neutral-400 text-sm uppercase tracking-widest font-bold">
            Official NPF Prep Portal &copy; 2026
          </p>
        </div>
      </section>

      {/* Bottom Spacer for Sticky CTA */}
      <div className="h-32" />
    </div>
  );
}
