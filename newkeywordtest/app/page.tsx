'use client';

import { useEffect, useState } from 'react';

interface KeywordData {
  id: string;
  keyword: string;
  descriptions: string[];
  types: string[];
}

export default function Home() {
  const [keywords, setKeywords] = useState<KeywordData[]>([]);
  const [filteredKeywords, setFilteredKeywords] = useState<KeywordData[]>([]);
  const [allTypes, setAllTypes] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isReloading, setIsReloading] = useState(false);

  const fetchData = (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }
    fetch('/api/keywords')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
            setKeywords(data);
            setFilteredKeywords(data);
            
            // Extract unique types
            const types = new Set<string>();
            data.forEach((item: KeywordData) => {
            if (Array.isArray(item.types)) {
                item.types.forEach((t) => types.add(t));
            }
            });
            setAllTypes(Array.from(types).sort());
        }
        setLoading(false);
        setIsReloading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
        setIsReloading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedType === 'All') {
      setFilteredKeywords(keywords);
    } else {
      setFilteredKeywords(keywords.filter((k) => k.types.includes(selectedType)));
    }
  }, [selectedType, keywords]);

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredKeywords.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredKeywords.map(k => k.id)));
    }
  };

  const handleReload = () => {
    setSelectedIds(new Set()); // Clear selections on reload
    setIsReloading(true);
    fetchData(false); // Don't show full loading screen
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading keywords...</div>;

  const allSelected = filteredKeywords.length > 0 && selectedIds.size === filteredKeywords.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < filteredKeywords.length;

  return (
    <main className="min-h-screen p-4 bg-gray-100 font-sans">
      <div className="w-full">
        <header className="mb-6 sticky top-0 bg-gray-100 py-4 z-10 flex flex-col sm:flex-row justify-between items-center border-b border-gray-300 gap-3">
            <h1 className="text-2xl font-bold text-gray-800">
              Korean History Keywords ({filteredKeywords.length})
              {selectedIds.size > 0 && <span className="text-blue-600 ml-2">({selectedIds.size} selected)</span>}
            </h1>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleReload}
                disabled={isReloading}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg 
                  className={`w-4 h-4 ${isReloading ? 'animate-spin' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {isReloading ? 'Reloading...' : 'Reload'}
              </button>
              
              <div className="flex items-center gap-2">
                <label className="font-medium text-gray-700">Filter Type:</label>
                <select 
                    className="border border-gray-300 rounded px-3 py-2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                >
                    <option value="All">All Types</option>
                    {allTypes.map((t) => (
                    <option key={t} value={t}>{t}</option>
                    ))}
                </select>
              </div>
            </div>
        </header>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-center" style={{width: '50px'}}>
                    <input 
                      type="checkbox" 
                      checked={allSelected}
                      ref={input => {
                        if (input) input.indeterminate = someSelected;
                      }}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700" style={{width: '180px'}}>키워드</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700" style={{width: '180px'}}>타입</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">설명</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredKeywords.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-center" style={{width: '50px'}}>
                      <input 
                        type="checkbox" 
                        checked={selectedIds.has(item.id)}
                        onChange={() => toggleSelection(item.id)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900" style={{width: '180px'}}>
                      <div>
                        <div className="font-semibold">{item.keyword}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{item.id}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3" style={{width: '180px'}}>
                      <div className="flex flex-wrap gap-1">
                        {item.types.map((t, i) => (
                          <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-md border border-blue-100 whitespace-nowrap">
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {item.descriptions.length > 0 ? (
                          item.descriptions.map((desc, i) => (
                            <span key={i} className="px-2.5 py-1 bg-gray-100 text-gray-700 text-sm rounded-full border border-gray-200 hover:bg-gray-200 transition-colors">
                              {desc}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400 italic text-xs">No description available</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
