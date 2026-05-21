'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import StudioLayout from '@/components/studio/StudioLayout';

// ─── Modal edición DJ ─────────────────────────────────────────────────────────

function EditDjModal({ dj, onClose, onUpdate, onDelete }: {
  dj: DJ;
  onClose: () => void;
  onUpdate: (dj: DJ) => void;
  onDelete: (id: string) => void;
}) {
  const [nombre, setNombre] = useState(dj.nombre);
  const [fotos, setFotos] = useState<string[]>(dj.fotos);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deletingFoto, setDeletingFoto] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const addFotoRef = useRef<HTMLInputElement | null>(null);

  async function handleSaveNombre() {
    setSaving(true);
    try {
      const res = await fetch(`/api/studio/djs/${dj._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombre.trim() }),
      });
      const data = (await res.json()) as { dj: DJ };
      onUpdate({ ...dj, nombre: data.dj.nombre });
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteFoto(fotoPath: string) {
    setDeletingFoto(fotoPath);
    try {
      const encoded = encodeURIComponent(fotoPath);
      await fetch(`/api/studio/djs/${dj._id}/fotos/${encoded}`, { method: 'DELETE' });
      const newFotos = fotos.filter(f => f !== fotoPath);
      setFotos(newFotos);
      onUpdate({ ...dj, fotos: newFotos });
    } finally {
      setDeletingFoto(null);
    }
  }

  async function handleAddFoto(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`/api/studio/djs/${dj._id}/fotos`, { method: 'POST', body: fd });
      const data = (await res.json()) as { dj: DJ };
      setFotos(data.dj.fotos);
      onUpdate({ ...dj, fotos: data.dj.fotos });
    } finally {
      setUploading(false);
    }
  }

  async function handleDeleteDj() {
    setDeleting(true);
    try {
      await fetch(`/api/studio/djs/${dj._id}`, { method: 'DELETE' });
      onDelete(dj._id);
      onClose();
    } finally {
      setDeleting(false);
    }
  }

  function handleSetPrimary(fotoPath: string) {
    const newFotos = [fotoPath, ...fotos.filter(f => f !== fotoPath)];
    setFotos(newFotos);
    onUpdate({ ...dj, fotos: newFotos });
    // Guardar orden en backend via PATCH (usando fotos reordenadas)
    fetch(`/api/studio/djs/${dj._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: dj.nombre }),
    }).catch(console.error);
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: '#111', border: '1px solid #222', borderRadius: 12, padding: 24,
        width: '100%', maxWidth: 480, maxHeight: '85vh', overflowY: 'auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ color: '#fff', fontSize: 16, fontWeight: 600 }}>Editar DJ {dj.nombre}</h2>
          <button onClick={onClose} style={{ color: '#666', background: 'none', border: 'none',
            cursor: 'pointer', fontSize: 20, lineHeight: 1 }}>×</button>
        </div>

        {/* Nombre */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 11, color: '#666', letterSpacing: '0.08em', textTransform: 'uppercase',
            display: 'block', marginBottom: 6 }}>Nombre</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input type="text" value={nombre} onChange={e => setNombre(e.target.value)}
              style={{ flex: 1, background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#ddd',
                borderRadius: 6, padding: '8px 10px', fontSize: 13 }} />
            <button onClick={handleSaveNombre} disabled={saving || !nombre.trim()}
              style={{ padding: '8px 14px', background: saving ? '#333' : '#7c3aed', color: '#fff',
                border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600,
                cursor: saving ? 'not-allowed' : 'pointer' }}>
              {saving ? '...' : 'Guardar'}
            </button>
          </div>
        </div>

        {/* Fotos */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <label style={{ fontSize: 11, color: '#666', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Fotos ({fotos.length})
            </label>
            <button onClick={() => addFotoRef.current?.click()} disabled={uploading}
              style={{ padding: '4px 10px', background: '#1e1040', color: '#a78bfa', border: '1px solid #7c3aed',
                borderRadius: 6, fontSize: 11, cursor: uploading ? 'not-allowed' : 'pointer' }}>
              {uploading ? 'Subiendo...' : '+ Añadir foto'}
            </button>
            <input ref={addFotoRef} type="file" accept="image/*" style={{ display: 'none' }}
              onChange={e => { const f = e.target.files?.[0]; if (f) handleAddFoto(f); e.target.value = ''; }} />
          </div>

          {fotos.length === 0 ? (
            <p style={{ color: '#444', fontSize: 12, textAlign: 'center', padding: '16px 0' }}>Sin fotos</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {fotos.map((foto, i) => (
                <div key={foto} style={{ position: 'relative', aspectRatio: '1', borderRadius: 8, overflow: 'hidden',
                  border: i === 0 ? '2px solid #f59e0b' : '2px solid transparent' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={foto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {/* Estrella para foto principal */}
                  <button onClick={() => handleSetPrimary(foto)}
                    title={i === 0 ? 'Foto principal' : 'Establecer como principal'}
                    style={{ position: 'absolute', top: 3, left: 3, background: i === 0 ? '#f59e0b' : 'rgba(0,0,0,0.6)',
                      border: 'none', borderRadius: '50%', width: 20, height: 20, fontSize: 10,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: i === 0 ? '#000' : '#888' }}>
                    ★
                  </button>
                  {/* Botón eliminar */}
                  <button onClick={() => handleDeleteFoto(foto)} disabled={deletingFoto === foto}
                    style={{ position: 'absolute', top: 3, right: 3, background: 'rgba(239,68,68,0.8)',
                      border: 'none', borderRadius: '50%', width: 20, height: 20, fontSize: 12,
                      cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', lineHeight: 1 }}>
                    {deletingFoto === foto ? '·' : '×'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Zona peligrosa */}
        <div style={{ borderTop: '1px solid #1a1a1a', paddingTop: 16 }}>
          {!confirmDelete ? (
            <button onClick={() => setConfirmDelete(true)}
              style={{ padding: '8px 14px', background: 'transparent', color: '#ef4444',
                border: '1px solid rgba(239,68,68,0.4)', borderRadius: 6, fontSize: 12,
                cursor: 'pointer', width: '100%' }}>
              Eliminar DJ
            </button>
          ) : (
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 8, padding: 12, textAlign: 'center' }}>
              <p style={{ color: '#fca5a5', fontSize: 12, marginBottom: 10 }}>
                ¿Eliminar a DJ {dj.nombre}? Se borrarán todas sus fotos y logo.
              </p>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                <button onClick={() => setConfirmDelete(false)}
                  style={{ padding: '6px 16px', background: '#222', color: '#aaa',
                    border: '1px solid #333', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button onClick={handleDeleteDj} disabled={deleting}
                  style={{ padding: '6px 16px', background: '#dc2626', color: '#fff',
                    border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600,
                    cursor: deleting ? 'not-allowed' : 'pointer' }}>
                  {deleting ? 'Eliminando...' : 'Sí, eliminar'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface DJ {
  _id: string;
  nombre: string;
  logo_path: string | null;
  fotos: string[];
  creado_en: string;
}

interface LogoLocalAsset {
  _id: string;
  archivo_path: string;
}

export default function DjsPage() {
  const [djs, setDjs] = useState<DJ[]>([]);
  const [logoLocal, setLogoLocal] = useState<LogoLocalAsset | null>(null);
  const [loading, setLoading] = useState(true);
  const [newNombre, setNewNombre] = useState('');
  const [adding, setAdding] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [uploadingLogoLocal, setUploadingLogoLocal] = useState(false);
  const [editingDj, setEditingDj] = useState<DJ | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const logoLocalRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/studio/djs').then((r) => r.json()),
      fetch('/api/studio/assets/logo-local').then((r) => r.json()),
    ]).then(([djsData, logoData]) => {
      setDjs((djsData.djs ?? []) as DJ[]);
      setLogoLocal((logoData.asset as LogoLocalAsset | null) ?? null);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  async function handleAddDj() {
    if (!newNombre.trim()) return;
    setAdding(true);
    try {
      const res = await fetch('/api/studio/djs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: newNombre.trim() }),
      });
      const data = (await res.json()) as { dj: DJ };
      setDjs((p) => [data.dj, ...p]);
      setNewNombre('');
    } finally {
      setAdding(false);
    }
  }

  async function handleUpload(djId: string, tipo: 'foto' | 'logo', file: File) {
    setUploadingId(djId + tipo);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('tipo', tipo);
      const res = await fetch(`/api/studio/djs/${djId}/upload`, { method: 'POST', body: fd });
      const data = (await res.json()) as { dj: DJ };
      setDjs((p) => p.map((d) => (d._id === djId ? data.dj : d)));
    } finally {
      setUploadingId(null);
    }
  }

  async function handleUploadLogoLocal(file: File) {
    setUploadingLogoLocal(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/studio/assets/logo-local', { method: 'POST', body: fd });
      const data = (await res.json()) as { asset: LogoLocalAsset };
      setLogoLocal(data.asset);
    } finally {
      setUploadingLogoLocal(false);
    }
  }

  return (
    <StudioLayout>
      {editingDj && (
        <EditDjModal
          dj={editingDj}
          onClose={() => setEditingDj(null)}
          onUpdate={(updated) => {
            setDjs(p => p.map(d => d._id === updated._id ? { ...d, ...updated } : d));
            setEditingDj(prev => prev ? { ...prev, ...updated } : null);
          }}
          onDelete={(id) => setDjs(p => p.filter(d => d._id !== id))}
        />
      )}
      <div className="p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/studio/carteles" className="text-gray-600 hover:text-gray-400 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Gestionar DJs</h1>
            <p className="text-sm text-gray-500 mt-0.5">Assets y perfiles de DJs para los carteles</p>
          </div>
        </div>

        {/* Logo del local */}
        <div className="mb-8 p-5 rounded-xl bg-white/[0.03] border border-white/[0.08]">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Logo del local</h2>
          <div className="flex items-center gap-6">
            {logoLocal ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={logoLocal.archivo_path} alt="Logo local" className="h-16 object-contain rounded" />
            ) : (
              <div className="h-16 w-32 rounded border border-white/10 bg-white/[0.03] flex items-center justify-center text-xs text-gray-600">
                Sin logo
              </div>
            )}
            <div>
              <button
                onClick={() => logoLocalRef.current?.click()}
                disabled={uploadingLogoLocal}
                className="px-4 py-2 text-sm text-white bg-white/[0.08] hover:bg-white/[0.12] border border-white/10 rounded-lg transition-colors disabled:opacity-50"
              >
                {uploadingLogoLocal ? 'Subiendo...' : logoLocal ? 'Cambiar logo' : 'Subir logo'}
              </button>
              <p className="text-xs text-gray-600 mt-1">JPG, PNG o WEBP · se convierte a JPG</p>
              <input
                ref={logoLocalRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUploadLogoLocal(f); e.target.value = ''; }}
              />
            </div>
          </div>
        </div>

        {/* Añadir DJ */}
        <div className="mb-6 p-5 rounded-xl bg-white/[0.03] border border-white/[0.08]">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Añadir DJ</h2>
          <div className="flex gap-3">
            <input
              type="text"
              value={newNombre}
              onChange={(e) => setNewNombre(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddDj()}
              placeholder="Nombre del DJ"
              className="flex-1 px-3 py-2.5 bg-white/[0.05] border border-white/10 rounded-lg text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-violet-500/50 transition-colors"
            />
            <button
              onClick={handleAddDj}
              disabled={adding || !newNombre.trim()}
              className="px-5 py-2.5 text-sm text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors font-medium"
            >
              {adding ? 'Añadiendo...' : 'Añadir'}
            </button>
          </div>
        </div>

        {/* Lista DJs */}
        {loading ? (
          <div className="text-gray-600 text-sm">Cargando...</div>
        ) : djs.length === 0 ? (
          <p className="text-gray-600 text-sm">No hay DJs registrados todavía.</p>
        ) : (
          <div className="space-y-4">
            {djs.map((dj) => (
              <div key={dj._id} className="p-5 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                <div className="flex items-start gap-5">
                  {/* Foto principal */}
                  <div className="shrink-0">
                    {dj.fotos[0] ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={dj.fotos[0]} alt={dj.nombre} className="w-16 h-16 rounded-full object-cover border-2 border-yellow-500/50" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center text-xs text-gray-600">
                        Sin foto
                      </div>
                    )}
                  </div>

                  {/* Info + acciones */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-white font-semibold">DJ {dj.nombre}</h3>
                        <p className="text-xs text-gray-600 mt-0.5">{dj.fotos.length} foto(s) · {dj.logo_path ? 'con logo' : 'sin logo'}</p>
                      </div>
                      {dj.logo_path && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={dj.logo_path} alt="logo" className="h-8 object-contain opacity-80" />
                      )}
                    </div>

                    {/* Fotos en fila */}
                    {dj.fotos.length > 0 && (
                      <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
                        {dj.fotos.map((foto, i) => (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img key={i} src={foto} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0 border border-white/10" />
                        ))}
                      </div>
                    )}

                    {/* Botones de upload + editar */}
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => fileRefs.current[`${dj._id}-foto`]?.click()}
                        disabled={uploadingId === dj._id + 'foto'}
                        className="px-3 py-1.5 text-xs text-gray-300 bg-white/[0.06] hover:bg-white/[0.10] border border-white/10 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {uploadingId === dj._id + 'foto' ? 'Subiendo...' : '+ Añadir foto'}
                      </button>
                      <button
                        onClick={() => fileRefs.current[`${dj._id}-logo`]?.click()}
                        disabled={uploadingId === dj._id + 'logo'}
                        className="px-3 py-1.5 text-xs text-gray-300 bg-white/[0.06] hover:bg-white/[0.10] border border-white/10 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {uploadingId === dj._id + 'logo' ? 'Subiendo...' : dj.logo_path ? 'Cambiar logo' : '+ Subir logo'}
                      </button>
                      <button
                        onClick={() => setEditingDj(dj)}
                        className="px-3 py-1.5 text-xs text-violet-400 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/30 rounded-lg transition-colors"
                      >
                        Editar
                      </button>
                    </div>
                  </div>
                </div>

                {/* Inputs file ocultos */}
                <input
                  ref={(el) => { fileRefs.current[`${dj._id}-foto`] = el; }}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(dj._id, 'foto', f); e.target.value = ''; }}
                />
                <input
                  ref={(el) => { fileRefs.current[`${dj._id}-logo`] = el; }}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(dj._id, 'logo', f); e.target.value = ''; }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </StudioLayout>
  );
}
