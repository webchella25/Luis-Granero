// app/admin/test-scraper/page.tsx

'use client';

import { useState } from 'react';

export default function TestScraperPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState('');
  
  const [query, setQuery] = useState('restaurantes');
  const [location, setLocation] = useState('Sevilla');
  const [maxResults, setMaxResults] = useState(10);
  
  const handleSearch = async () => {
    setLoading(true);
    setError('');
    setResults(null);
    
    try {
      const response = await fetch('/api/leads/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, location, maxResults })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error en la búsqueda');
      }
      
      setResults(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-950 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-cyan-400 mb-8">
          🔍 Test: Google Maps Scraper
        </h1>
        
        {/* Formulario */}
        <div className="bg-gray-900 rounded-lg p-6 mb-8 border border-gray-800">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Tipo de negocio</label>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-gray-800 text-white px-4 py-2 rounded border border-gray-700"
                placeholder="ej: restaurantes, hoteles"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-2">Ubicación</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-gray-800 text-white px-4 py-2 rounded border border-gray-700"
                placeholder="ej: Sevilla, Madrid"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-2">Max resultados</label>
              <input
                type="number"
                value={maxResults}
                onChange={(e) => setMaxResults(parseInt(e.target.value))}
                className="w-full bg-gray-800 text-white px-4 py-2 rounded border border-gray-700"
                min="5"
                max="50"
              />
            </div>
          </div>
          
          <button
            onClick={handleSearch}
            disabled={loading}
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-semibold py-3 rounded disabled:opacity-50"
          >
            {loading ? '🔄 Buscando...' : '🚀 Buscar Leads'}
          </button>
        </div>
        
        {/* Error */}
        {error && (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-8">
            <p className="text-red-400">❌ {error}</p>
          </div>
        )}
        
        {/* Resultados */}
        {results && (
          <div>
            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-8">
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                <p className="text-gray-400 text-sm">Total Leads</p>
                <p className="text-2xl font-bold text-white">{results.stats.total}</p>
              </div>
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                <p className="text-gray-400 text-sm">Alta Oportunidad</p>
                <p className="text-2xl font-bold text-green-400">{results.stats.highOpportunity}</p>
              </div>
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                <p className="text-gray-400 text-sm">Con Website</p>
                <p className="text-2xl font-bold text-blue-400">{results.stats.withWebsite}</p>
              </div>
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                <p className="text-gray-400 text-sm">Sin Website</p>
                <p className="text-2xl font-bold text-yellow-400">{results.stats.withoutWebsite}</p>
              </div>
            </div>
            
            {/* Tabla de leads */}
            <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="text-left p-4 text-gray-400">Score</th>
                    <th className="text-left p-4 text-gray-400">Negocio</th>
                    <th className="text-left p-4 text-gray-400">Rating</th>
                    <th className="text-left p-4 text-gray-400">Website</th>
                    <th className="text-left p-4 text-gray-400">Problemas</th>
                    <th className="text-left p-4 text-gray-400">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {results.leads.map((lead: any, i: number) => (
                    <tr key={i} className="border-t border-gray-800 hover:bg-gray-800/50">
                      <td className="p-4">
                        <span className={`
                          px-3 py-1 rounded-full text-sm font-semibold
                          ${lead.opportunityScore >= 80 ? 'bg-green-500/20 text-green-400' : ''}
                          ${lead.opportunityScore >= 60 && lead.opportunityScore < 80 ? 'bg-yellow-500/20 text-yellow-400' : ''}
                          ${lead.opportunityScore < 60 ? 'bg-gray-500/20 text-gray-400' : ''}
                        `}>
                          {lead.opportunityScore}
                        </span>
                      </td>
                      <td className="p-4">
                        <p className="text-white font-medium">{lead.name}</p>
                        <p className="text-gray-400 text-sm">{lead.category}</p>
                      </td>
                      <td className="p-4">
                        {lead.rating ? (
                          <div>
                            <span className="text-yellow-400">★ {lead.rating}</span>
                            <span className="text-gray-400 text-sm ml-2">({lead.reviewCount})</span>
                          </div>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="p-4">
                        {lead.website ? (
                          <a href={lead.website} target="_blank" className="text-cyan-400 hover:underline text-sm">
                            {lead.website.replace('https://', '').substring(0, 30)}...
                          </a>
                        ) : (
                          <span className="text-red-400">❌ Sin web</span>
                        )}
                      </td>
                      <td className="p-4">
                        {lead.webAnalysis?.issues.length > 0 ? (
                          <ul className="text-sm text-orange-400">
                            {lead.webAnalysis.issues.slice(0, 2).map((issue: string, j: number) => (
                              <li key={j}>• {issue}</li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="p-4">
                        {lead.possibleEmails?.[0] ? (
                          <span className="text-sm text-gray-300">{lead.possibleEmails[0]}</span>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}