"use client";

import React from "react";

export default function Header() {
  return (
    <header className="bg-[#F1C714] shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between py-4 sm:h-20">
        <a href="https://amzconsulting.com.au/" target="_blank" rel="noopener noreferrer" className="mb-4 sm:mb-0">
          <img src="/logo.png" alt="AMZ Logo" className="h-16 sm:h-20" />
        </a>
        <div className="flex items-center space-x-2 sm:space-x-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 sm:h-10 sm:w-10" viewBox="0 0 24 24" fill="black" stroke="black" strokeWidth="1">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
          </svg>
          <div className="flex flex-col space-y-0.5 text-center sm:text-left">
            <span className="font-bold text-sm sm:text-base text-black">1300 194 753</span>
            <span className="font-bold text-sm sm:text-base text-black">info@amzconsulting.com.au</span>
          </div>
        </div>
      </div>
    </header>
  );
}
