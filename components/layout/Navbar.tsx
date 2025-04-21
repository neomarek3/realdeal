"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers';
import { useLanguage } from '@/app/providers/LanguageProvider';
import ThemeToggle from './ThemeToggle';
import LanguageToggle from './LanguageToggle';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  
  // Use the auth context instead of local state
  const { user, isAuthenticated, logout } = useAuth();
  const { t } = useLanguage();

  const handleLogout = () => {
    // Use the context's logout method
    logout();
    
    // Redirect to login page
    router.push('/auth/login');
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + '/');
  };

  return (
    <nav className="bg-white shadow dark:bg-gray-900 dark:text-white transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-blue-600 dark:text-blue-400">
                RealDeal
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/') ? 'border-blue-500 text-gray-900 dark:text-white' : 'border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white'
                }`}
              >
                {t('nav.home')}
              </Link>
              <Link
                href="/marketplace"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/marketplace') ? 'border-blue-500 text-gray-900 dark:text-white' : 'border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white'
                }`}
              >
                {t('nav.marketplace')}
              </Link>
              {isAuthenticated && (
                <>
                  <Link
                    href="/dashboard"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive('/dashboard') ? 'border-blue-500 text-gray-900 dark:text-white' : 'border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white'
                    }`}
                  >
                    {t('nav.dashboard')}
                  </Link>
                  <Link
                    href="/user/messages"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive('/user/messages') ? 'border-blue-500 text-gray-900 dark:text-white' : 'border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white'
                    }`}
                  >
                    {t('nav.messages')}
                  </Link>
                  {user?.email === 'neosiphonese@gmail.com' && (
                    <Link
                      href="/admin"
                      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                        isActive('/admin') ? 'border-blue-500 text-gray-900 dark:text-white' : 'border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white'
                      }`}
                    >
                      {t('nav.admin')}
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="flex items-center space-x-2">
              <LanguageToggle />
              <ThemeToggle />
            </div>
            
            {isAuthenticated ? (
              <div className="ml-3 relative">
                <div className="flex items-center space-x-4">
                  <Link
                    href="/marketplace/listings/create"
                    className="bg-blue-600 dark:bg-blue-700 px-3 py-1.5 text-sm text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600"
                  >
                    {t('nav.newListing')}
                  </Link>
                  <Link href="/user/profile" className="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white">
                    {user?.name}
                  </Link>
                  <button
                    className="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white"
                    onClick={handleLogout}
                  >
                    {t('nav.logout')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/auth/login"
                  className="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-blue-600 dark:bg-blue-700 px-3 py-1.5 text-sm text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600"
                >
                  {t('nav.signup')}
                </Link>
              </div>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <div className="flex items-center space-x-2 mr-2">
              <LanguageToggle />
              <ThemeToggle />
            </div>
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {!isOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="sm:hidden dark:bg-gray-900">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              href="/"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                isActive('/') ? 'border-blue-500 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-gray-800' : 'border-transparent text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white'
              }`}
            >
              {t('nav.home')}
            </Link>
            <Link
              href="/marketplace"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                isActive('/marketplace') ? 'border-blue-500 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-gray-800' : 'border-transparent text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white'
              }`}
            >
              {t('nav.marketplace')}
            </Link>
            <Link
              href="/marketplace/listings"
              className={`block pl-3 pr-4 py-2 border-l-4 ml-4 text-base font-medium ${
                isActive('/marketplace/listings') ? 'border-blue-500 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-gray-800' : 'border-transparent text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white'
              }`}
            >
              {t('nav.marketplace')}
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  href="/dashboard"
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    isActive('/dashboard') ? 'border-blue-500 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-gray-800' : 'border-transparent text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white'
                  }`}
                >
                  {t('nav.dashboard')}
                </Link>
                <Link
                  href="/user/messages"
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    isActive('/user/messages') ? 'border-blue-500 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-gray-800' : 'border-transparent text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white'
                  }`}
                >
                  {t('nav.messages')}
                </Link>
                {user?.email === 'neosiphonese@gmail.com' && (
                  <Link
                    href="/admin"
                    className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                      isActive('/admin') ? 'border-blue-500 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-gray-800' : 'border-transparent text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white'
                    }`}
                  >
                    {t('nav.admin')}
                  </Link>
                )}
              </>
            )}
            {isAuthenticated && (
              <>
                <Link
                  href="/marketplace/listings/create"
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    isActive('/marketplace/listings/create') ? 'border-blue-500 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-gray-800' : 'border-transparent text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white'
                  }`}
                >
                  {t('nav.newListing')}
                </Link>
                <Link
                  href="/user/profile"
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    isActive('/user/profile') ? 'border-blue-500 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-gray-800' : 'border-transparent text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white'
                  }`}
                >
                  {t('nav.profile')}
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white"
                >
                  {t('nav.logout')}
                </button>
              </>
            )}
            {!isAuthenticated && (
              <>
                <Link
                  href="/auth/login"
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    isActive('/auth/login') ? 'border-blue-500 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-gray-800' : 'border-transparent text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white'
                  }`}
                >
                  {t('nav.login')}
                </Link>
                <Link
                  href="/auth/register"
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    isActive('/auth/register') ? 'border-blue-500 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-gray-800' : 'border-transparent text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white'
                  }`}
                >
                  {t('nav.signup')}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
} 