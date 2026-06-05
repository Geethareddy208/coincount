import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Plus, Trash2 } from 'lucide-react';
import { apiFetch } from '../api';
import './Transactions.css';

const Income = () => {
  const { token } = useContext(AuthContext);
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [source, setSource] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchIncomes = async () => {
    try {
      const res = await apiFetch('/api/incomes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setIncomes(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncomes();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await apiFetch('/api/incomes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ source, amount, date })
      });
      if (res.ok) {
        setSource('');
        setAmount('');
        fetchIncomes();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await apiFetch(`/api/incomes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchIncomes();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="transactions-page animate-fade-in">
      <div className="page-header">
        <h1>Income</h1>
        <p className="text-secondary">Track your earnings</p>
      </div>

      <div className="transactions-content">
        <div className="form-card glass-panel">
          <h3>Add Income</h3>
          <form onSubmit={handleSubmit} className="mt-4">
            <div className="input-group">
              <label>Source (e.g., Salary, Freelance)</label>
              <input type="text" className="input-field" value={source} onChange={e => setSource(e.target.value)} required />
            </div>
            <div className="input-group">
              <label>Amount ($)</label>
              <input type="number" step="0.01" className="input-field" value={amount} onChange={e => setAmount(e.target.value)} required />
            </div>
            <div className="input-group">
              <label>Date</label>
              <input type="date" className="input-field" value={date} onChange={e => setDate(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary w-100">
              <Plus size={18} /> Add Income
            </button>
          </form>
        </div>

        <div className="list-card glass-panel">
          <h3>Income History</h3>
          <div className="transactions-list mt-4">
            {incomes.map(inc => (
              <div key={inc.id} className="transaction-item">
                <div className="tx-info">
                  <div className="tx-title">{inc.source}</div>
                  <div className="tx-meta">{new Date(inc.date).toLocaleDateString()}</div>
                </div>
                <div className="tx-actions">
                  <div className="tx-amount text-success">+${inc.amount.toFixed(2)}</div>
                  <button className="btn-icon" onClick={() => handleDelete(inc.id)}>
                    <Trash2 size={18} color="var(--accent-danger)" />
                  </button>
                </div>
              </div>
            ))}
            {incomes.length === 0 && <div className="no-data">No income found</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Income;
