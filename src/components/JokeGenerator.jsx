import React, { useState, useCallback } from 'react';
import { RefreshCw, Loader } from 'lucide-react';

const JokeGenerator = () => {
  const [joke, setJoke] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [jokeType, setJokeType] = useState('any');

  const fetchJoke = useCallback(async () => {
    setLoading(true);
    setError(null);
    setJoke(null);

    try {
      const url = jokeType === 'any'
        ? 'https://v2.jokeapi.dev/joke/Any'
        : `https://v2.jokeapi.dev/joke/${jokeType}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch joke');
      }

      const data = await response.json();

      if (data.type === 'single') {
        setJoke(data.joke);
      } else if (data.type === 'twopart') {
        setJoke(`${data.setup}\n\n${data.delivery}`);
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [jokeType]);

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-gradient-to-br from-dark-card to-dark-bg border border-dark-border rounded-xl shadow-lg">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">😂 Joke Generator</h2>
        <p className="text-gray-400 text-sm">Take a break and enjoy a random joke</p>
      </div>

      {/* Controls */}
      <div className="mb-6 flex gap-3 flex-wrap items-center">
        <select
          value={jokeType}
          onChange={(e) => setJokeType(e.target.value)}
          disabled={loading}
          className="px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white text-sm focus:outline-none focus:border-accent disabled:opacity-50"
        >
          <option value="any">Any Joke</option>
          <option value="General">General</option>
          <option value="Knock-Knock">Knock-Knock</option>
          <option value="Programming">Programming</option>
          <option value="Dark">Dark</option>
          <option value="Spooky">Spooky</option>
          <option value="Christmas">Christmas</option>
        </select>

        <button
          onClick={fetchJoke}
          disabled={loading}
          className="px-6 py-2 bg-accent hover:bg-accent-hover text-white font-medium rounded-lg transition-colors duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader size={16} className="animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <RefreshCw size={16} />
              Get Joke
            </>
          )}
        </button>
      </div>

      {/* Joke Display */}
      <div className="min-h-32 p-6 bg-dark-bg border border-dark-border rounded-lg">
        {error && (
          <div className="text-error text-center">
            <p className="font-medium">⚠️ Error</p>
            <p className="text-sm mt-2">{error}</p>
          </div>
        )}

        {joke && (
          <div className="text-white text-center">
            <p className="text-lg leading-relaxed whitespace-pre-line">{joke}</p>
          </div>
        )}

        {!joke && !error && (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p className="text-center">
              {loading ? 'Loading your joke...' : 'Click "Get Joke" to generate a random joke'}
            </p>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        <p>Powered by JokeAPI • Click the button to refresh</p>
      </div>
    </div>
  );
};

export default JokeGenerator;
