import type { ReactNode } from 'react';

/** Small stroke icons for the login dialog and account menu (same line style as PostCard's icons). */
function Icon({ size = 18, children }: { size?: number; children: ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

export const MailIcon = () => <Icon><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m4 7 8 6 8-6" /></Icon>;
export const LockIcon = () => <Icon><rect x="4.5" y="10.5" width="15" height="10" rx="2.5" /><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" /></Icon>;
export const UserIcon = () => <Icon><circle cx="12" cy="8.5" r="3.8" /><path d="M4.5 20c1.2-3.6 4-5.5 7.5-5.5s6.3 1.9 7.5 5.5" /></Icon>;
export const EyeIcon = () => <Icon><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="2.8" /></Icon>;
export const EyeOffIcon = () => <Icon><path d="M10.6 5.6A9.6 9.6 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a16 16 0 0 1-2.6 3.4M6.4 6.9C3.9 8.6 2.5 12 2.5 12S6 18.5 12 18.5c1.8 0 3.3-.5 4.6-1.3" /><path d="M9.9 9.9a2.8 2.8 0 0 0 4 4M3 3l18 18" /></Icon>;
export const CloseIcon = () => <Icon><path d="M6 6l12 12M18 6 6 18" /></Icon>;
export const AlertIcon = () => <Icon size={16}><circle cx="12" cy="12" r="9" /><path d="M12 7.5v5.5M12 16.5h.01" /></Icon>;
export const InfoIcon = () => <Icon size={16}><circle cx="12" cy="12" r="9" /><path d="M12 11v5.5M12 7.5h.01" /></Icon>;
export const MegaphoneIcon = () => <Icon><path d="M3.5 10v4a1.5 1.5 0 0 0 1.5 1.5h2L13 19V5L7 8.5H5A1.5 1.5 0 0 0 3.5 10Z" /><path d="M16.5 9a4 4 0 0 1 0 6M19 6.5a7.5 7.5 0 0 1 0 11" /></Icon>;
export const FlagIcon = () => <Icon><path d="M5 21V4.5" /><path d="M5 4.5h11l-2 4 2 4H5" /></Icon>;
export const FlagCheckIcon = () => <Icon><path d="M5 21V4.5" /><path d="M5 4.5h11l-2 4 2 4H5" /><path d="m14 18 2 2 4-4" /></Icon>;
export const ChatIcon = () => <Icon><path d="M20 12a7.5 7.5 0 0 1-11.2 6.5L4 20l1.5-4.6A7.5 7.5 0 1 1 20 12Z" /></Icon>;
export const BellIcon = () => <Icon><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15Z" /><path d="M10 20.5a2.2 2.2 0 0 0 4 0" /></Icon>;
export const HeartIcon = () => <Icon><path d="M12 20s-7.5-4.4-7.5-10A4.3 4.3 0 0 1 12 7.3 4.3 4.3 0 0 1 19.5 10c0 5.6-7.5 10-7.5 10Z" /></Icon>;
export const ShieldIcon = () => <Icon size={14}><path d="M12 3 5 6v5.5c0 4.2 3 7.8 7 9.5 4-1.7 7-5.3 7-9.5V6Z" /><path d="m9 12 2 2 4-4" /></Icon>;
export const LogoutIcon = () => <Icon><path d="M14 4.5h3.5A2.5 2.5 0 0 1 20 7v10a2.5 2.5 0 0 1-2.5 2.5H14" /><path d="M10 16.5 5.5 12 10 7.5M5.5 12H15" /></Icon>;
export const ChevronIcon = () => <Icon size={14}><path d="m6 9 6 6 6-6" /></Icon>;
export const CheckIcon = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
);
export const SearchIcon = () => <Icon><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></Icon>;
export const PlusIcon = () => <Icon><path d="M12 5v14M5 12h14" /></Icon>;
export const SmallCloseIcon = () => <Icon size={14}><path d="M6 6l12 12M18 6 6 18" /></Icon>;
