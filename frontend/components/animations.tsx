"use client"

import type React from "react"

export const AnimatedContainer = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => <div className={`${className} animate-stagger`}>{children}</div>

export const AnimatedItem = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => <div className={className}>{children}</div>
