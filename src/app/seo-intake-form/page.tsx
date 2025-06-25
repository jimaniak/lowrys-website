'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { INDUSTRY_CONFIGS, IndustryType } from './types';

interface Occupation {
  name: string;
  category: string;
  code: string;
  slug: string;
}

interface IndustrySearchProps {
  onIndustrySelect: (industry: string) => void;
  selectedIndustry: string;
}

function IndustrySearch({ onIndustrySelect, selectedIndustry }: IndustrySearchProps) {
  const [query, setQuery] = useState(selectedIndustry);
  const [suggestions, setSuggestions] = useState<Occupation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchOccupations = async () => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/search-occupations?q=${encodeURIComponent(query)}&limit=20`);
        if (response.ok) {
          const data = await response.json();
          // Remove duplicates by occupation name and limit to 10 results
          const uniqueOccupations = data.occupations?.reduce((acc: Occupation[], current: Occupation) => {
            const isDuplicate = acc.some(item => item.name === current.name);
            if (!isDuplicate) {
              acc.push(current);
            }
            return acc;
          }, []).slice(0, 10) || [];
          
          setSuggestions(uniqueOccupations);
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error('Error searching occupations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimeout = setTimeout(searchOccupations, 300);
    return () => clearTimeout(debounceTimeout);
  }, [query]);

  const handleSelectOccupation = (occupation: Occupation) => {
    setQuery(occupation.name);
    onIndustrySelect(occupation.name);
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  return (
    <div ref={searchRef} className="relative">
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => query.length >= 2 && setShowSuggestions(true)}
        placeholder="Search for your business type (e.g., pest control, HVAC, plumbing...)"
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        autoComplete="off"
      />
      
      {isLoading && (
        <div className="absolute right-3 top-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
        </div>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((occupation) => (
            <button
              key={occupation.code}
              onClick={() => handleSelectOccupation(occupation)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
            >
              <div className="font-medium text-gray-900">{occupation.name}</div>
              <div className="text-sm text-gray-500">{occupation.category}</div>
            </button>
          ))}
        </div>
      )}

      {showSuggestions && query.length >= 2 && suggestions.length === 0 && !isLoading && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
          <div className="px-4 py-3 text-gray-500">
            No matching industries found. Try a different search term.
          </div>
        </div>
      )}
    </div>
  );
}

export default function SEOIntakeLanding() {
  const [selectedIndustry, setSelectedIndustry] = useState<string>('');

  // Featured industries (most common clients)
  const featuredIndustries = ['pest-control', 'hvac', 'plumbing'] as IndustryType[];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            SEO Intake Form
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Get a customized SEO strategy for your business. Choose your industry below to get started.
          </p>
        </div>

        {/* Featured Industries */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Popular Industries</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredIndustries.map((key) => {
              const config = INDUSTRY_CONFIGS[key];
              return (
                <Link 
                  key={key} 
                  href={`/seo-intake-form/${key}`}
                  className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 p-8 border border-gray-100"
                >
                  <div className="text-center">
                    {/* Industry Icon */}
                    <div className="w-16 h-16 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      {key === 'pest-control' && (
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                      {key === 'hvac' && (
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      )}
                      {key === 'plumbing' && (
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                      )}
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                      {config.name}
                    </h3>
                    
                    <p className="text-gray-600 mb-6">
                      Specialized intake form designed for {config.name.toLowerCase()} companies with 
                      industry-specific questions and service options.
                    </p>
                    
                    <div className="inline-flex items-center text-blue-600 font-semibold group-hover:text-blue-700">
                      Start Intake Form
                      <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

      {/* Industry Search */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
          Or Search Your Industry
        </h2>
        <p className="text-gray-600 text-center mb-6">
          Search from hundreds of business categories based on Bureau of Labor Statistics data
        </p>
        
        <div className="max-w-md mx-auto">
          <IndustrySearch 
            onIndustrySelect={setSelectedIndustry}
            selectedIndustry={selectedIndustry}
          />
          
          {selectedIndustry && (
            <div className="mt-4 text-center">
              <Link
                href={`/seo-intake-form/general?industry=${encodeURIComponent(selectedIndustry)}`}
                className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Start Form for {selectedIndustry}
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Contact Info */}
      <div className="bg-white rounded-xl shadow-lg p-8 text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Need Help Choosing?
        </h2>
        <p className="text-gray-600 mb-6">
          Not sure which form is right for you? Give us a call and we'll help you get started.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a 
            href="tel:636-237-1341" 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Call for Consultation
          </a>
          <a 
            href="mailto:business@lowrys.org" 
            className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            Email business@lowrys.org
          </a>
        </div>
      </div>

      {/* General Form Option */}
      <div className="text-center">
        <p className="text-gray-600 mb-4">
          Need a completely custom approach?
        </p>
        <Link 
          href="/seo-intake-form/general"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold"
        >
          Use General Intake Form
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  </div>
  );
}
