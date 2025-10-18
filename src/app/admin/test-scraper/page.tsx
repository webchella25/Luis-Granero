'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function TestScraperPage() {
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState('google-maps');
  
  // Google Maps states
  const [location, setLocation] = useState('Madrid');
  const [category, setCategory] = useState('restaurante');
  const [maxResults, setMaxResults] = useState(20);
  
  // Google Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(20);
  
  // Instagram states
  const [instagramHashtag, setInstagramHashtag] = useState('');
  const [instagramResults, setInstagramResults] = useState(50);
  
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedLeads, setSelectedLeads] = useState<Set<number>>(new Set());

  // Google Maps scraping
  const handleGoogleMapsScrape = async () => {
    setLoading(true);
    setError(null);
    setResults([]);
    setSelectedLeads(new Set());

    try {
      const res = await fetch('/api/leads/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: category,
          location: location,
          maxResults: maxResults,
          saveToDb: false
        })
      });

      const data = await res.json();

      if (data.success) {
        setResults(data.leads);
      } else {
        setError(data.error || 'Error desconocido');
      }
    } catch (err: any) {
      setError(err?.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // Google Search scraping
  const handleGoogleSearchScrape = async () => {
    if (!searchQuery.trim()) {
      setError('Por favor ingresa una búsqueda');
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);
    setSelectedLeads(new Set());

    try {
      const res = await fetch('/api/scraper/google-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          numResults: searchResults
        })
      });

      const data = await res.json();

      if (data.success) {
        setResults(data.leads);
      } else {
        setError(data.error || 'Error desconocido');
      }
    } catch (err: any) {
      setError(err?.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // Instagram scraping
  const handleInstagramScrape = async () => {
    if (!instagramHashtag.trim()) {
      setError('Por favor ingresa un hashtag');
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);
    setSelectedLeads(new Set());

    try {
      const res = await fetch('/api/scraper/instagram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hashtag: instagramHashtag.replace('#', ''),
          maxResults: instagramResults,
          saveToDb: false
        })
      });

      const data = await res.json();

      if (data.success) {
        setResults(data.leads);
      } else {
        setError(data.error || 'Error desconocido');
      }
    } catch (err: any) {
      setError(err?.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // Toggle selección de un lead
  const toggleLead = (index: number) => {
    const newSelected = new Set(selectedLeads);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedLeads(newSelected);
  };

  // Seleccionar todos
  const selectAll = () => {
    const allIndexes = new Set(results.map((_, i) => i));
    setSelectedLeads(allIndexes);
  };

  // Deseleccionar todos
  const deselectAll = () => {
    setSelectedLeads(new Set());
  };

  // Importar leads seleccionados
  const handleImportLeads = async () => {
    const leadsToImport = results.filter((_, index) => selectedLeads.has(index));
    
    if (leadsToImport.length === 0) {
      alert('⚠️ Selecciona al menos un lead para importar');
      return;
    }

    try {
      const res = await fetch('/api/leads/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leads: leadsToImport })
      });

      const data = await res.json();

      if (data.success) {
        alert(`✅ ${data.imported} leads importados correctamente`);
        router.push('/admin/leads');
      } else {
        alert(`❌ Error: ${data.error}`);
      }
    } catch (err: any) {
      alert(`❌ Error: ${err?.message || 'Error desconocido'}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          🔍 Buscar Nuevos Leads
        </h1>
        <p className="text-gray-400">
          Encuentra negocios potenciales de múltiples fuentes
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-8 flex gap-4">
        <button
          onClick={() => setActiveTab('google-maps')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            activeTab === 'google-maps'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/50'
              : 'bg-slate-800 text-gray-400 hover:text-white'
          }`}
        >
          🗺️ Google Maps
        </button>
        
        <button
          onClick={() => setActiveTab('google-search')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            activeTab === 'google-search'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/50'
              : 'bg-slate-800 text-gray-400 hover:text-white'
          }`}
        >
          🔎 Google Search
        </button>

        <button
          onClick={() => setActiveTab('instagram')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            activeTab === 'instagram'
              ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg shadow-pink-500/50'
              : 'bg-slate-800 text-gray-400 hover:text-white'
          }`}
        >
          📸 Instagram
        </button>
      </div>

      {/* Google Maps Tab */}
      {activeTab === 'google-maps' && (
        <div className="bg-slate-800/50 backdrop-blur border border-cyan-500/20 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">
            🗺️ Buscar en Google Maps
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                📍 Ubicación
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Madrid"
                className="w-full px-4 py-3 bg-slate-900 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                🏷️ Categoría
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="restaurante"
                className="w-full px-4 py-3 bg-slate-900 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                🔢 Cantidad
              </label>
              <input
                type="number"
                value={maxResults}
                onChange={(e) => setMaxResults(parseInt(e.target.value))}
                min={5}
                max={50}
                className="w-full px-4 py-3 bg-slate-900 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            onClick={handleGoogleMapsScrape}
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-4 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/50"
          >
            {loading ? '🔄 Buscando...' : '🚀 Buscar Leads'}
          </button>
        </div>
      )}

      {/* Google Search Tab */}
      {activeTab === 'google-search' && (
        <div className="bg-slate-800/50 backdrop-blur border border-cyan-500/20 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">
            🔎 Buscar en Google Search
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                🔍 Búsqueda
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="restaurante en Xàtiva"
                className="w-full px-4 py-3 bg-slate-900 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
              />
              <p className="text-gray-500 text-sm mt-2">
                💡 Ejemplos: &quot;dentista Madrid centro&quot;, &quot;tienda ropa Valencia&quot;, &quot;arquitecto Barcelona&quot;
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                🔢 Número de resultados
              </label>
              <select
                value={searchResults}
                onChange={(e) => setSearchResults(parseInt(e.target.value))}
                className="w-full px-4 py-3 bg-slate-900 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value={10}>10 resultados</option>
                <option value={20}>20 resultados</option>
                <option value={30}>30 resultados</option>
                <option value={50}>50 resultados</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleGoogleSearchScrape}
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-4 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/50"
          >
            {loading ? '🔄 Buscando...' : '🚀 Buscar Leads'}
          </button>
        </div>
      )}

      {/* Instagram Tab */}
      {activeTab === 'instagram' && (
        <div className="bg-slate-800/50 backdrop-blur border border-pink-500/20 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">
            📸 Buscar en Instagram
          </h2>

          <div className="bg-pink-500/10 border border-pink-500/30 rounded-lg p-4 mb-6">
            <p className="text-pink-300 text-sm">
              💡 <strong>Tip:</strong> Busca negocios que solo tienen Instagram (sin web propia) = Alta probabilidad de conversión
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                #️⃣ Hashtag
              </label>
              <input
                type="text"
                value={instagramHashtag}
                onChange={(e) => setInstagramHashtag(e.target.value)}
                placeholder="restauranteMadrid"
                className="w-full px-4 py-3 bg-slate-900 border border-gray-700 rounded-lg text-white focus:border-pink-500 focus:outline-none"
              />
              <p className="text-gray-500 text-sm mt-2">
                💡 Ejemplos: restauranteValencia, gymBarcelona, peluqueriaMadrid, cafeteriaSevilla
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                🔢 Cantidad de perfiles
              </label>
              <select
                value={instagramResults}
                onChange={(e) => setInstagramResults(parseInt(e.target.value))}
                className="w-full px-4 py-3 bg-slate-900 border border-gray-700 rounded-lg text-white focus:border-pink-500 focus:outline-none"
              >
                <option value={20}>20 perfiles</option>
                <option value={50}>50 perfiles</option>
                <option value={100}>100 perfiles</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleInstagramScrape}
            disabled={loading}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold py-4 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-pink-500/50"
          >
            {loading ? '🔄 Buscando...' : '📸 Buscar en Instagram'}
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-8">
          <p className="text-red-400">❌ {error}</p>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="bg-slate-800/50 backdrop-blur border border-cyan-500/20 rounded-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">
              📊 {results.length} Leads Encontrados
              <span className="text-gray-400 text-base ml-4 font-normal">
                ({selectedLeads.size} seleccionados)
              </span>
            </h2>
            <div className="flex gap-2">
              <button
                onClick={selectAll}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-all text-sm"
              >
                ✅ Todos
              </button>
              <button
                onClick={deselectAll}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-all text-sm"
              >
                ❌ Ninguno
              </button>
              <button
                onClick={handleImportLeads}
                disabled={selectedLeads.size === 0}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                💾 Importar ({selectedLeads.size})
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {results.map((lead: any, index: number) => (
              <LeadCard 
                key={index} 
                lead={lead} 
                source={activeTab}
                selected={selectedLeads.has(index)}
                onToggle={() => toggleLead(index)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function LeadCard({ lead, source, selected, onToggle }: { 
  lead: any; 
  source: string;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <div 
      onClick={onToggle}
      className={`bg-slate-900 border rounded-lg p-6 transition-all cursor-pointer ${
        selected 
          ? 'border-cyan-500 shadow-lg shadow-cyan-500/20 bg-slate-800' 
          : 'border-gray-700 hover:border-cyan-500/50'
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        {/* Checkbox */}
        <div className="flex items-start gap-4 flex-1">
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggle}
            onClick={(e) => e.stopPropagation()}
            className="w-5 h-5 mt-1 accent-cyan-500 cursor-pointer flex-shrink-0"
          />
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-bold text-white">{lead.name}</h3>
              
              {/* Badges */}
              {source === 'google-search' && lead.seoPosition && (
                <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs font-semibold">
                  #{lead.seoPosition} en Google
                </span>
              )}
              
              {source === 'instagram' && lead.username && (
                <span className="px-2 py-1 bg-pink-500/20 text-pink-400 rounded text-xs font-semibold">
                  @{lead.username}
                </span>
              )}
              
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                source === 'google-maps' ? 'bg-cyan-500/20 text-cyan-400' :
                source === 'google-search' ? 'bg-blue-500/20 text-blue-400' :
                'bg-pink-500/20 text-pink-400'
              }`}>
                {source === 'google-maps' ? '🗺️ Maps' : 
                 source === 'google-search' ? '🔎 Search' : 
                 '📸 Instagram'}
              </span>
            </div>

            {/* Instagram specific info */}
            {source === 'instagram' && (
              <div className="flex items-center gap-4 text-sm mb-2">
                {lead.followers && (
                  <span className="text-gray-400">👥 {lead.followers.toLocaleString()} seguidores</span>
                )}
                {lead.posts && (
                  <span className="text-gray-400">📸 {lead.posts} posts</span>
                )}
                {lead.isVerified && (
                  <span className="text-blue-400">✓ Verificado</span>
                )}
              </div>
            )}

            {/* Rating */}
            {lead.rating && (
              <div className="flex items-center gap-2 text-sm mb-2">
                <span className="text-yellow-400">⭐ {lead.rating.toFixed(1)}</span>
                {lead.reviewCount && (
                  <span className="text-gray-400">({lead.reviewCount} reviews)</span>
                )}
              </div>
            )}

            {/* Location */}
            {lead.location && (
              <p className="text-gray-400 text-sm mb-2">📍 {lead.location}</p>
            )}

            {lead.address && (
              <p className="text-gray-400 text-sm mb-2">📍 {lead.address}</p>
            )}

            {/* Bio or Description */}
            {(lead.bio || lead.description) && (
              <p className="text-gray-300 text-sm mb-3">
                {(lead.bio || lead.description).substring(0, 150)}...
              </p>
            )}

            {/* Contact info */}
            <div className="flex flex-wrap gap-2">
              {lead.website && (
                <Link
                  href={lead.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-cyan-400 hover:text-cyan-300 text-sm"
                >
                  🌐 {lead.domain || 'Website'}
                </Link>
              )}
              
              {lead.phone && (
                <span className="text-green-400 text-sm">📱 {lead.phone}</span>
              )}

              {lead.possibleEmails && lead.possibleEmails.length > 0 && (
                <span className="text-blue-400 text-sm">
                  📧 {lead.possibleEmails.length} email(s)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Score */}
        <div className="text-right ml-4 flex-shrink-0">
          <div className={`text-3xl font-bold ${
            lead.opportunityScore >= 70 ? 'text-green-400' :
            lead.opportunityScore >= 50 ? 'text-yellow-400' :
            'text-gray-400'
          }`}>
            {lead.opportunityScore}
          </div>
          <div className="text-gray-400 text-xs">Score</div>
        </div>
      </div>
    </div>
  );
}