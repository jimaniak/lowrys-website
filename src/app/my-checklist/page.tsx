// src/app/my-checklist/page.tsx
'use client';

import { useState } from 'react';

const initialChecklist = [
  { id: 1, text: 'Master advanced SQL for analytics', done: false, target: '2025-09' },
  { id: 2, text: 'Build a Tableau dashboard from scratch', done: false, target: '2025-12' },
  { id: 3, text: 'Publish a Power BI community template', done: false, target: '2025-10' },
  { id: 4, text: 'Learn Google Data Studio basics', done: false, target: '2025-08' },
  { id: 5, text: 'Complete a data storytelling course', done: false, target: '2025-11' },
];

export default function MyChecklist() {
  const [passcode, setPasscode] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [checklist, setChecklist] = useState(initialChecklist);
  const [error, setError] = useState('');

  // Simple passcode for owner-only access (set your own secret in production)
  const SECRET = process.env.NEXT_PUBLIC_CHECKLIST_SECRET || 'letmein';

  function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    if (passcode === SECRET) {
      setAuthenticated(true);
      setError('');
    } else {
      setError('Incorrect passcode.');
    }
  }

  function toggleDone(id: number) {
    setChecklist(list => list.map(item => item.id === id ? { ...item, done: !item.done } : item));
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-xl">
        <h1 className="text-3xl font-bold mb-6 text-blue-700">Private Career & Education Checklist</h1>
        {!authenticated ? (
          <form onSubmit={handleAuth} className="bg-white p-6 rounded-lg shadow-md mb-6">
            <label className="block mb-2 font-semibold">Enter Owner Passcode:</label>
            <input
              type="password"
              value={passcode}
              onChange={e => setPasscode(e.target.value)}
              className="border px-3 py-2 rounded w-full mb-2"
              autoFocus
            />
            {error && <div className="text-red-600 mb-2">{error}</div>}
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Access Checklist</button>
          </form>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <ul className="space-y-4">
              {checklist.map(item => (
                <li key={item.id} className="flex items-center justify-between">
                  <div>
                    <input
                      type="checkbox"
                      checked={item.done}
                      onChange={() => toggleDone(item.id)}
                      className="mr-3"
                    />
                    <span className={item.done ? 'line-through text-gray-400' : ''}>{item.text}</span>
                    <span className="ml-2 text-xs text-gray-500">(Target: {item.target})</span>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-6 text-sm text-gray-500">* Only visible to the owner. Progress is not persisted after refresh (demo version).</div>
          </div>
        )}
      </div>
    </main>
  );
}
