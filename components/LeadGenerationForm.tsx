
import React from 'react';
import { SearchIcon } from './icons/SearchIcon';

interface LeadGenerationFormProps {
  niche: string;
  setNiche: (value: string) => void;
  city: string;
  setCity: (value: string) => void;
  country: string;
  setCountry: (value: string) => void;
  numberOfLeads: number;
  setNumberOfLeads: (value: number) => void;
  isLoading: boolean;
  onSubmit: (event: React.FormEvent) => void;
}

const InputField: React.FC<{ label: string; value: string | number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder: string; type?: string; min?: number; }> = ({ label, value, onChange, placeholder, type = "text", min }) => (
    <div className="flex-1 min-w-[180px]">
        <label htmlFor={label} className="block text-sm font-medium text-medium-text mb-2">{label}</label>
        <input
            type={type}
            id={label}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            min={min}
            className="w-full bg-gray-800 border border-dark-border rounded-md shadow-sm py-2 px-3 text-light-text focus:outline-none focus:ring-2 focus:ring-brand-primary transition duration-150"
        />
    </div>
);

const LeadGenerationForm: React.FC<LeadGenerationFormProps> = ({
  niche,
  setNiche,
  city,
  setCity,
  country,
  setCountry,
  numberOfLeads,
  setNumberOfLeads,
  isLoading,
  onSubmit,
}) => {
  return (
    <form onSubmit={onSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <InputField 
            label="Niche / Industry"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            placeholder="e.g., plumbers, dentists"
        />
        <InputField 
            label="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g., New York"
        />
        <InputField 
            label="Country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="e.g., USA"
        />
         <InputField
            label="Number of Leads"
            value={numberOfLeads}
            onChange={(e) => setNumberOfLeads(Math.max(1, parseInt(e.target.value, 10) || 1))}
            placeholder="e.g., 10"
            type="number"
            min={1}
        />
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center bg-brand-primary hover:bg-brand-primary/90 disabled:bg-gray-500 text-white font-bold py-3 px-4 rounded-md transition-transform transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-card focus:ring-brand-secondary"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating...
          </>
        ) : (
          <>
            <SearchIcon className="w-5 h-5 mr-2" />
            Generate Leads
          </>
        )}
      </button>
    </form>
  );
};

export default LeadGenerationForm;
