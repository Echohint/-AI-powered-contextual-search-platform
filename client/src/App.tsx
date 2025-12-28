
import { useState } from 'react';
import { Search, Sparkles, ShoppingBag, Filter, ArrowRight } from 'lucide-react';
import { Button, Input } from './components/ui/form-elements';
import { ProductCard } from './components/ProductCard';
import './index.css';

interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  score: number;
  attributes?: Record<string, any>;
}

function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [ingesting, setIngesting] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [minPrice, setMinPrice] = useState<number>(0);


  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setHasSearched(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      let url = `${API_URL}/api/search?q=${encodeURIComponent(query)}`;
      if (selectedCategory) url += `&category=${encodeURIComponent(selectedCategory)}`;
      if (minPrice > 0) url += `&minPrice=${minPrice}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setResults(data.results || []);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleIngest = async () => {
    if (!confirm('This will ingest Lenskart sample data. Continue?')) return;
    setIngesting(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const res = await fetch(`${API_URL}/api/ingest`, { method: 'POST' });
      const data = await res.json();
      alert(data.message || 'Ingestion completed');
    } catch (e) {
      alert('Ingestion failed');
    } finally {
      setIngesting(false);
    }
  };

  // Re-run search when filters change (if already searched)
  // Note: In a real app we might debounce this or wait for apply button
  // For demo, we can just trigger it. But strictly React-wise, let's keep it simple.

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 font-sans selection:bg-cyan-500/30">
      {/* Navbar ... (kept same) */}
      <nav className="border-b border-slate-800/60 bg-[#0B0F19]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">Lenskart<span className="text-cyan-400">AI</span></span>
          </div>
          <div className="flex gap-4">
            <button onClick={handleIngest} disabled={ingesting} className="text-xs font-medium text-slate-400 hover:text-white transition-colors">
              {ingesting ? 'Ingesting...' : 'Reset Data'}
            </button>
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className={`transition-all duration-700 ease-out ${hasSearched ? 'mt-0 mb-12' : 'mt-20 mb-20 text-center'}`}>
          <h1 className={`font-bold tracking-tight mb-4 ${hasSearched ? 'text-2xl' : 'text-5xl md:text-7xl bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400'}`}>
            {hasSearched ? 'Search Results' : 'Find your perfect look.'}
          </h1>
          {!hasSearched && (
            <p className="text-lg text-slate-400 mb-12 max-w-2xl mx-auto">
              Experience intelligent search that understands style, context, and face shape.
            </p>
          )}

          <div className={`max-w-3xl mx-auto relative group ${!hasSearched && 'transform hover:scale-[1.01] transition-transform duration-300'}`}>
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <form onSubmit={handleSearch} className="relative flex gap-2 bg-[#0F1422] p-2 rounded-2xl border border-slate-800 shadow-2xl">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Describe what you're looking for... (e.g., 'Retro aviators for a beach trip')"
                  className="w-full bg-transparent h-12 pl-12 pr-4 outline-none text-slate-200 placeholder:text-slate-500"
                />
              </div>
              <Button type="submit" disabled={loading} className="rounded-xl px-8">
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </form>
          </div>

          {/* Suggested Chips */}
          {!hasSearched && (
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {['Running sunglasses', 'Blue light glasses for coding', 'Gold rimless frames', 'Contact lenses for dry eyes'].map((term) => (
                <button
                  key={term}
                  onClick={() => { setQuery(term); handleSearch(); }} /* Trigger search directly */
                  className="px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700 text-sm text-slate-400 hover:border-cyan-500/50 hover:text-cyan-400 transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content Area */}
        {hasSearched && (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <aside className="w-full lg:w-64 h-fit sticky top-24 space-y-8 hidden lg:block">
              <div>
                <div className="flex items-center gap-2 mb-4 text-cyan-400 font-semibold">
                  <Filter className="w-4 h-4" /> Filters
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-slate-300 mb-3">Price Range</h3>
                    <div className="h-1 bg-slate-800 rounded-full overflow-hidden mb-2">
                      {/* Simple visualization, real interactive slider would need more code */}
                      <div className="h-full bg-cyan-500 rounded-full" style={{ width: minPrice > 0 ? '50%' : '0%' }}></div>
                    </div>
                    <div className="flex gap-2">
                      {[0, 2000, 5000].map(p => (
                        <button
                          key={p}
                          onClick={() => { setMinPrice(p); handleSearch(); }}
                          className={`text-xs px-2 py-1 rounded border ${minPrice === p ? 'border-cyan-500 text-cyan-400' : 'border-slate-700 text-slate-500'}`}
                        >
                          {p === 0 ? 'All' : `>${p}`}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-slate-300 mb-3">Categories</h3>
                    <div className="space-y-2">
                      {['All', 'Sunglasses', 'Eyeglasses', 'Contact Lenses', 'Computer Glasses'].map(c => (
                        <label key={c}
                          onClick={() => { setSelectedCategory(c === 'All' ? '' : c); handleSearch(); }}
                          className={`flex items-center gap-3 text-sm cursor-pointer group ${selectedCategory === (c === 'All' ? '' : c) ? 'text-white' : 'text-slate-400'}`}
                        >
                          <div className={`w-4 h-4 rounded border transition-colors ${selectedCategory === (c === 'All' ? '' : c) ? 'bg-cyan-500 border-cyan-500' : 'border-slate-700 bg-slate-800 group-hover:border-cyan-500/50'}`}></div>
                          {c}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/20">
                <h4 className="font-semibold text-indigo-300 mb-2 text-sm">AI Insight</h4>
                <p className="text-xs text-indigo-200/70 leading-relaxed">
                  Click on "Why this result?" on any product to see why our AI matched it to your query.
                </p>
              </div>
            </aside>

            {/* Results Grid */}
            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((product) => (
                  <ProductCard key={product._id} product={product} searchQuery={query} />
                ))}
              </div>

              {results.length === 0 && !loading && (
                <div className="text-center py-20 border border-dashed border-slate-800 rounded-2xl">
                  <p className="text-slate-500">No products found matching your description.</p>
                  <Button
                    onClick={() => setQuery('')}
                    className="mt-4 text-cyan-400 bg-transparent hover:bg-slate-800"
                  >
                    Clear Search
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
