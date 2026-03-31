"use client"

import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export default function Logo({ className, size = "md" }: LogoProps) {
  const sizeMap = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-20 h-20",
    xl: "w-32 h-32",
  };

  return (
    <div className={cn("relative flex items-center justify-center group", sizeMap[size], className)}>
      {/* 3D Depth Layers */}
      <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl group-hover:bg-accent/40 transition-all duration-1000 animate-pulse-slow"></div>
      
      <svg 
        viewBox="0 0 100 100" 
        className="w-full h-full drop-shadow-[0_0_20px_hsla(var(--primary),0.5)] transition-all duration-500 group-hover:scale-105"
      >
        <defs>
          <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))' }} />
            <stop offset="100%" style={{ stopColor: 'hsl(var(--accent))' }} />
          </linearGradient>
        </defs>

        {/* Back Hexagon (Glass Layer) */}
        <path 
          d="M50 5 L90 27.5 L90 72.5 L50 95 L10 72.5 L10 27.5 Z" 
          fill="rgba(122, 162, 247, 0.05)"
          className="[.ghost-active_&]:fill-transparent"
        />

        {/* Connectivity Grid */}
        <g className="text-primary/30 [.ghost-active_&]:text-primary/60 transition-colors duration-500">
          <line x1="50" y1="5" x2="50" y2="95" stroke="currentColor" strokeWidth="0.5" />
          <line x1="10" y1="27.5" x2="90" y2="72.5" stroke="currentColor" strokeWidth="0.5" />
          <line x1="10" y1="72.5" x2="90" y2="27.5" stroke="currentColor" strokeWidth="0.5" />
        </g>

        {/* Main Hexagon Border */}
        <path 
          d="M50 5 L90 27.5 L90 72.5 L50 95 L10 72.5 L10 27.5 Z" 
          fill="none"
          stroke="url(#logoGrad)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="[.ghost-active_&]:stroke-primary transition-all duration-500"
        />

        {/* Central Core Node */}
        <circle 
          cx="50" 
          cy="50" 
          r="6" 
          className="fill-primary [.ghost-active_&]:fill-transparent [.ghost-active_&]:stroke-primary [.ghost-active_&]:stroke-[1px]"
        />
        <circle 
          cx="50" 
          cy="50" 
          r="12" 
          fill="none" 
          stroke="hsl(var(--primary))" 
          strokeWidth="0.5" 
          strokeDasharray="2 2"
          className="animate-[spin_15s_linear_infinite]"
        />
      </svg>
    </div>
  );
}
