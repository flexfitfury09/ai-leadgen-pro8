import React, { useState, useCallback, useEffect } from 'react';
import { Lead, Source } from './types';
import { generateLeads } from './services/geminiService';
import LeadGenerationForm from './components/LeadGenerationForm';
import LeadsDisplay from './components/LeadsDisplay';
import { LogoIcon } from './components/icons/LogoIcon';

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [niche, setNiche] = useState<string>('coffee shops');
  const [city, setCity] = useState<string>('San Francisco');
  const [country, setCountry] = useState<string>('USA');
  const [numberOfLeads, setNumberOfLeads] = useState<number>(10);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedApiKey = localStorage.getItem('gemini_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  const handleApiKeyChange = (key: string) => {
    setApiKey(key);
    localStorage.setItem('gemini_api_key', key);
  };

  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    if (!apiKey) {
      setError('Please enter your Gemini API Key to generate leads.');
      return;
    }
    if (!niche || !city || !country) {
      setError('Please fill in all search fields.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setLeads([]);
    setSources([]);

    try {
      const result = await generateLeads(niche, city, country, numberOfLeads, apiKey);
      if (result.leads.length === 0) {
        setError("No leads found. Try broadening your search criteria.");
      }
      setLeads(result.leads);
      setSources(result.sources);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [niche, city, country, numberOfLeads, apiKey]);

  return (
    <div className="min-h-screen bg-dark-bg text-light-text font-sans">
      <div className="container mx-auto px-4 py-8">
        <header className="flex items-center justify-center mb-8">
          <LogoIcon className="w-12 h-12 text-brand-primary" />
          <h1 className="text-4xl font-bold ml-4 bg-gradient-to-r from-brand-primary to-brand-secondary text-transparent bg-clip-text">
            AI Lead Generation
          </h1>
        </header>

        <main>
          <div className="bg-dark-card shadow-lg rounded-xl p-6 md:p-8 border border-dark-border mb-8">
            <LeadGenerationForm
              apiKey={apiKey}
              onApiKeyChange={handleApiKeyChange}
              niche={niche}
              setNiche={setNiche}
              city={city}
              setCity={setCity}
              country={country}
              setCountry={setCountry}
              numberOfLeads={numberOfLeads}
              setNumberOfLeads={setNumberOfLeads}
              isLoading={isLoading}
              onSubmit={handleSubmit}
            />
          </div>

          {isLoading && (
            <div className="flex flex-col items-center justify-center text-center p-8">
               <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-brand-primary"></div>
               <p className="mt-4 text-lg text-medium-text">AI is searching for leads...</p>
               <p className="text-sm text-medium-text/70">This may take a moment.</p>
            </div>
          )}

          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-center" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          {!isLoading && leads.length > 0 && (
            <LeadsDisplay leads={leads} sources={sources} />
          )}

        </main>
      </div>
    </div>
  );
};

export default App;