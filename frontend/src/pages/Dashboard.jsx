import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { apiFetch } from '../api';
import './Dashboard.css';

const Dashboard = () => {
  const { token, user } = useContext(AuthContext);
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [expRes, incRes] = await Promise.all([
          apiFetch('/api/expenses', { headers: { 'Authorization': `Bearer ${token}` } }),
          apiFetch('/api/incomes', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        
        if (expRes.ok && incRes.ok) {
          const expData = await expRes.json();
          const incData = await incRes.json();
          setExpenses(expData);
          setIncomes(incData);
        }
      } catch (err) {
        console.error("Error fetching dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  if (loading) return <div className="p-4">Loading dashboard...</div>;

  const totalExpense = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const totalIncome = incomes.reduce((acc, curr) => acc + curr.amount, 0);
  const balance = totalIncome - totalExpense;

  // Prepare data for Pie Chart (Expenses by Category)
  const categoryData = expenses.reduce((acc, curr) => {
    const existing = acc.find(item => item.name === curr.category);
    if (existing) {
      existing.value += curr.amount;
    } else {
      acc.push({ name: curr.category, value: curr.amount });
    }
    return acc;
  }, []);

  const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#6366f1'];

  return (
    <div className="dashboard-page animate-fade-in">
      <div className="page-header">
        <h1>Welcome, {user?.name}</h1>
        <p className="text-secondary">Here's your financial summary.</p>
      </div>

      <div className="summary-cards">
        <div className="summary-card glass-panel">
          <div className="card-title">Total Balance</div>
          <div className={`card-amount ${balance >= 0 ? 'text-success' : 'text-danger'}`}>
            ${balance.toFixed(2)}
          </div>
        </div>
        <div className="summary-card glass-panel">
          <div className="card-title">Total Income</div>
          <div className="card-amount text-success">+${totalIncome.toFixed(2)}</div>
        </div>
        <div className="summary-card glass-panel">
          <div className="card-title">Total Expenses</div>
          <div className="card-amount text-danger">-${totalExpense.toFixed(2)}</div>
        </div>
      </div>

      <div className="charts-container">
        <div className="chart-card glass-panel">
          <h3>Expenses by Category</h3>
          {categoryData.length > 0 ? (
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', border: 'none', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="no-data">No expenses to display</div>
          )}
        </div>

        <div className="chart-card glass-panel">
          <h3>Recent Transactions</h3>
          <div className="recent-transactions">
            {expenses.slice(0, 5).map((exp) => (
              <div key={exp.id} className="transaction-item">
                <div className="tx-info">
                  <div className="tx-title">{exp.title}</div>
                  <div className="tx-category">{exp.category}</div>
                </div>
                <div className="tx-amount text-danger">-${exp.amount.toFixed(2)}</div>
              </div>
            ))}
            {expenses.length === 0 && <div className="no-data">No recent transactions</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
