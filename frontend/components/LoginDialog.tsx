'use client';

import Image from 'next/image';
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from 'react';
import { useAuthContext } from './AuthContext';
import { api } from '@/lib/api';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import {
  AlertIcon, BellIcon, ChatIcon, CheckIcon, CloseIcon, EyeIcon, EyeOffIcon, HeartIcon, InfoIcon,
  LockIcon, MailIcon, MegaphoneIcon, UserIcon,
} from './AuthIcons';

const EMAIL_DOMAIN = '@cmu.ac.th';
const MIN_PASSWORD = 8;
const SUCCESS_MS = 1100;

export type AuthMode = 'login' | 'register';
type Field = 'name' | 'email' | 'password' | 'confirm';
type Errors = Partial<Record<Field, string>>;

/** Map Supabase / API errors to a message the user can act on. */
function toThaiError(message: string) {
  if (/invalid login credentials/i.test(message)) return 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
  // Only accounts made before sign up skipped email confirmation can still hit this.
  if (/email not confirmed/i.test(message)) return 'บัญชีนี้ยังไม่ได้ยืนยัน กรุณาติดต่อผู้ดูแลระบบ';
  if (/already has an account|already registered/i.test(message)) return 'อีเมลนี้มีบัญชีอยู่แล้ว ลองเข้าสู่ระบบแทน';
  if (/rate limit|too many/i.test(message)) return 'ทำรายการบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่';
  if (/password/i.test(message) && /weak|short|characters/i.test(message)) return `รหัสผ่านต้องยาวอย่างน้อย ${MIN_PASSWORD} ตัวอักษร`;
  if (/fetch|network/i.test(message)) return 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ กรุณาลองใหม่อีกครั้ง';
  return message;
}

/** 0-4: length, mixed case, digits and symbols each add a step. */
function passwordScore(pw: string) {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= MIN_PASSWORD) s++;
  if (pw.length >= 12) s++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) s++;
  return pw.length < MIN_PASSWORD ? Math.min(s, 1) : Math.max(s, 1);
}
const STRENGTH = [
  { label: '', color: 'var(--color-neutral-300)' },
  { label: 'อ่อน', color: 'var(--pri)' },
  { label: 'พอใช้', color: 'var(--color-accent-2-500)' },
  { label: 'ดี', color: 'var(--color-accent-500)' },
  { label: 'แข็งแรง', color: 'var(--color-accent-700)' },
];

function FieldShell({ id, label, aside, error, hint, invalid, children }: {
  id: string; label: string; aside?: ReactNode; error?: string; hint?: ReactNode; invalid?: boolean; children: ReactNode;
}) {
  return (
    <div className="auth-field">
      <label htmlFor={id} className="auth-label"><span>{label}</span>{aside}</label>
      <div className="auth-control" data-invalid={invalid || !!error}>{children}</div>
      {error ? <span id={`${id}-err`} className="auth-hint" role="alert">{error}</span> : hint}
    </div>
  );
}

const PERKS = [
  { icon: <MegaphoneIcon />, title: 'ไม่พลาดประกาศสำคัญ', text: 'ประกาศด่วนจากหน่วยงานส่งตรงถึงการแจ้งเตือน' },
  { icon: <ChatIcon />, title: 'ถาม-ตอบกับคนในมหาวิทยาลัย', text: 'โพสต์ แสดงความคิดเห็น และตอบกลับได้ทันที' },
  { icon: <HeartIcon />, title: 'ฟีดตามหมวดที่สนใจ', text: 'เลือกหมวดที่ชอบ แล้วเห็นเรื่องที่ใช่ก่อน' },
];

