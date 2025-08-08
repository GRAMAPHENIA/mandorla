"use client"

import Link from 'next/link';
import { usePreloader } from '../../hooks/usePreloader';
import { preloadProductModule, preloadCartModule, preloadFavoritesList } from '../../lib/preloader';
import { cn } from '../../lib/utils';

interface SmartLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  preloadTarget?: 'products' | 'cart' | 'favorites';
}

export function SmartLink({ href, children, className, preloadTarget }: SmartLinkProps) {
  const getPreloader = () => {
    switch (preloadTarget) {
      case 'products':
        return preloadProductModule;
      case 'cart':
        return preloadCartModule;
      case 'favorites':
        return preloadFavoritesList;
      default:
        return () => Promise.resolve();
    }
  };

  const { ref, ...hoverProps } = usePreloader(
    preloadTarget || href,
    getPreloader(),
    { strategy: 'hover' }
  );

  return (
    <Link
      href={href}
      className={cn(
        'transition-colors hover:text-primary',
        className
      )}
      ref={ref as any}
      {...hoverProps}
    >
      {children}
    </Link>
  );
}

interface NavigationItem {
  href: string;
  label: string;
  preloadTarget?: 'products' | 'cart' | 'favorites';
}

const navigationItems: NavigationItem[] = [
  { href: '/', label: 'Inicio' },
  { href: '/products', label: 'Productos', preloadTarget: 'products' },
  { href: '/about', label: 'Acerca de' },
  { href: '/contact', label: 'Contacto' },
  { href: '/cart', label: 'Carrito', preloadTarget: 'cart' },
  { href: '/favorites', label: 'Favoritos', preloadTarget: 'favorites' },
];

export function SmartNavigation({ className }: { className?: string }) {
  return (
    <nav className={cn('flex space-x-6', className)}>
      {navigationItems.map((item) => (
        <SmartLink
          key={item.href}
          href={item.href}
          preloadTarget={item.preloadTarget}
          className="text-sm font-medium"
        >
          {item.label}
        </SmartLink>
      ))}
    </nav>
  );
}