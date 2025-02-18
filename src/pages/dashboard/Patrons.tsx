import React, { useState, useEffect } from 'react';
import { 
  Search, 
  SlidersHorizontal, 
  ChevronDown, 
  ChevronUp,
  ArrowUpDown,
  Download,
  Loader2,
  Users
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import PatronDetailsModal from '../../components/PatronDetailsModal';

interface Patron {
  id: string;
  full_name: string;
  email: string;
  image_url: string;
  status: string;
  pledge_relationship_start: string;
  lifetime_support_cents: number;
  url: string;
  social_connections: Record<string, any>;
  campaign: {
    creation_name: string;
    image_url: string | null;
    image_small_url: string | null;
  };
  patron_tiers: Array<{
    tier: {
      title: string;
      amount_cents: number;
      description: string;
      benefits: Array<{ title: string }>;
    };
  }>;
}

interface Filter {
  minAmount: number;
  maxAmount: number;
  startDate: string;
  endDate: string;
  status: string;
  campaign: string;
}

interface SortConfig {
  key: keyof Patron | 'patron_tiers.amount_cents' | 'pledge_relationship_start';
  direction: 'asc' | 'desc';
}

export default function Patrons() {
  const [patrons, setPatrons] = useState<Patron[]>([]);
  const [filteredPatrons, setFilteredPatrons] = useState<Patron[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedPatron, setSelectedPatron] = useState<Patron | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'patron_tiers.amount_cents',
    direction: 'desc'
  });
  const [filters, setFilters] = useState<Filter>({
    minAmount: 0,
    maxAmount: 1000,
    startDate: '',
    endDate: '',
    status: 'all',
    campaign: 'all'
  });

  useEffect(() => {
    fetchPatrons();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [patrons, searchQuery, filters, sortConfig]);

  const fetchPatrons = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('patrons')
        .select(`
          id,
          full_name,
          email,
          image_url,
          status,
          pledge_relationship_start,
          lifetime_support_cents,
          url,
          social_connections,
          patreon_campaigns (
            creation_name,
            image_url,
            image_small_url
          ),
          patron_tiers (
            tier_id,
            patreon_tiers (
              title,
              amount_cents,
              description,
              benefits
            )
          )
        `);

      if (error) throw error;

      const formattedPatrons = data.map(patron => ({
        ...patron,
        campaign: patron.patreon_campaigns,
        patron_tiers: patron.patron_tiers.map((pt: any) => ({
          tier: pt.patreon_tiers
        }))
      }));

      setPatrons(formattedPatrons);
      setFilteredPatrons(formattedPatrons);
    } catch (err) {
      console.error('Error fetching patrons:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch patrons');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...patrons];

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(patron => 
        patron.full_name.toLowerCase().includes(query) ||
        patron.email.toLowerCase().includes(query)
      );
    }

    // Apply filters
    result = result.filter(patron => {
      const amount = patron.patron_tiers[0]?.tier.amount_cents / 100 || 0;
      const joinDate = new Date(patron.pledge_relationship_start);
      
      return (
        amount >= filters.minAmount &&
        amount <= filters.maxAmount &&
        (filters.startDate === '' || joinDate >= new Date(filters.startDate)) &&
        (filters.endDate === '' || joinDate <= new Date(filters.endDate)) &&
        (filters.status === 'all' || patron.status === filters.status) &&
        (filters.campaign === 'all' || patron.campaign.creation_name === filters.campaign)
      );
    });

    // Apply sorting
    result.sort((a, b) => {
      let aValue: any = a;
      let bValue: any = b;

      if (sortConfig.key === 'patron_tiers.amount_cents') {
        aValue = a.patron_tiers[0]?.tier.amount_cents || 0;
        bValue = b.patron_tiers[0]?.tier.amount_cents || 0;
      } else if (sortConfig.key.includes('.')) {
        const keys = sortConfig.key.split('.');
        aValue = a[keys[0] as keyof Patron]?.[keys[1]];
        bValue = b[keys[0] as keyof Patron]?.[keys[1]];
      } else {
        aValue = a[sortConfig.key as keyof Patron];
        bValue = b[sortConfig.key as keyof Patron];
      }

      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredPatrons(result);
    setCurrentPage(1);
  };

  const handleSort = (key: SortConfig['key']) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const exportData = () => {
    const csv = [
      ['Name', 'Email', 'Pledge Amount', 'Join Date', 'Status', 'Campaign'],
      ...filteredPatrons.map(patron => [
        patron.full_name,
        patron.email,
        `$${((patron.patron_tiers[0]?.tier.amount_cents || 0) / 100).toFixed(2)}`,
        new Date(patron.pledge_relationship_start).toLocaleDateString(),
        patron.status === 'active_patron' ? 'Active' : 'Declined',
        patron.campaign.creation_name
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'patrons.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const paginatedPatrons = filteredPatrons.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const totalPages = Math.ceil(filteredPatrons.length / pageSize);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="flex items-center gap-3 text-zinc-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading patrons...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] gap-4">
        <div className="text-red-500">{error}</div>
        <button
          onClick={fetchPatrons}
          className="px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Patrons</h1>
        <button
          onClick={exportData}
          className="px-4 py-2 bg-gradient-to-r from-[#f45d48] to-[#f17c67] text-white rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search patrons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-800 text-white rounded-lg pl-10 pr-4 py-2 border border-zinc-700 focus:outline-none focus:border-[#f45d48]"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
              showFilters 
                ? 'bg-[#f45d48] text-white' 
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-zinc-900 rounded-lg border border-zinc-800">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Pledge Amount
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minAmount}
                  onChange={(e) => setFilters({ ...filters, minAmount: Number(e.target.value) })}
                  className="w-full bg-zinc-800 text-white rounded-lg px-4 py-2 border border-zinc-700 focus:outline-none focus:border-[#f45d48]"
                />
                <span className="text-zinc-400">to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxAmount}
                  onChange={(e) => setFilters({ ...filters, maxAmount: Number(e.target.value) })}
                  className="w-full bg-zinc-800 text-white rounded-lg px-4 py-2 border border-zinc-700 focus:outline-none focus:border-[#f45d48]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Join Date
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  className="w-full bg-zinc-800 text-white rounded-lg px-4 py-2 border border-zinc-700 focus:outline-none focus:border-[#f45d48]"
                />
                <span className="text-zinc-400">to</span>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  className="w-full bg-zinc-800 text-white rounded-lg px-4 py-2 border border-zinc-700 focus:outline-none focus:border-[#f45d48]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full bg-zinc-800 text-white rounded-lg px-4 py-2 border border-zinc-700 focus:outline-none focus:border-[#f45d48]"
                >
                  <option value="all">All</option>
                  <option value="active_patron">Active</option>
                  <option value="declined_patron">Declined</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Campaign
                </label>
                <select
                  value={filters.campaign}
                  onChange={(e) => setFilters({ ...filters, campaign: e.target.value })}
                  className="w-full bg-zinc-800 text-white rounded-lg px-4 py-2 border border-zinc-700 focus:outline-none focus:border-[#f45d48]"
                >
                  <option value="all">All</option>
                  {Array.from(new Set(patrons.map(p => p.campaign.creation_name))).map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="px-6 py-4 text-left text-sm font-medium text-zinc-400">
                    <button
                      onClick={() => handleSort('full_name')}
                      className="flex items-center gap-2 hover:text-white"
                    >
                      Patron Name
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-zinc-400">
                    <button
                      onClick={() => handleSort('patron_tiers.amount_cents')}
                      className="flex items-center gap-2 hover:text-white"
                    >
                      Pledge Amount
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-zinc-400">
                    <button
                      onClick={() => handleSort('pledge_relationship_start')}
                      className="flex items-center gap-2 hover:text-white"
                    >
                      Join Date
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-zinc-400">
                    <button
                      onClick={() => handleSort('status')}
                      className="flex items-center gap-2 hover:text-white"
                    >
                      Status
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-zinc-400">Campaign</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPatrons.map((patron) => (
                  <tr
                    key={patron.id}
                    className="border-b border-zinc-800 hover:bg-zinc-800/50 cursor-pointer"
                    onClick={() => setSelectedPatron(patron)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={patron.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(patron.full_name)}&background=f45d48&color=fff`}
                          alt={patron.full_name}
                          className="w-8 h-8 rounded-full bg-zinc-800"
                        />
                        <div>
                          <div className="font-medium text-white">{patron.full_name}</div>
                          <div className="text-sm text-zinc-400">{patron.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white">
                      ${((patron.patron_tiers[0]?.tier.amount_cents || 0) / 100).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-white">
                      {new Date(patron.pledge_relationship_start).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        patron.status === 'active_patron'
                          ? 'bg-emerald-400/10 text-emerald-400'
                          : 'bg-red-400/10 text-red-400'
                      }`}>
                        {patron.status === 'active_patron' ? 'Active' : 'Declined'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-zinc-800 rounded-lg overflow-hidden flex items-center justify-center">
                          {patron.campaign.image_small_url ? (
                            <img
                              src={patron.campaign.image_small_url}
                              alt={patron.campaign.creation_name}
                              className="w-full h-full object-cover"
                            />
                          ) : patron.campaign.image_url ? (
                            <img
                              src={patron.campaign.image_url}
                              alt={patron.campaign.creation_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#f45d48] to-[#f17c67]">
                              <Users className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                        <span className="text-white">{patron.campaign.creation_name}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="bg-zinc-800 text-white rounded-lg px-3 py-2 border border-zinc-700 focus:outline-none focus:border-[#f45d48]"
              >
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={ 50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
              <span className="text-zinc-400">
                Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredPatrons.length)} of {filteredPatrons.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg disabled:opacity-50 disabled:hover:bg-transparent"
              >
                <ChevronUp className="w-5 h-5" />
              </button>
              <span className="text-zinc-400">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg disabled:opacity-50 disabled:hover:bg-transparent"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {selectedPatron && (
        <PatronDetailsModal
          patron={selectedPatron}
          onClose={() => setSelectedPatron(null)}
        />
      )}
    </div>
  );
}