export function LoginDialog({ initialMode = 'login', onClose, onDone }: {
  initialMode?: AuthMode;
  onClose: () => void;
  /** Called once the success animation has played. */
  onDone: (registered: boolean) => void;
}) {
  const { signIn } = useAuthContext();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [name, setName] = useState('');
  const [user, setUser] = useState(''); // the part before @cmu.ac.th
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [banner, setBanner] = useState<{ kind: 'error' | 'info'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<null | { registered: boolean }>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const userRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const isRegister = mode === 'register';
  const score = passwordScore(password);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !busy) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, busy]);

  // Focus the first field whenever the form switches.
  const trap = useFocusTrap<HTMLDivElement>();
  useEffect(() => { (isRegister ? nameRef : userRef).current?.focus(); }, [isRegister]);

  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => onDone(done.registered), SUCCESS_MS);
    return () => clearTimeout(t);
  }, [done, onDone]);

  const switchMode = (m: AuthMode) => {
    if (m === mode) return;
    setMode(m);
    setErrors({});
    setBanner(null);
    setPassword('');
    setConfirm('');
  };

  const clearError = (f: Field) => {
    setErrors((e) => (e[f] ? { ...e, [f]: undefined } : e));
    setBanner((b) => (b?.kind === 'error' ? null : b));
  };

  // Accept a pasted full address: keep only the part before @cmu.ac.th.
  const onUserChange = (v: string) => {
    setUser(v.replace(/\s/g, '').replace(/@cmu\.ac\.th$/i, ''));
    clearError('email');
  };

  const trackCaps = (e: ReactKeyboardEvent<HTMLInputElement>) => setCapsLock(e.getModifierState?.('CapsLock') ?? false);

  const validate = (): Errors => {
    const e: Errors = {};
    if (isRegister && name.trim().length < 2) e.name = 'กรอกชื่อที่แสดงอย่างน้อย 2 ตัวอักษร';
    if (!user) e.email = 'กรอกชื่อบัญชี CMU ของคุณ';
    else if (user.includes('@')) e.email = `ใช้ได้เฉพาะ ${EMAIL_DOMAIN} · กรอกแค่ส่วนหน้า @ ก็พอ`;
    else if (!/^[a-z0-9._%+-]+$/i.test(user)) e.email = 'ชื่อบัญชีมีอักขระที่ใช้ไม่ได้';
    if (!password) e.password = 'กรอกรหัสผ่าน';
    else if (isRegister && password.length < MIN_PASSWORD) e.password = `รหัสผ่านต้องยาวอย่างน้อย ${MIN_PASSWORD} ตัวอักษร`;
    if (isRegister && !e.password && password !== confirm) e.confirm = 'รหัสผ่านทั้งสองช่องไม่ตรงกัน';
    return e;
  };

  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (busy) return;
    const found = validate();
    setErrors(found);
    setBanner(null);
    const first = (['name', 'email', 'password', 'confirm'] as Field[]).find((f) => found[f]);
    if (first) {
      ({ name: nameRef, email: userRef, password: passwordRef, confirm: passwordRef } as const)[first].current?.focus();
      return;
    }

    const addr = `${user.toLowerCase()}${EMAIL_DOMAIN}`;
    setBusy(true);
    try {
      if (isRegister) {
        const res = await api('/user/register', { method: 'POST', json: { email: addr, password, display_name: name.trim() } });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) {
          const msg = toThaiError(body?.message ?? `HTTP ${res.status}`);
          if (res.status === 409) setErrors({ email: msg });
          else setBanner({ kind: 'error', text: msg });
          return;
        }
        // The account is created ready to use, so sign straight in.
        const err = await signIn(addr, password);
        if (err) {
          switchMode('login');
          setBanner({ kind: 'info', text: 'สร้างบัญชีแล้ว · กรุณาเข้าสู่ระบบอีกครั้ง' });
          return;
        }
        setDone({ registered: true });
      } else {
        const err = await signIn(addr, password);
        if (err) return setBanner({ kind: 'error', text: toThaiError(err) });
        setDone({ registered: false });
      }
    } catch (err: any) {
      setBanner({ kind: 'error', text: toThaiError(err?.message ?? String(err)) });
    } finally {
      setBusy(false);
    }
  };

  const capsHint = capsLock ? <span className="auth-hint is-soft">Caps Lock เปิดอยู่</span> : undefined;

  return (
    <div
      className="dialog-backdrop"
      style={{ zIndex: 45, animation: 'wnm-pop .16s ease both' }}
      onMouseDown={(e) => { if (e.target === e.currentTarget && !busy) onClose(); }}
    >
      <div ref={trap} className="auth-dialog" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        {/* ── Brand panel ── */}
        <aside className="auth-brand">
          <span className="auth-blob" style={{ width: 180, height: 180, right: -60, top: -50, background: 'color-mix(in srgb, #fff 12%, transparent)' }} />
          <span className="auth-blob" style={{ width: 120, height: 120, left: -40, bottom: 70, background: 'color-mix(in srgb, var(--color-accent-2-300) 30%, transparent)' }} />

          <div className="auth-logo" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8, position: 'relative' }}>
            <Image src="/logo.png" alt="WhongNaiMor" width={640} height={458} priority
              style={{ height: 'auto', width: 'min(210px, 100%)', filter: 'drop-shadow(0 8px 18px color-mix(in srgb, var(--color-accent-900) 35%, transparent))' }} />
            <span style={{ fontSize: 12.5, opacity: 0.9 }}>วงในมอ · พื้นที่ข่าวสารของชาว มช.</span>
          </div>

          <div className="auth-perks" style={{ display: 'flex', flexDirection: 'column', gap: 14, position: 'relative', marginTop: 8 }}>
            {PERKS.map((p) => (
              <div key={p.title} className="auth-perk">
                <span className="auth-perk-icon">{p.icon}</span>
                <span>
                  <strong style={{ display: 'block', fontWeight: 600 }}>{p.title}</strong>
                  <span style={{ opacity: 0.82, fontSize: 12 }}>{p.text}</span>
                </span>
              </div>
            ))}
          </div>

          {/* A sample notification, to show what signing in gets you */}
          <div className="auth-perks" aria-hidden="true" style={{ position: 'relative', marginTop: 6, padding: '12px 14px', borderRadius: 16, background: 'color-mix(in srgb, #fff 16%, transparent)', border: '1px solid color-mix(in srgb, #fff 28%, transparent)', backdropFilter: 'blur(6px)', transform: 'rotate(-1.5deg)', boxShadow: '0 10px 24px color-mix(in srgb, var(--color-accent-900) 22%, transparent)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 10.5, opacity: 0.9, marginBottom: 6 }}>
              <BellIcon />
              <span style={{ letterSpacing: '.08em', textTransform: 'uppercase' }}>การแจ้งเตือน</span>
              <span style={{ marginLeft: 'auto' }}>เมื่อสักครู่</span>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 999, background: 'var(--alert-soft)', color: 'var(--alert-ink)', flex: 'none' }}>ประกาศด่วน</span>
              <span style={{ fontSize: 12.5, fontWeight: 600, lineHeight: 1.35 }}>ห้องสมุดปิดเร็วขึ้นวันศุกร์นี้</span>
            </div>
          </div>

          <span className="auth-brand-foot" style={{ position: 'relative', marginTop: 'auto', alignSelf: 'flex-start', fontSize: 11.5, padding: '5px 11px', borderRadius: 999, background: 'color-mix(in srgb, #000 16%, transparent)' }}>
            เฉพาะบัญชี {EMAIL_DOMAIN}
          </span>
        </aside>

        {/* ── Form panel ── */}
        <div className="auth-form">
          <button type="button" className="auth-close" onClick={onClose} disabled={busy} aria-label="ปิด"><CloseIcon /></button>

          {done ? (
            <div className="auth-success" role="status">
              <span className="auth-check"><CheckIcon /></span>
              <h4 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
                {done.registered ? `ยินดีต้อนรับ ${name.trim()}!` : 'ยินดีต้อนรับกลับมา!'}
              </h4>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--color-neutral-700)' }}>
                {done.registered ? 'สร้างบัญชีเรียบร้อย กำลังพาเข้าสู่ฟีด…' : 'เข้าสู่ระบบสำเร็จ กำลังพาเข้าสู่ฟีด…'}
              </p>
            </div>
          ) : (
            <form onSubmit={submit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ paddingRight: 30 }}>
                <h4 id="auth-title" style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 700, letterSpacing: '-0.01em' }}>
                  {isRegister ? 'สร้างบัญชีใหม่' : 'ยินดีต้อนรับกลับมา'}
                </h4>
                <p style={{ margin: 0, fontSize: 12.5, color: 'var(--color-neutral-700)' }}>
                  {isRegister ? 'ใช้เวลาไม่ถึงนาที แล้วเริ่มโพสต์ได้เลย' : 'เข้าสู่ระบบเพื่อโพสต์ แสดงความคิดเห็น และรับการแจ้งเตือน'}
                </p>
              </div>

              <div className="auth-seg" role="tablist" aria-label="เลือกการเข้าใช้งาน">
                <span className="auth-seg-pill" style={{ transform: isRegister ? 'translateX(100%)' : 'none' }} />
                <button type="button" role="tab" aria-selected={!isRegister} onClick={() => switchMode('login')}>เข้าสู่ระบบ</button>
                <button type="button" role="tab" aria-selected={isRegister} onClick={() => switchMode('register')}>สมัครสมาชิก</button>
              </div>

              {isRegister && (
                <FieldShell id="auth-name" label="ชื่อที่แสดง" error={errors.name}
                  hint={<span className="auth-hint is-soft">ชื่อนี้จะแสดงบนโพสต์และความคิดเห็นของคุณ</span>}>
                  <UserIcon />
                  <input ref={nameRef} id="auth-name" autoComplete="nickname" maxLength={50} placeholder="เช่น ปลาย วิศวะ"
                    value={name} onChange={(e) => { setName(e.target.value); clearError('name'); }}
                    aria-invalid={!!errors.name} aria-describedby={errors.name ? 'auth-name-err' : undefined} />
                </FieldShell>
              )}

              <FieldShell id="auth-email" label="อีเมลมหาวิทยาลัย" error={errors.email}>
                <MailIcon />
                <input ref={userRef} id="auth-email" autoComplete="username" autoCapitalize="none" spellCheck={false}
                  placeholder="ชื่อบัญชี" value={user} onChange={(e) => onUserChange(e.target.value)}
                  aria-invalid={!!errors.email} aria-describedby={errors.email ? 'auth-email-err' : undefined} />
                <span className="auth-suffix">{EMAIL_DOMAIN}</span>
              </FieldShell>

              <FieldShell id="auth-password" label="รหัสผ่าน" error={errors.password}
                aside={isRegister && password ? <span style={{ color: STRENGTH[score].color, fontWeight: 600 }}>{STRENGTH[score].label}</span> : undefined}
                hint={isRegister ? (
                  <>
                    {password && (
                      <div className="auth-meter" aria-hidden="true">
                        {[1, 2, 3, 4].map((i) => <span key={i} style={i <= score ? { background: STRENGTH[score].color } : undefined} />)}
                      </div>
                    )}
                    {capsHint ?? <span className="auth-hint is-soft">อย่างน้อย {MIN_PASSWORD} ตัว · ผสมตัวพิมพ์ใหญ่ ตัวเลข และสัญลักษณ์จะปลอดภัยขึ้น</span>}
                  </>
                ) : capsHint}>
                <LockIcon />
                <input ref={passwordRef} id="auth-password" type={showPassword ? 'text' : 'password'}
                  autoComplete={isRegister ? 'new-password' : 'current-password'} placeholder="••••••••"
                  value={password} onChange={(e) => { setPassword(e.target.value); clearError('password'); }}
                  onKeyUp={trackCaps} onKeyDown={trackCaps}
                  aria-invalid={!!errors.password} aria-describedby={errors.password ? 'auth-password-err' : undefined} />
                <button type="button" className="auth-eye" onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'} aria-pressed={showPassword}>
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </FieldShell>

              {isRegister && (
                <FieldShell id="auth-confirm" label="ยืนยันรหัสผ่าน" error={errors.confirm}
                  hint={confirm && confirm === password ? <span className="auth-hint is-soft" style={{ color: 'var(--color-accent-700)' }}>รหัสผ่านตรงกัน ✓</span> : undefined}>
                  <LockIcon />
                  <input id="auth-confirm" type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="พิมพ์รหัสผ่านอีกครั้ง"
                    value={confirm} onChange={(e) => { setConfirm(e.target.value); clearError('confirm'); }}
                    onKeyUp={trackCaps} onKeyDown={trackCaps}
                    aria-invalid={!!errors.confirm} aria-describedby={errors.confirm ? 'auth-confirm-err' : undefined} />
                </FieldShell>
              )}

              {banner && (
                <div className={`auth-banner is-${banner.kind}`} role={banner.kind === 'error' ? 'alert' : 'status'}>
                  {banner.kind === 'error' ? <AlertIcon /> : <InfoIcon />}
                  <span>{banner.text}</span>
                </div>
              )}

              <button className="auth-submit" type="submit" disabled={busy}>
                {busy && <span className="auth-spinner" aria-hidden="true" />}
                {busy
                  ? (isRegister ? 'กำลังสร้างบัญชี…' : 'กำลังเข้าสู่ระบบ…')
                  : (isRegister ? 'สร้างบัญชีและเข้าสู่ระบบ' : 'เข้าสู่ระบบ')}
              </button>

              <p style={{ margin: 0, textAlign: 'center', fontSize: 12.5, color: 'var(--color-neutral-700)' }}>
                {isRegister ? 'มีบัญชีอยู่แล้ว? ' : 'ยังไม่มีบัญชี? '}
                <button type="button" className="hov-color" onClick={() => switchMode(isRegister ? 'login' : 'register')}
                  style={{ border: 0, background: 'transparent', padding: 0, cursor: 'pointer', font: 'inherit', fontWeight: 600, color: 'var(--color-accent-700)', textDecoration: 'underline', textUnderlineOffset: 3 }}>
                  {isRegister ? 'เข้าสู่ระบบ' : 'สมัครสมาชิกฟรี'}
                </button>
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--color-neutral-600)', fontSize: 11.5 }}>
                <span style={{ flex: 1, height: 1, background: 'var(--color-divider)' }} />
                หรือ
                <span style={{ flex: 1, height: 1, background: 'var(--color-divider)' }} />
              </div>
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={busy}
                style={{ fontFamily: 'var(--font-body)', fontSize: 13, borderRadius: 14, minHeight: 40 }}>
                อ่านต่อแบบผู้เยี่ยมชม
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
