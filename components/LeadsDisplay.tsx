import React, { useState, useMemo } from 'react';
import { Lead, Source } from '../types';
import { exportLeadsToCSV } from '../utils/csvExporter';
import { DownloadIcon } from './icons/DownloadIcon';
import { LinkIcon } from './icons/LinkIcon';
import { CloseIcon } from './icons/CloseIcon';

interface LeadsDisplayProps {
  leads: Lead[];
  sources: Source[];
}

const FilterInput: React.FC<{
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  placeholder: string;
}> = ({ label, value, onChange, onClear, placeholder }) => {
  const isActive = value.length > 0;

  return (
    <div className="relative">
      <label htmlFor={`filter-${label}`} className="sr-only">{label}</label>
      <input
        type="text"
        id={`filter-${label}`}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full bg-gray-800 border rounded-md shadow-sm py-2 pl-3 pr-10 text-light-text focus:outline-none focus:ring-2 focus:ring-brand-primary transition duration-150 ${isActive ? 'border-brand-primary/50' : 'border-dark-border'}`}
        aria-label={label}
      />
      {isActive && (
        <button
          onClick={onClear}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-medium-text hover:text-light-text transition-colors"
          aria-label={`Clear ${label}`}
        >
          <CloseIcon className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

const FilterSelect: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; children: React.ReactNode }> = ({ label, value, onChange, children }) => {
    const isActive = value !== 'all';
    return (
        <div>
            <label htmlFor={`filter-${label}`} className="sr-only">{label}</label>
            <select
                id={`filter-${label}`}
                value={value}
                onChange={onChange}
                className={`w-full bg-gray-800 border rounded-md shadow-sm py-2 px-3 text-light-text focus:outline-none focus:ring-2 focus:ring-brand-primary transition duration-150 ${isActive ? 'border-brand-primary/50' : 'border-dark-border'}`}
                aria-label={label}
            >
                {children}
            </select>
        </div>
    );
};


const LeadsDisplay: React.FC<LeadsDisplayProps> = ({ leads, sources }) => {
  const [filterCity, setFilterCity] = useState('');
  const [filterCountry, setFilterCountry] = useState('');
  const [websiteFilter, setWebsiteFilter] = useState('all'); // 'all', 'yes', 'no'
  const [emailFilter, setEmailFilter] = useState('all'); // 'all', 'yes', 'no'

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const address = lead.address.toLowerCase();
      // Case-insensitive matching
      const cityMatch = filterCity ? address.includes(filterCity.toLowerCase()) : true;
      const countryMatch = filterCountry ? address.includes(filterCountry.toLowerCase()) : true;
      
      const websiteMatch = (() => {
        if (websiteFilter === 'yes') return !!lead.website;
        if (websiteFilter === 'no') return !lead.website;
        return true; // 'all'
      })();
      
      const emailMatch = (() => {
        if (emailFilter === 'yes') return !!lead.email;
        if (emailFilter === 'no') return !lead.email;
        return true; // 'all'
      })();

      return cityMatch && countryMatch && websiteMatch && emailMatch;
    });
  }, [leads, filterCity, filterCountry, websiteFilter, emailFilter]);


  const handleExport = () => {
    exportLeadsToCSV(filteredLeads, 'generated_leads.csv');
  };

  return (
    <div className="space-y-8">
      <div className="bg-dark-card shadow-lg rounded-xl border border-dark-border overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-dark-border">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <h2 className="text-xl font-bold text-light-text">Generated Leads ({filteredLeads.length})</h2>
            <button
              onClick={handleExport}
              disabled={filteredLeads.length === 0}
              className="flex items-center bg-brand-secondary hover:bg-brand-secondary/90 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-card focus:ring-purple-500"
            >
              <DownloadIcon className="w-5 h-5 mr-2" />
              Export to CSV
            </button>
          </div>
           <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
               <FilterInput
                 label="Filter by City"
                 value={filterCity}
                 onChange={(e) => setFilterCity(e.target.value)}
                 onClear={() => setFilterCity('')}
                 placeholder="Filter by city..."
               />
               <FilterInput
                 label="Filter by Country"
                 value={filterCountry}
                 onChange={(e) => setFilterCountry(e.target.value)}
                 onClear={() => setFilterCountry('')}
                 placeholder="Filter by country..."
               />
               <FilterSelect
                 label="Filter by Website"
                 value={websiteFilter}
                 onChange={(e) => setWebsiteFilter(e.target.value)}
               >
                 <option value="all">Website (All)</option>
                 <option value="yes">Has Website</option>
                 <option value="no">No Website</option>
               </FilterSelect>
                <FilterSelect
                 label="Filter by Email"
                 value={emailFilter}
                 onChange={(e) => setEmailFilter(e.target.value)}
               >
                 <option value="all">Email (All)</option>
                 <option value="yes">Has Email</option>
                 <option value="no">No Email</option>
               </FilterSelect>
            </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-dark-border">
            <thead className="bg-gray-800/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-medium-text uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-medium-text uppercase tracking-wider">Address</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-medium-text uppercase tracking-wider">Contact</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-medium-text uppercase tracking-wider">Website</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-medium-text uppercase tracking-wider">Business Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-medium-text uppercase tracking-wider">Employees</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-medium-text uppercase tracking-wider">Revenue</th>
              </tr>
            </thead>
            <tbody className="bg-dark-card divide-y divide-dark-border">
              {filteredLeads.length > 0 ? (
                 filteredLeads.map((lead, index) => (
                  <tr key={index} className="hover:bg-gray-800/60 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-light-text">{lead.name || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-normal text-sm text-medium-text max-w-xs">{lead.address || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-medium-text">
                      <div>{lead.phone || 'N/A'}</div>
                      {lead.email && <a href={`mailto:${lead.email}`} className="text-brand-primary/80 hover:text-brand-primary">{lead.email}</a>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {lead.website ? (
                        <a href={lead.website.startsWith('http') ? lead.website : `//${lead.website}`} target="_blank" rel="noopener noreferrer" className="text-brand-primary/80 hover:text-brand-primary font-medium">
                          Visit Website
                        </a>
                      ) : (
                        <span className="text-medium-text">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-medium-text">{lead.businessType || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-medium-text">{lead.employeeCount || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-medium-text">{lead.annualRevenue || 'N/A'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                    <td colSpan={7} className="text-center py-12 px-6 text-medium-text">
                        <p className="font-semibold text-lg">No Results Found</p>
                        <p className="text-sm">{leads.length > 0 ? 'Try adjusting your filters.' : 'Generate new leads to get started.'}</p>
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {sources.length > 0 && (
         <div className="bg-dark-card shadow-lg rounded-xl border border-dark-border p-4 sm:p-6">
            <h3 className="text-lg font-bold text-light-text mb-4">Sources</h3>
            <ul className="space-y-2">
                {sources.map((source, index) => (
                    <li key={index} className="flex items-start">
                        <LinkIcon className="w-4 h-4 mr-3 mt-1 text-medium-text flex-shrink-0" />
                        <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-brand-primary/80 hover:text-brand-primary text-sm break-all" title={source.title}>
                           {source.title || source.uri}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
      )}

    </div>
  );
};

export default LeadsDisplay;