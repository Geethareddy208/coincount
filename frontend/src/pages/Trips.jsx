import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Plus, Trash2 } from 'lucide-react';
import { apiFetch } from '../api';
import './Transactions.css';

const Trips = () => {
  const { token } = useContext(AuthContext);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [name, setName] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState('');

  const fetchTrips = async () => {
    try {
      const res = await apiFetch('/api/trips', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTrips(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await apiFetch('/api/trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, destination, startDate, endDate, budget })
      });
      if (res.ok) {
        setName(''); setDestination(''); setStartDate(''); setEndDate(''); setBudget('');
        fetchTrips();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await apiFetch(`/api/trips/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchTrips();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="transactions-page animate-fade-in">
      <div className="page-header">
        <h1>Travel Management</h1>
        <p className="text-secondary">Plan and track your trips</p>
      </div>

      <div className="transactions-content">
        <div className="form-card glass-panel">
          <h3>Create New Trip</h3>
          <form onSubmit={handleSubmit} className="mt-4">
            <div className="input-group">
              <label>Trip Name</label>
              <input type="text" className="input-field" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="input-group">
              <label>Destination</label>
              <input type="text" className="input-field" value={destination} onChange={e => setDestination(e.target.value)} required />
            </div>
            <div style={{display: 'flex', gap: '1rem'}}>
              <div className="input-group" style={{flex: 1}}>
                <label>Start Date</label>
                <input type="date" className="input-field" value={startDate} onChange={e => setStartDate(e.target.value)} required />
              </div>
              <div className="input-group" style={{flex: 1}}>
                <label>End Date</label>
                <input type="date" className="input-field" value={endDate} onChange={e => setEndDate(e.target.value)} required />
              </div>
            </div>
            <div className="input-group">
              <label>Budget Limit ($)</label>
              <input type="number" step="0.01" className="input-field" value={budget} onChange={e => setBudget(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary w-100">
              <Plus size={18} /> Add Trip
            </button>
          </form>
        </div>

        <div className="list-card glass-panel">
          <h3>My Trips</h3>
          <div className="transactions-list mt-4">
            {trips.map(trip => (
              <div key={trip.id} className="transaction-item" style={{flexDirection: 'column', alignItems: 'flex-start'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center'}}>
                  <div className="tx-info">
                    <div className="tx-title">{trip.name} - {trip.destination}</div>
                    <div className="tx-meta">{new Date(trip.startDate).toLocaleDateString()} to {new Date(trip.endDate).toLocaleDateString()}</div>
                  </div>
                  <button className="btn-icon" onClick={() => handleDelete(trip.id)}>
                    <Trash2 size={18} color="var(--accent-danger)" />
                  </button>
                </div>
                {trip.budget && (
                  <div style={{marginTop: '0.5rem', width: '100%'}}>
                    <div style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>
                      Budget: ${trip.budget}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {trips.length === 0 && <div className="no-data">No trips planned</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trips;
