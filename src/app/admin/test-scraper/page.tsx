'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search, MapPin, Tag, Hash, Instagram, Globe,
  Phone, Mail, Star, Download, CheckSquare, Square,
  Loader2, AlertCircle, ChevronRight, Users
} from 'lucide-react';

type Lead = any;

export default function TestScraperPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'google-maps' | 'google-search' | 'instagram'>('google-maps');

  // Google Maps
  const [location, setLocation] = useState('Valencia');
  const [category, setCategory] = useState('taller mecánico');
  const [maxResults, setMaxResults] = useState(20);

  // Google Search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCount, setSearchCount] = useState(20);

  // Instagram
  const [hashtag, setHashtag] = useState('');
  const [igCount, setIgCount] = useState(50);

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Lead[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [importing, setImporting] = useState(false);

  const search = async () => {
    setLoading(true);
    setError(null);
    setResults([]);
    setSelected(new Set());

    try {
      let res: Response;

      if (activeTab === 'google-maps') {
        res = await fetch('/api/leads/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: category, location, maxResults, saveToDb: false }),
        });
      } else if (activeTab === 'google-search') {
        if (!searchQuery.trim()) { setError('Escribe una búsqueda'); setLoading(false); return; }
        res = await fetch('/api/scraper/google-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: searchQuery, numResults: searchCount }),
        });
      } else {
        if (!hashtag.trim()) { setError('Escribe un hashtag'); setLoading(false); return; }
        res = await fetch('/api/scraper/instagram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ hashtag: hashtag.replace('#', ''), maxResults: igCount }),
        });
      }

      const data = await res!.json();
      if (data.success) {
        setResults(data.leads || []);
        if ((data.leads || []).length === 0) setError('No se encontraron resultados');
      } else {
        setError(data.error || 'Error desconocido');
      }
    } catch (err: any) {
      setError(err?.message || 'Error de red');
    } finally {
      setLoading(false);
    }
  };

  const toggleOne = (i: number) => {
    const s = new Set(selected);
    s.has(i) ? s.delete(i) : s.add(i);
    setSelected(s);
  };

  const toggleAll = () => {
    setSelected(selected.size === results.length ? new Set() : new Set(results.map((_, i) => i)));
  };

  const importLeads = async () => {
    const toImport = results.filter((_, i) => selected.has(i));
    if (toImport.length === 0) return;

    setImporting(true);
    try {
      const res = await fetch('/api/leads/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leads: toImport }),
      });
      const data = await res.json();
      if (data.success) {
        router.push('/admin/leads');
      } else {
        setError(data.error || 'Error al importar');
      }
    } catch (err: any) {
      setError(err?.message || 'Error de red');
    } finally {
      setImporting(false);
    }
  };

  const tabs = [
    { id: 'google-maps' as const,   label: 'Google Maps',   accent: 'cyan' },
    { id: 'google-search' as const, label: 'Google Search', accent: 'blue' },
    { id: 'instagram' as const,     label: 'Instagram',     accent: 'pink' },
  ];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
          <Search className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Buscar Nuevos Leads</h1>
          <p className="text-sm text-slate-500">Encuentra negocios potenciales de múltiples fuentes</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map((t) => {
          const active = activeTab === t.id;
          const colors = {
            cyan: active ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/40' : 'text-slate-500 border-slate-800 hover:text-slate-300 hover:border-slate-700',
            blue: active ? 'bg-blue-500/15 text-blue-400 border-blue-500/40' : 'text-slate-500 border-slate-800 hover:text-slate-300 hover:border-slate-700',
            pink: active ? 'bg-pink-500/15 text-pink-400 border-pink-500/40' : 'text-slate-500 border-slate-800 hover:text-slate-300 hover:border-slate-700',
          };
          return (
            <button
              key={t.id}
              onClick={() => { setActiveTab(t.id); setResults([]); setError(null); setSelected(new Set()); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${colors[t.accent as keyof typeof colors]}`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Search form */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        {activeTab === 'google-maps' && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Google Maps</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1.5">Ubicación</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                  <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Valencia"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:border-cyan-500/50 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1.5">Categoría de negocio</label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                  <input
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="taller mecánico"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:border-cyan-500/50 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1.5">Cantidad máxima</label>
                <select
                  value={maxResults}
                  onChange={(e) => setMaxResults(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 focus:border-cyan-500/50 focus:outline-none"
                >
                  {[10, 20, 30, 50].map(n => <option key={n} value={n}>{n} resultados</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'google-search' && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Google Search</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs text-slate-500 mb-1.5">Consulta de búsqueda</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && search()}
                    placeholder="dentista Madrid centro"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:border-blue-500/50 focus:outline-none"
                  />
                </div>
                <p className="text-xs text-slate-600 mt-1.5">Ej: &quot;restaurante italiano Valencia&quot;, &quot;peluquería sin web Sevilla&quot;</p>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1.5">Cantidad</label>
                <select
                  value={searchCount}
                  onChange={(e) => setSearchCount(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 focus:border-blue-500/50 focus:outline-none"
                >
                  {[10, 20, 30, 50].map(n => <option key={n} value={n}>{n} resultados</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'instagram' && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Instagram</h2>
            <div className="bg-pink-500/5 border border-pink-500/20 rounded-lg px-4 py-3 text-xs text-pink-300">
              Busca negocios que solo tienen Instagram (sin web) — alta probabilidad de conversión
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs text-slate-500 mb-1.5">Hashtag</label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                  <input
                    value={hashtag}
                    onChange={(e) => setHashtag(e.target.value)}
                    placeholder="restauranteValencia"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:border-pink-500/50 focus:outline-none"
                  />
                </div>
                <p className="text-xs text-slate-600 mt-1.5">Ej: peluqueriaMadrid, gymBarcelona, cafeteriaSevilla</p>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1.5">Perfiles a buscar</label>
                <select
                  value={igCount}
                  onChange={(e) => setIgCount(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 focus:border-pink-500/50 focus:outline-none"
                >
                  {[20, 50, 100].map(n => <option key={n} value={n}>{n} perfiles</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={search}
          disabled={loading}
          className={`mt-5 w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
            activeTab === 'instagram'
              ? 'bg-pink-500 hover:bg-pink-400 text-white'
              : 'bg-cyan-500 hover:bg-cyan-400 text-slate-900'
          }`}
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Buscando...</>
          ) : (
            <><Search className="w-4 h-4" /> Buscar Leads</>
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          {/* Results header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-slate-300 font-semibold">{results.length} leads encontrados</span>
              <span className="text-slate-600 text-sm">·</span>
              <span className="text-slate-500 text-sm">{selected.size} seleccionados</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleAll}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 border border-slate-700 hover:border-slate-600 rounded-lg transition-all"
              >
                {selected.size === results.length ? <Square className="w-3.5 h-3.5" /> : <CheckSquare className="w-3.5 h-3.5" />}
                {selected.size === results.length ? 'Deseleccionar todo' : 'Seleccionar todo'}
              </button>
              <button
                onClick={importLeads}
                disabled={selected.size === 0 || importing}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-900 rounded-lg transition-all"
              >
                {importing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                Importar ({selected.size})
              </button>
            </div>
          </div>

          {/* Cards */}
          <div className="space-y-2">
            {results.map((lead: Lead, i: number) => (
              <LeadCard
                key={i}
                lead={lead}
                source={activeTab}
                selected={selected.has(i)}
                onToggle={() => toggleOne(i)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function LeadCard({ lead, source, selected, onToggle }: {
  lead: Lead;
  source: string;
  selected: boolean;
  onToggle: () => void;
}) {
  const score = lead.opportunityScore ?? 0;
  const scoreColor =
    score >= 70 ? 'text-green-400 bg-green-500/10 border-green-500/20' :
    score >= 50 ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' :
                  'text-slate-400 bg-slate-800 border-slate-700';

  return (
    <div
      onClick={onToggle}
      className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
        selected
          ? 'bg-cyan-500/5 border-cyan-500/40'
          : 'bg-slate-900 border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Checkbox */}
      <div className={`mt-0.5 w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all ${
        selected ? 'bg-cyan-500 border-cyan-500' : 'border-slate-600'
      }`}>
        {selected && <svg className="w-2.5 h-2.5 text-slate-900" fill="currentColor" viewBox="0 0 12 12"><path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="text-slate-100 font-semibold text-sm">{lead.name}</span>

          {source === 'instagram' && lead.username && (
            <span className="text-xs text-pink-400 bg-pink-500/10 px-1.5 py-0.5 rounded font-mono">@{lead.username}</span>
          )}
          {source === 'google-search' && lead.seoPosition && (
            <span className="text-xs text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded">#{lead.seoPosition} Google</span>
          )}

          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
            source === 'google-maps'   ? 'text-cyan-400 bg-cyan-500/10' :
            source === 'google-search' ? 'text-blue-400 bg-blue-500/10' :
                                         'text-pink-400 bg-pink-500/10'
          }`}>
            {source === 'google-maps' ? 'Maps' : source === 'google-search' ? 'Search' : 'Instagram'}
          </span>
        </div>

        <div className="flex items-center gap-3 flex-wrap text-xs text-slate-500">
          {lead.category && <span>{lead.category}</span>}
          {lead.address && <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{lead.address}</span>}
          {lead.rating > 0 && <span className="flex items-center gap-0.5 text-yellow-500/70"><Star className="w-3 h-3" />{lead.rating} ({lead.reviewCount})</span>}
          {lead.phone && <span className="flex items-center gap-0.5 text-green-500/70"><Phone className="w-3 h-3" />{lead.phone}</span>}
          {lead.possibleEmails?.length > 0 && <span className="flex items-center gap-0.5 text-blue-500/70"><Mail className="w-3 h-3" />{lead.possibleEmails.length} email(s)</span>}
          {lead.followers > 0 && <span className="flex items-center gap-0.5"><Users className="w-3 h-3" />{lead.followers.toLocaleString()}</span>}
        </div>

        {lead.website && (
          <a
            href={lead.website}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="mt-1 flex items-center gap-1 text-xs text-cyan-500/70 hover:text-cyan-400 w-fit"
          >
            <Globe className="w-3 h-3" />
            {lead.domain || lead.website.substring(0, 40)}
          </a>
        )}

        {!lead.website && (
          <span className="mt-1 inline-block text-xs text-red-400/70 font-medium">Sin web</span>
        )}
      </div>

      {/* Score */}
      <div className={`flex-shrink-0 text-center px-2.5 py-1.5 rounded-lg border text-sm font-bold ${scoreColor}`}>
        {score}
      </div>
    </div>
  );
}
