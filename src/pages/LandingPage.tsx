import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Home, Shield, Star, Clock, ChevronRight, Quote } from 'lucide-react';
import { motion } from 'motion/react';

export default function LandingPage() {
  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-amber-400/30">
      {/* Navbar */}
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="absolute top-0 w-full z-50 px-6 py-6 flex justify-between items-center"
      >
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded bg-amber-400 flex items-center justify-center text-zinc-950 font-bold text-2xl">
            L
          </div>
          <span className="text-xl font-medium tracking-wide text-white">LinkSwift</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-300">
          <Link to="/login" className="hover:text-amber-400 transition-colors">Sign In</Link>
          <Link to="/signup" className="px-5 py-2.5 bg-amber-400 text-zinc-950 rounded-full hover:bg-amber-500 transition-colors">Create Account</Link>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 flex flex-col md:flex-row">
          <motion.div 
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="w-full md:w-1/2 h-1/2 md:h-full relative"
          >
            <img src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80" alt="Luxury Car" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b md:bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent"></div>
          </motion.div>
          <motion.div 
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
            className="w-full md:w-1/2 h-1/2 md:h-full relative"
          >
            <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80" alt="Luxury Villa" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-l from-zinc-950 via-zinc-950/80 to-transparent"></div>
          </motion.div>
          <div className="absolute inset-0 bg-zinc-950/60"></div>
        </div>

        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="relative z-10 text-center px-4 max-w-5xl mx-auto mt-20"
        >
          <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl font-light tracking-tight mb-6 text-white">
            Luxury Rides & Stays <br />
            <span className="text-amber-400 font-medium italic">in Nigeria</span>
          </motion.h1>
          <motion.p variants={fadeInUp} className="text-lg md:text-xl text-zinc-300 mb-10 max-w-2xl mx-auto font-light">
            Executive chauffeurs • Private villas • Unforgettable journeys
          </motion.p>
          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup" className="w-full sm:w-auto px-8 py-4 bg-amber-400 text-zinc-950 rounded-full font-medium hover:bg-amber-500 transition-all flex items-center justify-center gap-2">
              Create Account <ChevronRight className="w-4 h-4" />
            </Link>
            <Link to="/login" className="w-full sm:w-auto px-8 py-4 bg-zinc-900/80 backdrop-blur-md border border-zinc-700 text-white rounded-full font-medium hover:bg-zinc-800 transition-all flex items-center justify-center">
              Sign In
            </Link>
            <Link to="/dashboard" className="w-full sm:w-auto px-8 py-4 bg-transparent text-zinc-300 rounded-full font-medium hover:text-amber-400 transition-all flex items-center justify-center underline-offset-4 hover:underline">
              Explore as Guest
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Featured Rides */}
      <section className="py-24 px-6 max-w-7xl mx-auto overflow-hidden">
        <motion.div 
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          className="flex justify-between items-end mb-12"
        >
          <div>
            <h2 className="text-3xl md:text-4xl font-light mb-4 text-white">Featured <span className="text-amber-400">Rides</span></h2>
            <p className="text-zinc-400">Arrive in style with our premium fleet.</p>
          </div>
          <Link to="/login" className="hidden md:flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors">
            View all fleet <ChevronRight className="w-4 h-4" />
          </Link>
        </motion.div>
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {[
            { name: 'Mercedes-Benz S-Class', type: 'Executive Sedan', img: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80' },
            { name: 'Range Rover Autobiography', type: 'Luxury SUV', img: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&q=80' },
            { name: 'Rolls-Royce Phantom', type: 'Ultra Luxury', img: 'https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?auto=format&fit=crop&q=80' }
          ].map((car, i) => (
            <motion.div variants={fadeInUp} key={i} className="group rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-amber-400/50 transition-colors">
              <div className="h-64 overflow-hidden relative">
                <img src={car.img} alt={car.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute top-4 right-4 bg-zinc-950/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-amber-400 border border-amber-400/20">
                  {car.type}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-medium text-white mb-2">{car.name}</h3>
                <div className="flex items-center gap-4 text-sm text-zinc-400">
                  <span className="flex items-center gap-1"><Car className="w-4 h-4" /> Chauffeur included</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Featured Stays */}
      <section className="py-24 px-6 max-w-7xl mx-auto border-t border-zinc-900 overflow-hidden">
        <motion.div 
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          className="flex justify-between items-end mb-12"
        >
          <div>
            <h2 className="text-3xl md:text-4xl font-light mb-4 text-white">Featured <span className="text-amber-400">Stays</span></h2>
            <p className="text-zinc-400">Exclusive properties for your ultimate comfort.</p>
          </div>
          <Link to="/login" className="hidden md:flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors">
            View all properties <ChevronRight className="w-4 h-4" />
          </Link>
        </motion.div>
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {[
            { name: 'Ikoyi Penthouse Suite', loc: 'Ikoyi, Lagos', img: 'https://images.unsplash.com/photo-1600607687931-cecebd80d6c0?auto=format&fit=crop&q=80' },
            { name: 'Banana Island Villa', loc: 'Banana Island, Lagos', img: 'https://images.unsplash.com/photo-1613490908571-9ce2240b0d36?auto=format&fit=crop&q=80' },
            { name: 'Maitama Luxury Apartment', loc: 'Maitama, Abuja', img: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80' }
          ].map((stay, i) => (
            <motion.div variants={fadeInUp} key={i} className="group rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-amber-400/50 transition-colors">
              <div className="h-64 overflow-hidden relative">
                <img src={stay.img} alt={stay.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-medium text-white mb-2">{stay.name}</h3>
                <div className="flex items-center gap-4 text-sm text-zinc-400">
                  <span className="flex items-center gap-1"><Home className="w-4 h-4" /> {stay.loc}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 max-w-7xl mx-auto overflow-hidden">
        <motion.div 
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-light mb-4 text-white">Client <span className="text-amber-400">Testimonials</span></h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">Hear from our distinguished guests about their LinkSwift experiences.</p>
        </motion.div>
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {[
            { quote: "The level of service is simply unmatched. My chauffeur was punctual, professional, and the S-Class was immaculate. LinkSwift is now my go-to for all business travel in Lagos.", name: "Adebayo O.", role: "Tech Executive" },
            { quote: "We booked a villa in Banana Island for a corporate retreat. The 24/7 concierge handled every request flawlessly. An absolute masterpiece of luxury hospitality.", name: "Sarah M.", role: "International Investor" },
            { quote: "From the airport pickup to the penthouse stay, every detail was orchestrated perfectly. It's rare to find this level of seamless integration in premium travel.", name: "David K.", role: "Diplomat" }
          ].map((testimonial, i) => (
            <motion.div variants={fadeInUp} key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 relative hover:border-amber-400/30 transition-colors">
              <Quote className="absolute top-6 right-6 w-12 h-12 text-zinc-800/50" />
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-zinc-300 italic mb-6 relative z-10">"{testimonial.quote}"</p>
              <div>
                <p className="text-white font-medium">{testimonial.name}</p>
                <p className="text-sm text-amber-400">{testimonial.role}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Why LinkSwift */}
      <section className="py-24 px-6 bg-zinc-900 border-y border-zinc-800 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-light mb-4 text-white">Why Choose <span className="text-amber-400">LinkSwift</span></h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">Experience the pinnacle of luxury travel and accommodation in Nigeria.</p>
          </motion.div>
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-4 gap-8"
          >
            {[
              { icon: Shield, title: 'Uncompromising Safety', desc: 'Vetted chauffeurs and secure properties for your peace of mind.' },
              { icon: Star, title: 'Premium Quality', desc: 'Only the finest vehicles and most luxurious homes make our list.' },
              { icon: Clock, title: '24/7 Concierge', desc: 'Round-the-clock support to cater to your every need.' },
              { icon: Car, title: 'Seamless Integration', desc: 'Book your ride and stay together in one unified experience.' }
            ].map((feature, i) => (
              <motion.div variants={fadeInUp} key={i} className="text-center p-6">
                <div className="w-16 h-16 mx-auto bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-center mb-6 text-amber-400">
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-medium text-white mb-3">{feature.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-zinc-900 text-center text-zinc-500 text-sm">
        <p>© {new Date().getFullYear()} LinkSwift Travel Hub. All rights reserved.</p>
      </footer>
    </div>
  );
}
