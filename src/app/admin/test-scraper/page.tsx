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
  
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  // Google Maps scraping (RUTA CORREGIDA)
  const handleGoogleMapsScrape = async () => {
    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const res = await fetch('/api/leads/search', {  // ← RUTA CORRECTA
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: category,
          location: location,
          maxResults: maxResults,
          saveToDb: false  // No guardar aún, solo mostrar
        })
      });

      const data = await res.json();

      if (data.success) {
        setResults(data.leads);
      } else {
        setError(data.error || 'Error desconocido');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Google Search scraping (NUEVO)
  const handleGoogleSearchScrape = async () => {
    if (!searchQuery.trim()) {
      setError('Por favor ingresa una búsqueda');
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);

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
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Importar leads seleccionados
  const handleImportLeads = async (selectedLeads) => {
    try {
      const res = await fetch('/api/leads/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leads: selectedLeads })
      });

      const data = await res.json();

      if (data.success) {
        alert(`✅ ${data.imported} leads importados correctamente`);
        router.push('/admin/leads');
      } else {
        alert(`❌ Error: ${data.error}`);
      }
    } catch (err) {
      alert(`❌ Error: ${err.message}`);
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
                min="5"
                max="50"
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
                placeholder="abogado laboral Barcelona"
                className="w-full px-4 py-3 bg-slate-900 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
              />
              <p className="text-gray-500 text-sm mt-2">
                💡 Ejemplos: "dentista Madrid centro", "tienda ropa Valencia", "arquitecto Barcelona"
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
            </h2>
            <button
              onClick={() => handleImportLeads(results)}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-all"
            >
              ✅ Importar Todos
            </button>
          </div>

          <div className="space-y-4">
            {results.map((lead, index) => (
              <LeadCard 
                key={index} 
                lead={lead} 
                source={activeTab}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function LeadCard({ lead, source }) {
  return (
    <div className="bg-slate-900 border border-gray-700 rounded-lg p-6 hover:border-cyan-500/50 transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-bold text-white">{lead.name}</h3>
            {source === 'google-search' && lead.seoPosition && (
              <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs font-semibold">
                #{lead.seoPosition} en Google
              </span>
            )}
            <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded text-xs font-semibold">
              {source === 'google-maps' ? '🗺️ Maps' : '🔎 Search'}
            </span>
          </div>

          {lead.rating && (
            <div className="flex items-center gap-2 text-sm mb-2">
              <span className="text-yellow-400">⭐ {lead.rating.toFixed(1)}</span>
              {lead.reviewCount && (
                <span className="text-gray-400">({lead.reviewCount} reviews)</span>
              )}
            </div>
          )}

          {lead.location && (
            <p className="text-gray-400 text-sm mb-2">📍 {lead.location}</p>
          )}

          {lead.address && (
            <p className="text-gray-400 text-sm mb-2">📍 {lead.address}</p>
          )}

          {lead.description && (
            <p className="text-gray-300 text-sm mb-3">{lead.description.substring(0, 150)}...</p>
          )}

          <div className="flex flex-wrap gap-2">
            {lead.website && (
  <Link
    href={lead.website}
    target="_blank"
    rel="noopener noreferrer"
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

        <div className="text-right">
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