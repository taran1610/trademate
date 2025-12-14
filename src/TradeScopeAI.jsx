import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Upload, TrendingUp, TrendingDown, Minus, CheckCircle, XCircle, BarChart3, FileText, Settings, Calendar, LogOut, User } from 'lucide-react';
import { supabase, isSupabaseConfigured } from './lib/supabase.js';
import unifiedStorage from './lib/storage.js';
import Auth from './components/Auth.jsx';

const TradeScopeAI = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedSession, setSelectedSession] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [apiKey, setApiKey] = useState('');
  const [apiKeyStatus, setApiKeyStatus] = useState(null); // 'saving', 'saved', 'error', 'deleting'
  const [apiKeyMessage, setApiKeyMessage] = useState('');
  const [brokenImages, setBrokenImages] = useState(new Set()); // Track images that failed to load

  // Check auth state on mount and listen for changes
  useEffect(() => {
    if (isSupabaseConfigured()) {
      // Get initial session
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null);
        setLoading(false);
        if (session?.user) {
          loadSessions(session.user.id);
          loadUserEmail(session.user.id);
        } else {
          // Try loading from localStorage if no auth
          loadSessions();
          loadUserEmail();
        }
      });

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          loadSessions(session.user.id);
          loadUserEmail(session.user.id);
        } else {
          loadSessions();
          loadUserEmail();
        }
      });

      return () => subscription.unsubscribe();
    } else {
      // No Supabase, use localStorage only
      setLoading(false);
      loadSessions();
      loadUserEmail();
    }
  }, []);

  const loadSessions = async (userId = null) => {
    try {
      const loadedSessions = await unifiedStorage.loadSessions(userId);
      setSessions(loadedSessions);
    } catch (error) {
      console.error('Error loading sessions:', error);
      setSessions([]);
    }
  };

  const loadUserEmail = async (userId = null) => {
    try {
      const email = await unifiedStorage.loadUserEmail(userId);
      setUserEmail(email || '');
    } catch (error) {
      console.error('Error loading email:', error);
    }
  };

  const saveSession = async (session) => {
    const userId = user?.id || null;
    await unifiedStorage.saveSession(session, userId);
    await loadSessions(userId);
  };

  const saveUserEmail = async (email) => {
    try {
      // Validate email format
      if (!email || !email.includes('@')) {
        throw new Error('Please enter a valid email address');
      }
      
      const userId = user?.id || null;
      await unifiedStorage.saveUserEmail(email, userId);
      setUserEmail(email);
    } catch (error) {
      console.error('Error saving email:', error);
      alert('Error saving email: ' + error.message);
      throw error;
    }
  };

  const handleAuthChange = (newUser) => {
    setUser(newUser);
    if (newUser) {
      loadSessions(newUser.id);
      loadUserEmail(newUser.id);
    }
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured() && user) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSessions([]);
    setUserEmail('');
  };

  // Get API endpoint based on environment
  const getApiEndpoint = () => {
    const hostname = window.location.hostname;
    
    // Local development - use Vercel dev server endpoint
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return '/api/analyze';
    }
    
    // Production - detect platform
    // Netlify functions are at /.netlify/functions/analyze
    // Vercel functions are at /api/analyze
    // Try Vercel format first (most common)
    return '/api/analyze';
  };

  // Get user's auth token for API requests
  const getAuthToken = async () => {
    if (!isSupabaseConfigured() || !user) {
      return null;
    }
    
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  };

  // Check if user has API key configured
  const checkUserHasApiKey = async () => {
    if (!isSupabaseConfigured() || !user) {
      return false;
    }

    try {
      const token = await getAuthToken();
      if (!token) return false;

      // Check if key exists by trying to fetch it (we'll create a lightweight check endpoint)
      // For now, we'll check during the actual request
      return true; // Will be validated on server
    } catch (error) {
      return false;
    }
  };

  // AI Analysis Function - Now uses user's own API key (BYOK)
  const analyzeChart = async (imageData) => {
    const endpoint = getApiEndpoint();
    const token = await getAuthToken();
    
    if (!token) {
      throw new Error('Not authenticated. Please sign in.');
    }
    
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        imageData: imageData.base64,
        imageType: imageData.type
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || `API error: ${response.status}`;
      
      // If no API key error, redirect to settings
      if (errorMessage.includes('No API key on file') || errorMessage.includes('No API key')) {
        setCurrentView('settings');
        throw new Error('Please add your API key in Settings to use this feature.');
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data.analysis;
  };

  // Handle Image Upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check authentication first
    if (!user) {
      alert('Please sign in to upload charts.');
      return;
    }

    setIsAnalyzing(true);
    try {
      // Convert to base64
      const base64Data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const imageData = {
        base64: base64Data,
        type: file.type
      };

      // Create data URL for display (persists across page reloads)
      const dataUrl = `data:${file.type};base64,${base64Data}`;

      // Analyze with AI
      const analysis = await analyzeChart(imageData);

      // Extract bias from analysis
      const biasMatch = analysis.match(/BIAS:\s*\(?(Long|Short|Neutral)\)?/i);
      const bias = biasMatch ? biasMatch[1].toLowerCase() : 'neutral';

      // Create session
      const newSession = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        image: dataUrl, // Use data URL instead of blob URL for persistence
        imageData: base64Data,
        imageType: file.type,
        analysis: analysis,
        bias: bias,
        tradeTaken: null,
        tradeReason: '',
        tradeOutcome: null,
        notes: ''
      };

      await saveSession(newSession);
      setSelectedSession(newSession);
      setCurrentView('session');
    } catch (error) {
      console.error('Analysis error:', error);
      alert(`Error analyzing chart: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Trade Decision Handler
  const handleTradeDecision = async (sessionId, decision) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;

    const reason = prompt(`Why did you ${decision ? 'take' : 'skip'} this trade?`);
    if (reason === null) return;

    const updatedSession = {
      ...session,
      tradeTaken: decision,
      tradeReason: reason,
      decisionTimestamp: Date.now()
    };

    await saveSession(updatedSession);
    
    // Send email log
    if (userEmail) {
      try {
        await sendTradeLog(updatedSession);
        // Show success message
        alert(`✓ Trade decision saved!\n✓ Email sent to ${userEmail}`);
      } catch (error) {
        console.error('Error sending email:', error);
        // Still show success for saving, but warn about email
        alert(`✓ Trade decision saved!\n⚠ Email could not be sent. Check console for details.`);
      }
    } else {
      alert('✓ Trade decision saved!\n💡 Add your email in Settings to receive trade log emails');
    }
    
    setSelectedSession(updatedSession);
  };

  // Send Trade Log Email via API
  const sendTradeLog = async (session) => {
    if (!userEmail) return;

    try {
      const response = await fetch('/api/send-trade-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: userEmail,
          sessionData: session
        })
      });

      const data = await response.json();
      if (data.success) {
        console.log('Trade log email sent successfully');
      } else {
        console.warn('Email not sent:', data.message);
      }
    } catch (error) {
      console.error('Error sending trade email:', error);
      // Don't block the user - email is optional
    }
  };

  // Update Trade Outcome
  const updateTradeOutcome = async (sessionId, outcome) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;

    const updatedSession = {
      ...session,
      tradeOutcome: outcome,
      outcomeTimestamp: Date.now()
    };

    await saveSession(updatedSession);
    
    // Send email log for outcome update
    if (userEmail) {
      await sendTradeLog(updatedSession);
    }
    
    setSelectedSession(updatedSession);
  };

  // Calculate Statistics
  const calculateStats = () => {
    const filtered = filterSessions();
    const total = filtered.length;
    const taken = filtered.filter(s => s.tradeTaken === true).length;
    const skipped = filtered.filter(s => s.tradeTaken === false).length;
    const wins = filtered.filter(s => s.tradeOutcome === 'win').length;
    const losses = filtered.filter(s => s.tradeOutcome === 'loss').length;
    const winRate = wins + losses > 0 ? ((wins / (wins + losses)) * 100).toFixed(1) : 0;
    const biasAccuracy = {};

    ['long', 'short', 'neutral'].forEach(bias => {
      const biasTrades = filtered.filter(s => s.bias === bias && s.tradeOutcome);
      const biasWins = biasTrades.filter(s => s.tradeOutcome === 'win').length;
      biasAccuracy[bias] = biasTrades.length > 0 ? ((biasWins / biasTrades.length) * 100).toFixed(1) : 0;
    });

    return { total, taken, skipped, wins, losses, winRate, biasAccuracy };
  };

  const filterSessions = () => {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    
    switch (filterPeriod) {
      case 'day':
        return sessions.filter(s => now - s.timestamp < day);
      case 'week':
        return sessions.filter(s => now - s.timestamp < 7 * day);
      case 'month':
        return sessions.filter(s => now - s.timestamp < 30 * day);
      default:
        return sessions;
    }
  };

  // Performance Chart Data
  const getPerformanceData = () => {
    const filtered = filterSessions();
    const dataPoints = {};

    filtered.forEach(session => {
      if (session.tradeOutcome) {
        const date = new Date(session.timestamp).toLocaleDateString();
        if (!dataPoints[date]) {
          dataPoints[date] = { date, wins: 0, losses: 0 };
        }
        if (session.tradeOutcome === 'win') dataPoints[date].wins++;
        else if (session.tradeOutcome === 'loss') dataPoints[date].losses++;
      }
    });

    return Object.values(dataPoints).sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const stats = calculateStats();
  const performanceData = getPerformanceData();

  // Dashboard View
  const DashboardView = () => (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors">
        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Upload Trading Chart</h3>
          <p className="text-gray-600 mb-4">PNG, JPG, or SVG • 1m, 5m, or 15m timeframes</p>
          {!user ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 font-semibold">Please sign in to upload charts</p>
            </div>
          ) : (
            <label className="cursor-pointer inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
              {isAnalyzing ? 'Analyzing...' : 'Choose File'}
              <input 
                type="file" 
                accept="image/png,image/jpeg,image/svg+xml" 
                onChange={handleImageUpload}
                disabled={isAnalyzing}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Sessions" value={stats.total} icon={<FileText />} />
        <StatCard title="Trades Taken" value={stats.taken} icon={<CheckCircle />} color="green" />
        <StatCard title="Trades Skipped" value={stats.skipped} icon={<XCircle />} color="red" />
        <StatCard title="Win Rate" value={`${stats.winRate}%`} icon={<TrendingUp />} color="blue" />
      </div>

      {/* Recent Sessions */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4">Recent Analysis Sessions</h3>
        {sessions.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No sessions yet. Upload a chart to get started!</p>
        ) : (
          <div className="space-y-3">
            {sessions.slice(0, 5).map(session => (
              <div 
                key={session.id}
                onClick={() => {
                  setSelectedSession(session);
                  setCurrentView('session');
                }}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center space-x-4">
                  {brokenImages.has(session.id) ? (
                    <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                      No Image
                    </div>
                  ) : (
                    <img 
                      src={
                        session.imageData 
                          ? `data:${session.imageType || 'image/png'};base64,${session.imageData}`
                          : session.image && session.image.startsWith('data:')
                          ? session.image
                          : session.image || ''
                      } 
                      alt="Chart" 
                      className="w-16 h-16 object-cover rounded" 
                      onError={(e) => {
                        // Fallback: try to reconstruct from base64 if image URL fails
                        if (session.imageData && !e.target.src.startsWith('data:')) {
                          e.target.src = `data:${session.imageType || 'image/png'};base64,${session.imageData}`;
                        } else {
                          // No base64 data available - mark as broken
                          setBrokenImages(prev => new Set(prev).add(session.id));
                        }
                      }}
                    />
                  )}
                  <div>
                    <p className="font-semibold">{new Date(session.timestamp).toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Bias: {session.bias.toUpperCase()}</p>
                  </div>
                </div>
                <BiasIndicator bias={session.bias} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Performance Dashboard
  const PerformanceDashboard = () => (
    <div className="space-y-6">
      {/* Filter */}
      <div className="bg-white rounded-lg shadow-lg p-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Performance Analytics</h2>
        <div className="flex gap-2">
          {['all', 'day', 'week', 'month'].map(period => (
            <button
              key={period}
              onClick={() => setFilterPeriod(period)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterPeriod === period 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {period === 'all' ? 'All Time' : period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h4 className="text-gray-600 mb-2">Win/Loss Ratio</h4>
          <p className="text-3xl font-bold">{stats.wins}/{stats.losses}</p>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h4 className="text-gray-600 mb-2">Long Bias Accuracy</h4>
          <p className="text-3xl font-bold text-green-600">{stats.biasAccuracy.long}%</p>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h4 className="text-gray-600 mb-2">Short Bias Accuracy</h4>
          <p className="text-3xl font-bold text-red-600">{stats.biasAccuracy.short}%</p>
        </div>
      </div>

      {/* Performance Chart */}
      {performanceData.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">Performance Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="wins" stroke="#10b981" strokeWidth={2} />
              <Line type="monotone" dataKey="losses" stroke="#ef4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Trade Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">Trade Decisions</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Taken', value: stats.taken },
                  { name: 'Skipped', value: stats.skipped }
                ]}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label
              >
                <Cell fill="#10b981" />
                <Cell fill="#ef4444" />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">Bias Distribution</h3>
          <div className="space-y-3">
            {['long', 'short', 'neutral'].map(bias => {
              const count = filterSessions().filter(s => s.bias === bias).length;
              const percentage = stats.total > 0 ? ((count / stats.total) * 100).toFixed(1) : 0;
              return (
                <div key={bias}>
                  <div className="flex justify-between mb-1">
                    <span className="capitalize">{bias}</span>
                    <span>{count} ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        bias === 'long' ? 'bg-green-500' : 
                        bias === 'short' ? 'bg-red-500' : 'bg-gray-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  // Session Detail View
  const SessionView = () => {
    if (!selectedSession) return null;

    return (
      <div className="space-y-6">
        <button 
          onClick={() => setCurrentView('dashboard')}
          className="text-blue-600 hover:text-blue-700 mb-4"
        >
          ← Back to Dashboard
        </button>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart Image */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4">Chart Analysis</h3>
            {brokenImages.has(selectedSession.id) ? (
              <div className="w-full h-64 bg-gray-200 rounded-lg border flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <p className="font-semibold mb-2">Image Unavailable</p>
                  <p className="text-sm">This chart image is no longer available.</p>
                  <p className="text-xs mt-2 text-gray-400">Old sessions may lose images after page reload.</p>
                </div>
              </div>
            ) : (
              <img 
                src={
                  selectedSession.imageData 
                    ? `data:${selectedSession.imageType || 'image/png'};base64,${selectedSession.imageData}`
                    : selectedSession.image && selectedSession.image.startsWith('data:')
                    ? selectedSession.image
                    : selectedSession.image || ''
                } 
                alt="Trading Chart" 
                className="w-full rounded-lg border"
                onError={(e) => {
                  // Fallback: try to reconstruct from base64 if image URL fails
                  if (selectedSession.imageData && !e.target.src.startsWith('data:')) {
                    e.target.src = `data:${selectedSession.imageType || 'image/png'};base64,${selectedSession.imageData}`;
                  } else {
                    // No base64 data available - mark as broken
                    setBrokenImages(prev => new Set(prev).add(selectedSession.id));
                  }
                }}
              />
            )}
            <div className="mt-4 flex items-center justify-between">
              <BiasIndicator bias={selectedSession.bias} large />
              <span className="text-sm text-gray-600">
                {new Date(selectedSession.timestamp).toLocaleString()}
              </span>
            </div>
          </div>

          {/* AI Analysis */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4">AI Analysis</h3>
            <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap text-sm font-mono max-h-96 overflow-y-auto">
              {selectedSession.analysis}
            </div>
          </div>
        </div>

        {/* Trade Decision */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">Trade Journal</h3>
          
          {selectedSession.tradeTaken === null ? (
            <div className="flex gap-4">
              <button
                onClick={() => handleTradeDecision(selectedSession.id, true)}
                className="flex-1 bg-green-600 text-white px-6 py-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle size={24} />
                Took This Trade
              </button>
              <button
                onClick={() => handleTradeDecision(selectedSession.id, false)}
                className="flex-1 bg-red-600 text-white px-6 py-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                <XCircle size={24} />
                Did Not Take
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-semibold mb-2">
                  Decision: {selectedSession.tradeTaken ? '✅ Took Trade' : '❌ Skipped Trade'}
                </p>
                <p className="text-sm text-gray-600">Reason: {selectedSession.tradeReason}</p>
                {selectedSession.decisionTimestamp && (
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(selectedSession.decisionTimestamp).toLocaleString()}
                  </p>
                )}
              </div>

              {selectedSession.tradeTaken && (
                <div>
                  <h4 className="font-semibold mb-2">Trade Outcome</h4>
                  {selectedSession.tradeOutcome === null ? (
                    <div className="flex gap-4">
                      <button
                        onClick={() => updateTradeOutcome(selectedSession.id, 'win')}
                        className="flex-1 bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200 transition-colors"
                      >
                        Win 🎯
                      </button>
                      <button
                        onClick={() => updateTradeOutcome(selectedSession.id, 'loss')}
                        className="flex-1 bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        Loss 📉
                      </button>
                    </div>
                  ) : (
                    <div className={`p-4 rounded-lg ${
                      selectedSession.tradeOutcome === 'win' 
                        ? 'bg-green-50 text-green-700' 
                        : 'bg-red-50 text-red-700'
                    }`}>
                      <p className="font-semibold">
                        {selectedSession.tradeOutcome === 'win' ? '✅ WIN' : '❌ LOSS'}
                      </p>
                      {selectedSession.outcomeTimestamp && (
                        <p className="text-sm mt-1">
                          {new Date(selectedSession.outcomeTimestamp).toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">Additional Notes</h3>
          <textarea
            value={selectedSession.notes}
            onChange={(e) => {
              const updated = { ...selectedSession, notes: e.target.value };
              saveSession(updated);
              setSelectedSession(updated);
            }}
            placeholder="Add any additional observations, lessons learned, or thoughts about this trade..."
            className="w-full h-32 p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    );
  };

  // Settings View
  const SettingsView = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Settings</h2>
        
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">🔑 Your API Key (Required)</h3>
            <p className="text-sm text-blue-800 mb-3">
              Each user must provide their own Anthropic API key. Your key is encrypted and stored securely. 
              It's never exposed to the browser or logged anywhere.
            </p>
            
            {apiKeyMessage && (
              <div className={`mb-3 p-3 rounded-lg text-sm ${
                apiKeyStatus === 'saved' ? 'bg-green-100 text-green-800' : 
                apiKeyStatus === 'error' ? 'bg-red-100 text-red-800' : 
                'bg-yellow-100 text-yellow-800'
              }`}>
                {apiKeyMessage}
              </div>
            )}

            <div className="bg-white rounded p-4 space-y-3">
              <div>
                <label className="block text-sm font-semibold mb-2">Anthropic API Key</label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => {
                      setApiKey(e.target.value);
                      setApiKeyMessage('');
                      setApiKeyStatus(null);
                    }}
                    placeholder="sk-ant-api03-..."
                    className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  />
                  <button
                    onClick={async () => {
                      if (!apiKey.trim()) {
                        setApiKeyMessage('Please enter an API key');
                        setApiKeyStatus('error');
                        return;
                      }

                      // Basic client-side validation
                      if (!apiKey.trim().startsWith('sk-ant-')) {
                        setApiKeyMessage('Invalid API key format. Must start with sk-ant-');
                        setApiKeyStatus('error');
                        return;
                      }

                      setApiKeyStatus('saving');
                      setApiKeyMessage('');

                      try {
                        const token = await getAuthToken();
                        if (!token) {
                          throw new Error('Not authenticated. Please sign in.');
                        }

                        const response = await fetch('/api/save-key', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                          },
                          body: JSON.stringify({ apiKey: apiKey.trim() })
                        });

                        const data = await response.json();

                        if (!response.ok) {
                          // Better error message for configuration issues
                          if (data.error && data.error.includes('Supabase not configured')) {
                            throw new Error('Server configuration error. Please contact support or check that SUPABASE_SERVICE_ROLE_KEY is set in Vercel environment variables.');
                          }
                          throw new Error(data.error || 'Failed to save API key');
                        }

                        setApiKeyStatus('saved');
                        setApiKeyMessage('✓ API key saved successfully! It is encrypted and secure.');
                        setApiKey(''); // Clear input for security
                      } catch (error) {
                        setApiKeyStatus('error');
                        setApiKeyMessage(`Error: ${error.message}`);
                      }
                    }}
                    disabled={apiKeyStatus === 'saving' || apiKeyStatus === 'deleting'}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {apiKeyStatus === 'saving' ? 'Saving...' : 'Save Key'}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <p className="text-xs text-gray-600">
                  Get your API key from{' '}
                  <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    Anthropic Console
                  </a>
                </p>
                <button
                  onClick={async () => {
                    if (!confirm('Are you sure you want to delete your API key? You will not be able to use AI features until you add a new key.')) {
                      return;
                    }

                    setApiKeyStatus('deleting');
                    setApiKeyMessage('');

                    try {
                      const token = await getAuthToken();
                      if (!token) {
                        throw new Error('Not authenticated. Please sign in.');
                      }

                      const response = await fetch('/api/delete-key', {
                        method: 'DELETE',
                        headers: {
                          'Authorization': `Bearer ${token}`
                        }
                      });

                      const data = await response.json();

                      if (!response.ok) {
                        // Better error message for configuration issues
                        if (data.error && data.error.includes('Supabase not configured')) {
                          throw new Error('Server configuration error. Please contact support or check that SUPABASE_SERVICE_ROLE_KEY is set in Vercel environment variables.');
                        }
                        throw new Error(data.error || 'Failed to delete API key');
                      }

                      setApiKeyStatus('saved');
                      setApiKeyMessage('✓ API key deleted successfully.');
                    } catch (error) {
                      setApiKeyStatus('error');
                      setApiKeyMessage(`Error: ${error.message}`);
                    }
                  }}
                  disabled={apiKeyStatus === 'saving' || apiKeyStatus === 'deleting'}
                  className="text-red-600 hover:text-red-700 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {apiKeyStatus === 'deleting' ? 'Deleting...' : 'Delete Key'}
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Email for Trade Logs</label>
            <div className="flex gap-2">
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={async (e) => {
                  try {
                    await saveUserEmail(userEmail);
                    // Visual feedback
                    const button = e.target;
                    const originalText = button.textContent;
                    button.textContent = '✓ Saved!';
                    button.classList.add('bg-green-600');
                    button.classList.remove('bg-blue-600', 'hover:bg-blue-700');
                    button.classList.add('hover:bg-green-700');
                    setTimeout(() => {
                      button.textContent = originalText;
                      button.classList.remove('bg-green-600', 'hover:bg-green-700');
                      button.classList.add('bg-blue-600', 'hover:bg-blue-700');
                    }, 2000);
                  } catch (error) {
                    // Error already shown in saveUserEmail
                  }
                }}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Trade logs will be emailed to this address when you make decisions.
            </p>
          </div>

          <div className="pt-4 border-t">
            <h3 className="font-semibold mb-2">Data Management</h3>
            <p className="text-sm text-gray-600 mb-4">
              Total Sessions: {sessions.length}
            </p>
            <button
              onClick={async () => {
                if (confirm('Are you sure? This will delete all session data.')) {
                  const userId = user?.id || null;
                  await unifiedStorage.deleteAllSessions(userId);
                  setSessions([]);
                  alert('All data cleared');
                }
              }}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
            >
              Clear All Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth if Supabase is configured and user is not logged in
  if (isSupabaseConfigured() && !user) {
    return <Auth onAuthChange={handleAuthChange} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white p-2 rounded-lg">
              <TrendingUp size={28} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">TradeScope AI</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <nav className="flex gap-2">
              {[
                { id: 'dashboard', icon: <Upload size={20} />, label: 'Dashboard' },
                { id: 'performance', icon: <BarChart3 size={20} />, label: 'Performance' },
                { id: 'settings', icon: <Settings size={20} />, label: 'Settings' }
              ].map(nav => (
                <button
                  key={nav.id}
                  onClick={() => setCurrentView(nav.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    currentView === nav.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {nav.icon}
                  <span className="hidden md:inline">{nav.label}</span>
                </button>
              ))}
            </nav>
            
            {isSupabaseConfigured() && user && (
              <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <User size={16} />
                  <span className="hidden md:inline">{user.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  title="Logout"
                >
                  <LogOut size={16} />
                  <span className="hidden md:inline">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {currentView === 'dashboard' && <DashboardView />}
        {currentView === 'performance' && <PerformanceDashboard />}
        {currentView === 'session' && <SessionView />}
        {currentView === 'settings' && <SettingsView />}
      </main>
    </div>
  );
};

// Helper Components
const StatCard = ({ title, value, icon, color = 'blue' }) => {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600'
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

const BiasIndicator = ({ bias, large = false }) => {
  const icons = {
    long: <TrendingUp size={large ? 24 : 20} />,
    short: <TrendingDown size={large ? 24 : 20} />,
    neutral: <Minus size={large ? 24 : 20} />
  };

  const colors = {
    long: 'bg-green-100 text-green-700',
    short: 'bg-red-100 text-red-700',
    neutral: 'bg-gray-100 text-gray-700'
  };

  return (
    <div className={`flex items-center gap-2 ${large ? 'px-4 py-2' : 'px-3 py-1'} rounded-full ${colors[bias]}`}>
      {icons[bias]}
      <span className={`font-semibold capitalize ${large ? 'text-lg' : 'text-sm'}`}>
        {bias}
      </span>
    </div>
  );
};

export default TradeScopeAI;

