"use client";

import type { ReactNode } from "react";
import Link from "next/link";

import { Providers } from "~/providers";
import { NavMenu } from "../app-bridge";

interface GlobalLayoutProps {
  children: ReactNode;
}

export const GlobalLayout = (props: GlobalLayoutProps) => {
  const { children } = props;

  return (
    <Providers>
      <NavMenu>
        <Link href="/">Products</Link>
        <Link href="/settings">Settings</Link>
      </NavMenu>

      {children}
    </Providers>
  );
};
