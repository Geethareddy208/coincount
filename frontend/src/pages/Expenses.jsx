import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Plus, Trash2 } from 'lucide-react';
import { apiFetch } from '../api';
import './Transactions.css';

const Expenses = () => {
  const { token } = useContext(AuthContext);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchExpenses = async () => {
    try {
      const res = await apiFetch('/api/expenses', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setExpenses(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await apiFetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, amount, category, date })
      });
      if (res.ok) {
        setTitle('');
        setAmount('');
        fetchExpenses();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await apiFetch(`/api/expenses/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchExpenses();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="transactions-page animate-fade-in">
      <div className="page-header">
        <h1>Expenses</h1>
        <p className="text-secondary">Manage your personal expenses</p>
      </div>

      <div className="transactions-content">
        <div className="form-card glass-panel">
          <h3>Add Expense</h3>
          <form onSubmit={handleSubmit} className="mt-4">
            <div className="input-group">
              <label>Title</label>
              <input type="text" className="input-field" value={title} onChange={e => setTitle(e.target.value)} required />
            </div>
            <div className="input-group">
              <label>Amount ($)</label>
              <input type="number" step="0.01" className="input-field" value={amount} onChange={e => setAmount(e.target.value)} required />
            </div>
            <div className="input-group">
              <label>Category</label>
              <select className="input-field" value={category} onChange={e => setCategory(e.target.value)}>
                <option>Food</option>
                <option>Transportation</option>
                <option>Shopping</option>
                <option>Bills</option>
                <option>Entertainment</option>
                <option>Healthcare</option>
                <option>Education</option>
                <option>Others</option>
              </select>
            </div>
            <div className="input-group">
              <label>Date</label>
              <input type="date" className="input-field" value={date} onChange={e => setDate(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary w-100">
              <Plus size={18} /> Add Expense
            </button>
          </form>
        </div>

        <div className="list-card glass-panel">
          <h3>Expense History</h3>
          <div className="transactions-list mt-4">
            {expenses.map(exp => (
              <div key={exp.id} className="transaction-item">
                <div className="tx-info">
                  <div className="tx-title">{exp.title}</div>
                  <div className="tx-meta">{exp.category} &bull; {new Date(exp.date).toLocaleDateString()}</div>
                </div>
                <div className="tx-actions">
                  <div className="tx-amount text-danger">-${exp.amount.toFixed(2)}</div>
                  <button className="btn-icon" onClick={() => handleDelete(exp.id)}>
                    <Trash2 size={18} color="var(--accent-danger)" />
                  </button>
                </div>
              </div>
            ))}
            {expenses.length === 0 && <div className="no-data">No expenses found</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Expenses;
