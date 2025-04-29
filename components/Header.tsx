"use client";

import React from "react";

export default function Header() {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const query = e.currentTarget.value;
      if (query) {
        window.location.href = `https://lms.amzconsulting.com.au/search?search=${query}`;
      }
    }
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-6xl mx-auto px-8 flex items-center justify-between h-20">
        <div className="flex items-center space-x-6">
          <img src="/logo.png" alt="AMZ Logo" className="h-12" />
          <div className="relative w-56">
            <input
              type="text"
              placeholder="Search..."
              className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
              onKeyDown={handleKeyDown}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z"
                />
              </svg>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-8">
          <a href="https://lms.amzconsulting.com.au/cart/">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="feather feather-shopping-cart"
            >
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
          </a>
          <div className="border-l border-gray-300 h-8"></div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="feather feather-bell mr-10"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          <div className="flex space-x-4 ml-10">
            <a
              href="https://lms.amzconsulting.com.au/login"
              //   className="text-sm"
            >
              Login
            </a>
            <a
              href="https://lms.amzconsulting.com.au/register"
              //   className="text-sm"
            >
              Register
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
