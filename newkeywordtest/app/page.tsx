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

  useEffect(() => {
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
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
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

  if (loading) return <div className="p-8 text-center text-gray-500">Loading keywords...</div>;

  const allSelected = filteredKeywords.length > 0 && selectedIds.size === filteredKeywords.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < filteredKeywords.length;

  return (
    <main className="min-h-screen p-4 bg-gray-100 font-sans">
      <div className="w-full">
        <header className="mb-6 sticky top-0 bg-gray-100 py-4 z-10 flex flex-col sm:flex-row justify-between items-center border-b border-gray-300">
            <h1 className="text-2xl font-bold text-gray-800 mb-2 sm:mb-0">
              Korean History Keywords ({filteredKeywords.length})
              {selectedIds.size > 0 && <span className="text-blue-600 ml-2">({selectedIds.size} selected)</span>}
            </h1>
            
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
