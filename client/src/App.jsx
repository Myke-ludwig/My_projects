import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  doc, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';

export default function App() {
  const [bounties, setBounties] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Pothole');
  const [loading, setLoading] = useState(false);

  const bountiesCollectionRef = collection(db, 'bounties');

  useEffect(() => {
    fetchBounties();
  }, []);

  async function fetchBounties() {
    try {
      const q = query(bountiesCollectionRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((docSnapshot) => ({
        ...docSnapshot.data(),
        id: docSnapshot.id,
      }));
      setBounties(data);
    } catch (error) {
      console.error('Error fetching bounties:', error);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    // Dynamic coordinates centered around Accra for testing geotags
    const lat = 5.6037 + (Math.random() - 0.5) * 0.04;
    const lng = -0.1870 + (Math.random() - 0.5) * 0.04;

    try {
      await addDoc(bountiesCollectionRef, {
        title,
        description,
        category,
        latitude: lat,
        longitude: lng,
        status: 'OPEN',
        createdAt: serverTimestamp(),
      });
      setTitle('');
      setDescription('');
      await fetchBounties();
    } catch (error) {
      console.error('Error adding bounty:', error);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id, newStatus) {
    try {
      const bountyDoc = doc(db, 'bounties', id);
      await updateDoc(bountyDoc, { status: newStatus });
      await fetchBounties();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8 font-sans">
      <header className="max-w-4xl mx-auto mb-8 text-center border-b border-slate-800 pb-6">
        <h1 className="text-3xl md:text-5xl font-black text-indigo-400 tracking-tight">
          🛡️ CIVIC BOUNTY BOARD
        </h1>
        <p className="text-slate-400 mt-2 text-sm md:text-base">
          Claim community contracts, repair local infrastructure, track real-time resolution.
        </p>
      </header>

      <main className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Report Form */}
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl h-fit md:col-span-1">
          <h2 className="text-xl font-extrabold mb-4 text-white">Post New Bounty</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Contract Title
              </label>
              <input 
                type="text" 
                required 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm" 
                placeholder="e.g. Open Sewer Line on Main Rd"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Category
              </label>
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white outline-none text-sm"
              >
                <option>Pothole</option>
                <option>Broken Streetlight</option>
                <option>Public Safety</option>
                <option>Illegal Dumping</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Hazard Details
              </label>
              <textarea 
                required 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm" 
                rows="3"
                placeholder="Exact location notes and severity..."
              ></textarea>
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white font-bold py-3 rounded-lg transition shadow-lg text-sm"
            >
              {loading ? 'Publishing Contract...' : 'Publish Bounty'}
            </button>
          </form>
        </div>

        {/* Contract Feed */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-extrabold text-white">Active Contracts ({bounties.length})</h2>
          </div>

          {bounties.length === 0 ? (
            <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700 text-center text-slate-400">
              No active bounties posted yet. Create one using the form!
            </div>
          ) : (
            bounties.map((b) => (
              <div key={b.id} className="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-lg transition hover:border-slate-600">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 bg-slate-900 rounded-md text-indigo-300 border border-slate-700">
                    {b.category}
                  </span>
                  <span className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full ${
                    b.status === 'OPEN' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                    b.status === 'CLAIMED' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}>
                    {b.status}
                  </span>
                </div>
                <h3 className="text-lg font-extrabold text-white">{b.title}</h3>
                <p className="text-sm text-slate-300 mt-1 leading-relaxed">{b.description}</p>

                <div className="mt-4 pt-3 border-t border-slate-700/60 flex flex-wrap justify-between items-center gap-2">
                  <span className="text-xs text-slate-400 font-mono">
                    📍 Geotag: {b.latitude?.toFixed(4)}, {b.longitude?.toFixed(4)}
                  </span>
                  <div className="space-x-2">
                    {b.status === 'OPEN' && (
                      <button 
                        onClick={() => updateStatus(b.id, 'CLAIMED')}
                        className="text-xs bg-amber-600 hover:bg-amber-500 text-white font-bold px-3 py-1.5 rounded-lg transition"
                      >
                        Claim Contract
                      </button>
                    )}
                    {b.status === 'CLAIMED' && (
                      <button 
                        onClick={() => updateStatus(b.id, 'RESOLVED')}
                        className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg transition"
                      >
                        Mark Resolved
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}