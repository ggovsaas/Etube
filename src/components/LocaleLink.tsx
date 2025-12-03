'use client';

import Link from 'next/link';
import { useLocale } from '@/hooks/useLocale';
import { type ReactNode } from 'react';

interface LocaleLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  [key: string]: any;
}

export default function LocaleLink({ href, children, className, ...props }: LocaleLinkProps) {
  const { getLocalizedPath } = useLocale();
  const localizedHref = getLocalizedPath(href);

  return (
    <Link href={localizedHref} className={className} {...props}>
      {children}
    </Link>
  );
}




