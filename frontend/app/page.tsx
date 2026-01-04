"use client";

import { useState } from "react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="relative min-h-screen bg-[#02010A] text-white overflow-x-hidden selection:bg-emerald-500 selection:text-white">
      
      <img 
        src="/background.svg" 
        alt="Background Pattern" 
        className="absolute top-0 left-0 w-full h-full object-cover z-0 pointer-events-none opacity-80 mix-blend-overlay"
      />

      <div className="absolute top-0 left-0 right-0 h-[600px] bg-gradient-to-b from-blue-900/40 via-blue-900/10 to-transparent z-0 pointer-events-none" />

      <nav className="fixed top-0 w-full z-50 bg-transparent py-6">
        <div className="w-full px-12 flex items-center justify-between">
          
          <div className="text-2xl font-bold tracking-tight">
            <span className="text-emerald-400">Churn</span> Bucket
          </div>

          <div className="flex items-center gap-12">
            <div className="hidden md:flex items-center gap-10 text-sm font-medium text-gray-300">
              <a href="#" className="hover:text-white transition-colors">
                Detail for Mac
              </a>
              
              <div className="relative group">
                <button className="flex items-center gap-1 hover:text-white transition-colors">
                  Product <span>▾</span>
                </button>
                <div className="absolute top-full right-0 mt-4 w-48 bg-[#0A0A1B] border border-white/10 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0">
                  <div className="p-4 text-xs text-gray-500">Product menu items...</div>
                </div>
              </div>

              <div className="relative group">
                <button className="flex items-center gap-1 hover:text-white transition-colors">
                  Resources <span>▾</span>
                </button>
                <div className="absolute top-full right-0 mt-4 w-48 bg-[#0A0A1B] border border-white/10 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0">
                  <div className="p-4 text-xs text-gray-500">Resources menu items...</div>
                </div>
              </div>
            </div>

            <Link 
              href="/signin" 
              className="px-6 py-2.5 rounded-full border border-white/20 text-xs font-medium hover:bg-white hover:text-black transition-all"
            >
              Sign Up
            </Link>
          </div>

        </div>
      </nav>

      <section className="relative z-10 pt-48 pb-20 px-6 text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-600/20 blur-[120px] rounded-full -z-10" />

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
          The Churn Intelligence <br />
          Platform for <span className="text-emerald-400">B2B SaaS</span>
        </h1>
        
        <p className="text-gray-400 max-w-2xl mx-auto text-lg mb-10">
          Data-driven churn modeling designed for fast-moving SaaS teams.
          <br /> Model churn, measure engagement, and act with confidence.
        </p>

        <Link 
          href="/overview/insights"
          className="bg-emerald-400 text-black font-semibold px-8 py-3 rounded-full hover:bg-emerald-300 transition-all shadow-[0_0_20px_rgba(52,211,153,0.3)] inline-block"
        >
          Log In
        </Link>
      </section>

      <section className="relative z-10 py-32 px-6 flex flex-col items-center text-center">
        
        <span className="px-4 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-[11px] uppercase tracking-widest text-purple-200 mb-8 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
          About
        </span>

        <h2 className="text-3xl md:text-5xl font-semibold mb-4">
          Predict Churn Before It Happens <br />
          <span className="text-purple-200/60">dotted across the globe</span>
        </h2>

        <p className="text-gray-400 text-sm mb-12 max-w-md">
          Advanced machine learning models identify at-risk partners.
          <br /> Real-time alerts to take proactive action.
        </p>

        <a href="#" className="px-8 py-3 text-sm font-medium rounded-full bg-gradient-to-r from-[#6366F1] to-[#A855F7] hover:opacity-90 transition-all">
          See our values
        </a>

        <div className="mt-20 relative w-full h-[1000px] flex items-center justify-center">
            <img 
                src="/icons/landingPage/globe.svg" 
                alt="Globe" 
                className="w-full h-full object-contain relative z-10" 
            />
        </div>
      </section>

      <section className="relative z-10 py-24 px-6 flex flex-col items-center text-center">
        
        <span className="px-4 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-[11px] uppercase tracking-widest text-purple-200 mb-8 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
          Actionable Recommendations
        </span>

        <h2 className="text-3xl md:text-5xl font-semibold mb-4">
          Comprehensive Retention Insights
        </h2>

        <p className="text-gray-400 text-sm mb-16 max-w-lg">
          Optimize marketing, support, and product interventions.
          <br /> Identify top factors driving retention or churn.
        </p>

        <div className="relative w-full h-[900px] flex items-center justify-center">
           <img 
               src="/icons/landingPage/radar.svg" 
               alt="Radar" 
               className="w-full h-full object-contain relative z-10" 
            /> 
        </div>
      </section>

      <section className="relative z-10 py-32 px-6">
        <div className="flex justify-center mb-6">
        <span className="px-4 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-[11px] uppercase tracking-widest text-purple-200 mb-8 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
            Research and Reading
          </span>
        </div>

        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Predict. Retain. Grow.</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Turn partners churn into actionable insights. Boost retention and maximize growth with data-driven analytics.
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 text-center">
          
          <div className="flex flex-col items-center">
            <div className="mb-6 flex justify-center">
               <img 
                 src="/icons/landingPage/devices.svg" 
                 alt="Devices" 
                 className="w-12 h-12" 
               />
            </div>
            <h3 className="text-lg font-semibold mb-2">Integrated with your devices</h3>
            <p className="text-sm text-gray-400">
              Work everywhere, mobile or desktop, online or offline. Everything is synced in real-time.
            </p>
          </div>

          <div className="flex flex-col items-center">
             <div className="mb-6 flex justify-center">
               <img 
                 src="/icons/landingPage/shield.svg" 
                 alt="Security" 
                 className="w-12 h-12" 
               />
            </div>
            <h3 className="text-lg font-semibold mb-2">Scalable & Secure</h3>
            <p className="text-sm text-gray-400">
              Enterprise-grade security and compliance. Scales effortlessly with your growing partner base.
            </p>
          </div>

        </div>
      </section>

      <section className="relative z-10 py-24 px-6 text-center overflow-hidden">
        
        <div className="absolute bottom-[-200px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-600/40 blur-[150px] rounded-full -z-10 pointer-events-none" />

        <h2 className="text-3xl font-semibold mb-12">Why Choose Churn Bucket</h2>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 text-left text-sm text-gray-400">
          <ul className="space-y-4">
            <li className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
              Reduce churn and increase customer lifetime value.
            </li>
            <li className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
              Make data-driven decisions effortlessly.
            </li>
            <li className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
              Simplify complex analytics with an intuitive dashboard.
            </li>
          </ul>

          <ul className="space-y-4">
            <li className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
              Trusted by growing SaaS businesses.
            </li>
            <li className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
              Data-driven growth opportunities.
            </li>
            <li className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
              Intuitive dashboard for all teams.
            </li>
          </ul>
        </div>
      </section>

    </main>
  );
}