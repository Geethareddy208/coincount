import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Plus } from 'lucide-react';
import { apiFetch } from '../api';
import './Transactions.css';
import './Budgets.css';

const Budgets = () => {
  const { token } = useContext(AuthContext);
  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [category, setCategory] = useState('Total');
  const [amount, setAmount] = useState('');

  const fetchData = async () => {
    try {
      const [budgetsRes, expensesRes] = await Promise.all([
        apiFetch('/api/budgets', { headers: { 'Authorization': `Bearer ${token}` } }),
        apiFetch('/api/expenses', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      if (budgetsRes.ok && expensesRes.ok) {
        setBudgets(await budgetsRes.json());
        setExpenses(await expensesRes.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await apiFetch('/api/budgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ category, amount })
      });
      if (res.ok) {
        setAmount('');
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div>Loading...</div>;

  // Calculate usage
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const currentExpenses = expenses.filter(exp => {
    const d = new Date(exp.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const getUsage = (cat) => {
    if (cat === 'Total') {
      return currentExpenses.reduce((acc, curr) => acc + curr.amount, 0);
    }
    return currentExpenses.filter(e => e.category === cat).reduce((acc, curr) => acc + curr.amount, 0);
  };

  return (
    <div className="transactions-page animate-fade-in">
      <div className="page-header">
        <h1>Budgets</h1>
        <p className="text-secondary">Set limits and track your spending</p>
      </div>

      <div className="transactions-content">
        <div className="form-card glass-panel">
          <h3>Set Budget limit</h3>
          <form onSubmit={handleSubmit} className="mt-4">
            <div className="input-group">
              <label>Category</label>
              <select className="input-field" value={category} onChange={e => setCategory(e.target.value)}>
                <option>Total</option>
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
              <label>Monthly Limit ($)</label>
              <input type="number" step="0.01" className="input-field" value={amount} onChange={e => setAmount(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary w-100">
              <Plus size={18} /> Save Budget
            </button>
          </form>
        </div>

        <div className="list-card glass-panel">
          <h3>Current Month Progress</h3>
          <div className="budgets-list mt-4">
            {budgets.map(b => {
              const spent = getUsage(b.category);
              const percent = Math.min((spent / b.amount) * 100, 100);
              const isOver = spent > b.amount;
              return (
                <div key={b.id} className="budget-item">
                  <div className="budget-header">
                    <span className="budget-cat">{b.category} Budget</span>
                    <span className={`budget-status ${isOver ? 'text-danger' : 'text-success'}`}>
                      ${spent.toFixed(2)} / ${b.amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="progress-bar-bg">
                    <div 
                      className={`progress-bar-fill ${isOver ? 'danger' : (percent > 80 ? 'warning' : 'success')}`} 
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                  {isOver && <div className="budget-alert">Warning: You have exceeded your budget!</div>}
                </div>
              );
            })}
            {budgets.length === 0 && <div className="no-data">No budgets set for this month</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Budgets;
