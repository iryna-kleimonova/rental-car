'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from '../Header/Header.module.css';

interface NavLinkProps {
  href: string;
  label: string;
}

const NavLink: React.FC<NavLinkProps> = ({ href, label }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <li>
      <Link
        href={href}
        className={`${styles.navLink} ${isActive ? styles.active : ''}`}
      >
        {label}
      </Link>
    </li>
  );
};

export default NavLink;
