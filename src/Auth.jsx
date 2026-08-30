import { useState } from "react";

export default function Auth({ setUser }) {
  const [isSignup, setIsSignup] = useState(false);
  const [authUsername, setAuthUsername] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");

  const API_BASE_URL = "https://sirc-research-copilot-api.onrender.com";

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");
    const endpoint = isSignup ? '/api/signup' : '/api/login';
    
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: authUsername, password: authPassword })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }
      
      if (data.success) {
        const userData = { id: data.userId, username: authUsername };
        setUser(userData);
        localStorage.setItem('sirc_user', JSON.stringify(userData));
      }
    } catch (error) {
      setAuthError(error.message);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a', color: '#fff', fontFamily: 'sans-serif' }}>
      <form onSubmit={handleAuthSubmit} style={{ background: '#1e293b', padding: '40px', borderRadius: '12px', width: '350px', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h2 style={{ color: '#6366f1', margin: '0 0 5px 0' }}>SIRC</h2>
          <span style={{ fontSize: '14px', color: '#94a3b8' }}>Research Copilot Login</span>
        </div>

        {authError && <div style={{ background: '#ef4444', color: '#fff', padding: '8px', borderRadius: '4px', fontSize: '13px', marginBottom: '15px', textAlign: 'center' }}>{authError}</div>}

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px', color: '#cbd5e1' }}>Username</label>
          <input 
            type="text" 
            required
            placeholder="Enter username" 
            value={authUsername} 
            onChange={(e) => setAuthUsername(e.target.value)} 
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #475569', background: '#0f172a', color: '#fff', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px', color: '#cbd5e1' }}>Password</label>
          <input 
            type="password" 
            required
            placeholder="Enter password" 
            value={authPassword} 
            onChange={(e) => setAuthPassword(e.target.value)} 
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #475569', background: '#0f172a', color: '#fff', boxSizing: 'border-box' }}
          />
        </div>

        <button type="submit" style={{ width: '100%', padding: '11px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>
          {isSignup ? 'Sign Up' : 'Login'}
        </button>

        <p onClick={() => { setIsSignup(!isSignup); setAuthError(""); }} style={{ marginTop: '20px', cursor: 'pointer', fontSize: '13px', color: '#93c5fd', textAlign: 'center' }}>
          {isSignup ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
        </p>
      </form>
    </div>
  );
}