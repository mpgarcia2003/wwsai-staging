import React, { useState, useEffect, useMemo } from 'react';
import { Search, ArrowLeft, Download, Table } from 'lucide-react';
import { getDynamicFabrics } from '../utils/storage';
import { getFabricUrl } from '../constants';
import { Fabric } from '../types';

interface PriceSheetProps {
  onNavigate: (page: string) => void;
}

const MULTIPLIERS: Record<string, number> = {
  'A': 0.7, 'B': 0.85, 'C': 1.0, 'D': 1.15, 'E': 1.3, 'F': 1.5, 'G': 1.7, 'I': 2.0
};

const PriceSheet: React.FC<PriceSheetProps> = ({ onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [fabrics, setFabrics] = useState<Fabric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getDynamicFabrics();
        setFabrics(data);
      } catch (e) {
        console.error("Price sheet load failed", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredFabrics = useMemo(() => fabrics.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    f.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.priceGroup.toLowerCase().includes(searchTerm.toLowerCase())
  ), [fabrics, searchTerm]);

  const downloadCSV = () => {
    const headers = ['ID', 'Fabric Name', 'Category', 'Standard Price Group', 'Standard Multiplier', 'Specialty Pricing Model'];
    const rows = filteredFabrics.map(f => [
      f.id,
      f.name,
      f.category,
      f.priceGroup,
      MULTIPLIERS[f.priceGroup] || 1.15,
      'Specialty Flat Grid (Size Based)'
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "wws_fabric_price_sheet.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 font-sans">
      <div className="max-w-7xl mx-auto px-6 py-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <button 
              onClick={() => onNavigate('home')} 
              className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-2 text-sm font-bold"
            >
              <ArrowLeft size={16} /> Back to Home
            </button>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Table className="text-indigo-600" /> Master Price Sheet
            </h1>
            <p className="text-slate-500 mt-1">
              Configuration for {fabrics.length} active fabrics.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search fabrics..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 bg-white"
              />
            </div>
            <button 
              onClick={downloadCSV}
              className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors shadow-sm"
            >
              <Download size={16} /> CSV
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
           <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-2 text-sm uppercase tracking-wide">Standard / Rectangle Pricing</h3>
              <p className="text-xs text-slate-500 mb-3">
                Price is calculated using the <strong>Base Grid</strong> × <strong>Group Multiplier</strong>.
              </p>
              <div className="flex flex-wrap gap-2">
                 {Object.entries(MULTIPLIERS).map(([group, mult]) => (
                    <span key={group} className="text-xs border border-gray-200 rounded px-2 py-1 bg-gray-50">
                       <strong>Group {group}:</strong> {mult}x
                    </span>
                 ))}
              </div>
           </div>
           
           <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-2 text-sm uppercase tracking-wide">Specialty Shape Pricing</h3>
              <p className="text-xs text-slate-500">
                All specialty shapes (Triangles, Trapezoids, etc.) use a fixed <strong>Specialty Price Grid</strong> based solely on dimensions. 
                <br/><br/>
                The Fabric Price Group <strong>does not</strong> affect the price of Specialty shapes in the current pricing model.
              </p>
           </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium text-xs uppercase tracking-wider">
                <tr>
                  <th className="p-4 w-20">Swatch</th>
                  <th className="p-4">Fabric Details</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Standard Group</th>
                  <th className="p-4">Specialty Pricing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-gray-400">Loading master price list...</td>
                  </tr>
                ) : filteredFabrics.map((fabric) => (
                  <tr key={fabric.id} className="hover:bg-gray-50">
                    <td className="p-4">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden">
                        <img 
                          src={getFabricUrl(fabric.cloudinaryId, 'thumb')} 
                          alt={fabric.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{fabric.name}</div>
                      <div className="text-xs text-gray-400 font-mono mt-0.5">{fabric.id}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        fabric.category === 'Blackout' 
                          ? 'bg-slate-900 text-white' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {fabric.category}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold border border-indigo-100">
                          {fabric.priceGroup}
                        </span>
                        <span className="text-xs text-slate-500">
                          ({MULTIPLIERS[fabric.priceGroup]}x Base)
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-xs font-medium text-slate-500 bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200">
                        High-Value Grid (Flat)
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!loading && filteredFabrics.length === 0 && (
             <div className="p-12 text-center text-gray-400">
                No fabrics found matching your search.
             </div>
          )}
        </div>
        
        <div className="text-center text-xs text-slate-400 mt-8 mb-4">
           Generated from system constants.ts • {filteredFabrics.length} Records
        </div>

      </div>
    </div>
  );
};

export default PriceSheet;