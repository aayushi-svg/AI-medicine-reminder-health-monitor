import React from 'react';

export const PillIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10.5 3.5L3.5 10.5C1.5 12.5 1.5 15.8 3.5 17.8L6.2 20.5C8.2 22.5 11.5 22.5 13.5 20.5L20.5 13.5C22.5 11.5 22.5 8.2 20.5 6.2L17.8 3.5C15.8 1.5 12.5 1.5 10.5 3.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M7 17L17 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const SunIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="4" fill="currentColor"/>
    <path d="M12 2V4M12 20V22M2 12H4M20 12H22M4.93 4.93L6.34 6.34M17.66 17.66L19.07 19.07M4.93 19.07L6.34 17.66M17.66 6.34L19.07 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const MoonIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" fill="currentColor"/>
  </svg>
);

export const AfternoonIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="8" r="4" fill="currentColor"/>
    <path d="M12 2V3M4.22 5.22L4.93 5.93M2 12H3M4.22 18.78L4.93 18.07M20 12H21M19.07 5.93L19.78 5.22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M4 20H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M6 16C6 16 8 18 12 18C16 18 18 16 18 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const HeartIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
);

export const CheckCircleIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.2"/>
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
    <path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const PlantIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 22V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M12 12C12 12 6 10 6 5C8 5 12 7 12 12Z" fill="currentColor" opacity="0.3"/>
    <path d="M12 12C12 12 18 10 18 5C16 5 12 7 12 12Z" fill="currentColor" opacity="0.3"/>
    <path d="M12 12C12 12 6 10 6 5C8 5 12 7 12 12Z" stroke="currentColor" strokeWidth="2"/>
    <path d="M12 12C12 12 18 10 18 5C16 5 12 7 12 12Z" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

export const CapsuleIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="2" width="8" height="20" rx="4" stroke="currentColor" strokeWidth="2"/>
    <path d="M8 12H16" stroke="currentColor" strokeWidth="2"/>
    <rect x="8" y="2" width="8" height="10" rx="4" fill="currentColor" opacity="0.3"/>
  </svg>
);

export const DropIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C12 2 5 10 5 15C5 18.866 8.134 22 12 22C15.866 22 19 18.866 19 15C19 10 12 2 12 2Z" fill="currentColor" opacity="0.3" stroke="currentColor" strokeWidth="2"/>
  </svg>
);
