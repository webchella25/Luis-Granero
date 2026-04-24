'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface CanalInfo { _id: string; nombre: string; nicho: string; pipeline_tipo?: string }
function getCanalEmoji(_nombre: string): string { return '📹'; }

interface NavItem { href: string; label: string; exact: boolean; icon: React.ReactNode }

const ICON_PLUS = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);
const ICON_HISTORIAL = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
  </svg>
);
const ICON_CALENDAR = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
  </svg>
);
const ICON_CARTELES = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
  </svg>
);
const ICON_CANALES = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
  </svg>
);
const ICON_CONFIG = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const ICON_MUSIC = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
  </svg>
);

const NAV_NARRATIVO: NavItem[] = [
  { href: '/studio', label: 'Nuevo vídeo', exact: true, icon: ICON_PLUS },
  { href: '/studio/historial', label: 'Historial', exact: false, icon: ICON_HISTORIAL },
  { href: '/studio/calendario', label: 'Calendario', exact: false, icon: ICON_CALENDAR },
  { href: '/studio/carteles', label: 'Carteles', exact: false, icon: ICON_CARTELES },
  { href: '/studio/canales', label: 'Canales', exact: false, icon: ICON_CANALES },
  { href: '/studio/configuracion', label: 'Configuración', exact: false, icon: ICON_CONFIG },
];

const NAV_MUSICA_AMBIENTAL: NavItem[] = [
  { href: '/studio/musica-ambiental/nuevo', label: 'Nuevo vídeo', exact: true, icon: ICON_PLUS },
  { href: '/studio/musica-ambiental/historial', label: 'Historial', exact: false, icon: ICON_HISTORIAL },
  { href: '/studio/musica-ambiental/biblioteca', label: 'Biblioteca', exact: false, icon: ICON_MUSIC },
  { href: '/studio/calendario', label: 'Calendario', exact: false, icon: ICON_CALENDAR },
  { href: '/studio/canales', label: 'Canales', exact: false, icon: ICON_CANALES },
  { href: '/studio/configuracion', label: 'Configuración', exact: false, icon: ICON_CONFIG },
];

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [canales, setCanales] = useState<CanalInfo[]>([]);
  const [canalActivo, setCanalActivo] = useState<CanalInfo | null>(null);
  const [showCanalDropdown, setShowCanalDropdown] = useState(false);
  const [switchingCanal, setSwitchingCanal] = useState(false);

  useEffect(() => {
    fetch('/api/studio/canales')
      .then((r) => r.json())
      .then((d: { canales?: CanalInfo[] }) => { if (d.canales) setCanales(d.canales); })
      .catch(() => null);

    fetch('/api/studio/canal/current')
      .then((r) => r.json())
      .then((d: { canal?: CanalInfo }) => { if (d.canal) setCanalActivo(d.canal); })
      .catch(() => null);
  }, []);

  const navItems = canalActivo?.pipeline_tipo === 'musica_ambiental'
    ? NAV_MUSICA_AMBIENTAL
    : NAV_NARRATIVO;

  function isActive(href: string, exact: boolean): boolean {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  function handleLogout() {
    fetch('/api/studio/auth', { method: 'DELETE' }).then(() => {
      window.location.href = '/studio/login';
    });
  }

  async function switchCanal(canal_id: string) {
    setSwitchingCanal(true);
    setShowCanalDropdown(false);
    try {
      const res = await fetch('/api/studio/canal/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ canal_id }),
      });
      if (res.ok) window.location.reload();
    } finally {
      setSwitchingCanal(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-[#0A0F1C] text-gray-100 font-sans">
      {/* ── Sidebar ── */}
      <aside className="w-[220px] shrink-0 fixed left-0 top-0 h-screen bg-[#090C14] border-r border-white/[0.06] flex flex-col z-30">

        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-violet-600/25 border border-violet-500/30 flex items-center justify-center shrink-0">
              <svg className="w-3.5 h-3.5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <span className="font-bold text-white text-sm tracking-tight">Studio</span>
          </div>
        </div>

        {/* Canal selector */}
        {canales.length > 0 && (
          <div className="px-3 py-2 border-b border-white/[0.06] relative">
            <button
              onClick={() => setShowCanalDropdown(!showCanalDropdown)}
              disabled={switchingCanal}
              className="w-full flex items-center gap-2 px-2 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.07] border border-white/8 transition-all text-left"
            >
              <span className="text-base leading-none">
                {canalActivo ? getCanalEmoji(canalActivo.nombre) : '📺'}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white truncate">
                  {canalActivo?.nombre ?? 'Sin canal'}
                </p>
                {canalActivo?.nicho && (
                  <p className="text-[10px] text-gray-600 truncate">{canalActivo.nicho}</p>
                )}
              </div>
              {switchingCanal ? (
                <div className="w-3 h-3 rounded-full border border-white/20 border-t-white/60 animate-spin shrink-0" />
              ) : (
                <svg className="w-3 h-3 text-gray-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </button>

            {showCanalDropdown && (
              <div className="absolute left-3 right-3 top-full mt-1 bg-[#0D1220] border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden">
                {canales.map((canal) => (
                  <button
                    key={canal._id}
                    onClick={() => switchCanal(canal._id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-white/[0.06] transition-colors ${
                      canal._id === canalActivo?._id ? 'bg-violet-600/10 text-violet-300' : 'text-gray-300'
                    }`}
                  >
                    <span className="text-sm">{getCanalEmoji(canal.nombre)}</span>
                    <span className="text-xs font-medium">{canal.nombre}</span>
                    {canal._id === canalActivo?._id && (
                      <svg className="w-3 h-3 text-violet-400 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                  </button>
                ))}
                <div className="border-t border-white/5">
                  <a
                    href="/studio/canales"
                    className="flex items-center gap-2 px-3 py-2.5 text-xs text-gray-600 hover:text-gray-400 hover:bg-white/[0.04] transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                    </svg>
                    Gestionar canales
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  active
                    ? 'bg-violet-600/15 text-violet-300 border border-violet-500/20'
                    : 'text-gray-500 hover:text-gray-200 hover:bg-white/[0.05] border border-transparent'
                }`}
              >
                <span className={active ? 'text-violet-400' : 'text-gray-600'}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom: logout + version */}
        <div className="px-4 py-4 border-t border-white/[0.06] space-y-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-gray-700 hover:text-gray-400 transition-colors rounded-lg hover:bg-white/[0.03]"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            Salir
          </button>

          <p className="text-[10px] text-gray-800 text-center">v2.0.0</p>
        </div>
      </aside>

      {/* ── Contenido principal ── */}
      <main className="ml-[220px] flex-1 min-h-screen overflow-y-auto bg-[#0A0F1C]">
        {children}
      </main>
    </div>
  );
}
