import React from 'react';
import JokeGenerator from '../components/JokeGenerator';

const JokeGeneratorPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-bg via-dark-card to-dark-bg">
      <div className="container mx-auto px-4 py-12">
        {/* Page Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-white mb-3">Study Break Zone</h1>
          <p className="text-gray-400 text-lg">When studying gets tough, take a laugh break! 🎉</p>
        </div>

        {/* Main Content */}
        <JokeGenerator />

        {/* Footer Info */}
        <div className="mt-16 p-6 bg-dark-card border border-dark-border rounded-lg text-center">
          <h3 className="text-white font-semibold mb-3">💡 Study Tips</h3>
          <ul className="text-gray-400 text-sm space-y-2 max-w-2xl mx-auto">
            <li>✓ Take a 5-minute break every 25 minutes of study (Pomodoro Technique)</li>
            <li>✓ Laughter boosts memory and cognitive function</li>
            <li>✓ A refreshed mind learns better than a stressed one</li>
            <li>✓ Use this generator to inject some fun into your study sessions</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default JokeGeneratorPage;
