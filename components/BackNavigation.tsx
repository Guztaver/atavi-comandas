'use client';

import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface BackNavigationProps {
  title: string;
  backTo?: string;
  backLabel?: string;
}

export default function BackNavigation({ title, backTo, backLabel }: BackNavigationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Determine default back route based on current path
  const getDefaultBackRoute = () => {
    if (pathname.includes('/kitchen') || pathname.includes('/delivery')) {
      return '/dashboard';
    }
    return '/dashboard';
  };

  const backRoute = backTo || getDefaultBackRoute();
  const defaultBackLabel = pathname.includes('/kitchen') ? 'Dashboard' :
                           pathname.includes('/delivery') ? 'Dashboard' :
                           'Dashboard';

  const handleBackClick = () => {
    if (backTo) {
      router.push(backTo);
    } else {
      router.push(backRoute);
    }
  };

  return (
    <div className="bg-white shadow-sm border-b border-gray-200 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Back Button */}
            <button
              onClick={handleBackClick}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-150 group"
            >
              <svg
                className="w-5 h-5 mr-2 transition-transform duration-150 group-hover:-translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span className="text-sm font-medium">{backLabel || defaultBackLabel}</span>
            </button>

            {/* Page Title */}
            <div className="ml-6">
              <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <a
              href="/dashboard"
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            >
              Dashboard
            </a>
            <a
              href="/kitchen"
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            >
              Cozinha
            </a>
            <a
              href="/delivery"
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            >
              Delivery
            </a>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-500 transition-colors duration-150"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">Abrir menu principal</span>
              {/* Hamburger icon */}
              <svg
                className={`${isMobileMenuOpen ? 'hidden' : 'block'} h-6 w-6 transition-all duration-300 ease-in-out`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              {/* Close icon */}
              <svg
                className={`${isMobileMenuOpen ? 'block' : 'hidden'} h-6 w-6 transition-all duration-300 ease-in-out`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          {/* Backdrop */}
          <div
            className={`fixed inset-0 bg-black transition-opacity duration-300 ease-in-out z-40 ${
              isMobileMenuOpen ? 'bg-opacity-50' : 'bg-opacity-0'
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          />
          {/* Menu panel */}
          <div className={`fixed top-16 left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-50 transform transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
          }`}>
            <div className="pt-2 pb-3 space-y-1">
              <button
                onClick={() => {
                  handleBackClick();
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-3 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors duration-150"
              >
                ← {backLabel || defaultBackLabel}
              </button>
              <a
                href="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors duration-150"
              >
                Dashboard
              </a>
              <a
                href="/kitchen"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors duration-150"
              >
                Cozinha
              </a>
              <a
                href="/delivery"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors duration-150"
              >
                Delivery
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}