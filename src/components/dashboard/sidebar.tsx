'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  Search,
  FileText,
  Sparkles,
  BarChart3,
  Settings,
  Zap,
  Home,
  Bug,
  Video,
  Database,
  Palette,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Research Feed', href: '/research', icon: Search },
  { name: 'Generate Content', href: '/generate', icon: Sparkles },
  { name: 'Post Editor', href: '/editor', icon: FileText },
  { name: 'TikTok', href: '/tiktok', icon: Video },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Database', href: '/database', icon: Database },
  { name: 'Brand Logo', href: '/brand/logo', icon: Palette },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Debug', href: '/debug', icon: Bug },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      {/* Mobile Menu Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-slate-900/90 backdrop-blur-xl border border-slate-800/50 text-slate-300 hover:text-white transition-colors"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </motion.button>

      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: isMobileMenuOpen || typeof window !== 'undefined' && window.innerWidth >= 1024 ? 0 : -280 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-slate-950/95 backdrop-blur-xl border-r border-slate-800/50",
          "lg:translate-x-0",
          !isMobileMenuOpen && "-translate-x-full lg:translate-x-0"
        )}
      >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-800/50">
          <motion.div
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/25"
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <Zap className="w-5 h-5 text-white" />
          </motion.div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">
              Aegis
            </h1>
            <p className="text-xs text-slate-500">Viral Engine</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <motion.div
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  )}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <item.icon
                    className={cn(
                      'w-5 h-5',
                      isActive ? 'text-cyan-400' : 'text-slate-500'
                    )}
                  />
                  {item.name}
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400"
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800/50 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">
                Research Lab
              </p>
              <p className="text-xs text-slate-500">Ethical AI Mode</p>
            </div>
          </div>
          <button
            onClick={async () => {
              await fetch('/api/auth/logout', { method: 'POST' });
              window.location.href = '/login';
            }}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    </motion.aside>
    </>
  );
}
