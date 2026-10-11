import React from 'react';
import { m } from 'framer-motion';
import { ArrowRight, Star, Users, Download } from 'lucide-react';
import PhoneOnlyImage from '../assets/PhoneOnly.png';

export default function Hero({ onOpenQrModal }) {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 1.0, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <section className="hero-section-full" id="home">
      <div className="container hero-grid-full" style={{ position: 'relative', zIndex: 1 }}>
        {/* Left Column Text & Action Buttons */}
        <m.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <m.h1 className="heading-xl" style={{ marginBottom: 20 }} variants={itemVariants}>
            Turn your Appliance Repairs into Solutions in Seconds, Not Hours
          </m.h1>

          <m.p className="text-lead" style={{ marginBottom: 32, maxWidth: 540 }} variants={itemVariants}>
            EveryWare is your smart home service app. Just describe your appliance issue — we take incessant calls and the hassle away. We assign authorised technicians with real-time live GPS tracking, clean transparent pricing, and guaranteed work.
          </m.p>

          <m.div className="hero-ctas-row" variants={itemVariants}>
            <button className="btn btn-coral" onClick={onOpenQrModal}>
              Book a Service
              <ArrowRight size={16} />
            </button>
          </m.div>

          <m.div className="hero-store-buttons" variants={itemVariants}>
            <button className="btn-store-black" onClick={onOpenQrModal}>
              <svg viewBox="0 0 512 512"><path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58-33.3-60.7 60.7 60.7 60.7 58-33.3c22-12.6 22-32.2 0-44.8zM325.3 277.7l60.1 60.1L104.6 499l220.7-221.3z"/></svg>
              Get on Play Store
            </button>
          </m.div>

          <m.div className="hero-stats-row" variants={itemVariants}>
            <div className="stat-item-box">
              <div className="stat-icon-mini"><Download size={18} /></div>
              <div>
                <div className="stat-num-bold">5,000+</div>
                <div className="stat-num-label">Services Completed</div>
              </div>
            </div>

            <div className="stat-item-box">
              <div className="stat-icon-mini"><Star size={18} /></div>
              <div>
                <div className="stat-num-bold">4.8★</div>
                <div className="stat-num-label">Customer Rating</div>
              </div>
            </div>

            <div className="stat-item-box">
              <div className="stat-icon-mini"><Users size={18} /></div>
              <div>
                <div className="stat-num-bold">&lt; 45 Min</div>
                <div className="stat-num-label">Avg Response Time</div>
              </div>
            </div>
          </m.div>
        </m.div>

        {/* Right Column Seamless Transparent iPhone Mockup */}
        <m.div
          className="hero-phone-showcase-wrapper"
          initial={{ opacity: 0, scale: 0.92, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ y: -8, scale: 1.02 }}
        >
          <div className="phone-glow-aura" />
          <img
            src={PhoneOnlyImage}
            alt="EveryWare App — Book home appliance repair on your phone"
            className="hero-phone-mockup-img"
            width="641"
            height="1339"
            fetchpriority="high"
            decoding="async"
          />
        </m.div>
      </div>
    </section>
  );
}
