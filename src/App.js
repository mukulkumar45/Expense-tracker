import React, { useState, useEffect } from 'react';
import { Plus, Filter, BarChart3, FileText, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ExpenseTracker = () => {
  const [expenses, setExpenses] = useState([]);
  const [activeTab, setActiveTab] = useState('list');
  const [showAddForm, setShowAddForm] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: 'all',
    categories: [],
    paymentModes: []
  });


  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    notes: '',
    date: new Date().toISOString().split('T')[0],
    paymentMode: ''
  });

  const categories = ['Rental', 'Groceries', 'Entertainment', 'Travel', 'Others'];
  const paymentModes = ['UPI', 'Credit Card', 'Net Banking', 'Cash'];


  useEffect(() => {
    try {
     
      if (typeof(Storage) === "undefined") {
        console.log('LocalStorage is not supported in this environment');
        return;
      }

      const savedExpenses = localStorage.getItem('expenseTrackerData');
      const savedFilters = localStorage.getItem('expenseTrackerFilters');
      const savedActiveTab = localStorage.getItem('expenseTrackerActiveTab');

      if (savedExpenses) {
        const parsedExpenses = JSON.parse(savedExpenses);
        setExpenses(parsedExpenses);
        console.log('Loaded', parsedExpenses.length, 'expenses from localStorage');
      }

      if (savedFilters) {
        const parsedFilters = JSON.parse(savedFilters);
        setFilters(parsedFilters);
      }

      if (savedActiveTab) {
        setActiveTab(savedActiveTab);
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
    }
  }, []);

  useEffect(() => {
    try {
      if (typeof(Storage) !== "undefined") {
        localStorage.setItem('expenseTrackerData', JSON.stringify(expenses));
        console.log('Saved', expenses.length, 'expenses to localStorage');
      } else {
        console.log('LocalStorage not available - data will not persist');
      }
    } catch (error) {
      console.error('Error saving expenses to localStorage:', error);
    }
  }, [expenses]);


  useEffect(() => {
    try {
      localStorage.setItem('expenseTrackerFilters', JSON.stringify(filters));
    } catch (error) {
      console.error('Error saving filters to localStorage:', error);
    }
  }, [filters]);


  useEffect(() => {
    try {
      localStorage.setItem('expenseTrackerActiveTab', activeTab);
    } catch (error) {
      console.error('Error saving active tab to localStorage:', error);
    }
  }, [activeTab]);

  const handleAddExpense = () => {
    if (!formData.amount || !formData.category || !formData.paymentMode) return;

    const newExpense = {
      id: Date.now(),
      amount: parseFloat(formData.amount),
      category: formData.category,
      notes: formData.notes,
      date: formData.date,
      paymentMode: formData.paymentMode,
      createdAt: new Date().toISOString()
    };

    setExpenses([...expenses, newExpense]);
    setFormData({
      amount: '',
      category: '',
      notes: '',
      date: new Date().toISOString().split('T')[0],
      paymentMode: ''
    });
    setShowAddForm(false);
  };

  const deleteExpense = (expenseId) => {
    setExpenses(expenses.filter(expense => expense.id !== expenseId));
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear all expenses? This action cannot be undone.')) {
      setExpenses([]);
      setFilters({
        dateRange: 'all',
        categories: [],
        paymentModes: []
      });
      try {
        localStorage.removeItem('expenseTrackerData');
        localStorage.removeItem('expenseTrackerFilters');
      } catch (error) {
        console.error('Error clearing localStorage:', error);
      }
    }
  };

  const getFilteredExpenses = () => {
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      const now = new Date();
      

      let dateMatch = true;
      if (filters.dateRange === 'thisMonth') {
        dateMatch = expenseDate.getMonth() === now.getMonth() && 
                   expenseDate.getFullYear() === now.getFullYear();
      } else if (filters.dateRange === 'last30') {
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        dateMatch = expenseDate >= thirtyDaysAgo;
      } else if (filters.dateRange === 'last90') {
        const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        dateMatch = expenseDate >= ninetyDaysAgo;
      }


      const categoryMatch = filters.categories.length === 0 || 
                           filters.categories.includes(expense.category);


      const paymentMatch = filters.paymentModes.length === 0 || 
                          filters.paymentModes.includes(expense.paymentMode);

      return dateMatch && categoryMatch && paymentMatch;
    });
  };

  const getChartData = () => {
    const monthlyData = {};
    
    expenses.forEach(expense => {
      const date = new Date(expense.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          Rental: 0,
          Groceries: 0,
          Entertainment: 0,
          Travel: 0,
          Others: 0
        };
      }
      
      monthlyData[monthKey][expense.category] += expense.amount;
    });

    return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
  };

  const toggleFilter = (type, value) => {
    setFilters(prev => ({
      ...prev,
      [type]: prev[type].includes(value) 
        ? prev[type].filter(item => item !== value)
        : [...prev[type], value]
    }));
  };

  const categoryColors = {
    Rental: '#8884d8',
    Groceries: '#82ca9d',
    Entertainment: '#ffc658',
    Travel: '#ff7c7c',
    Others: '#8dd1e1'
  };

  const formatCurrency = (amount) => `₹${amount.toLocaleString('en-IN')}`;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'white', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: '1152px', margin: '0 auto', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>Expense Tracker</h1>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={clearAllData}
                style={{
                  backgroundColor: '#dc2626',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#b91c1c'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#dc2626'}
              >
                Clear All
              </button>
              <button
                onClick={() => setShowAddForm(true)}
                style={{
                  backgroundColor: '#2563eb',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
              >
                <Plus size={20} />
                Add Expense
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: '1152px', margin: '0 auto', padding: '0 16px' }}>
          <div style={{ display: 'flex', gap: '32px' }}>
            {[
              { id: 'list', label: 'Expenses', icon: FileText },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 16px',
                  borderBottom: activeTab === tab.id ? '2px solid #2563eb' : '2px solid transparent',
                  color: activeTab === tab.id ? '#2563eb' : '#6b7280',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
                onMouseOver={(e) => {
                  if (activeTab !== tab.id) e.target.style.color = '#111827';
                }}
                onMouseOut={(e) => {
                  if (activeTab !== tab.id) e.target.style.color = '#6b7280';
                }}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1152px', margin: '0 auto', padding: '24px 16px' }}>
        {activeTab === 'list' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Filters */}
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 16px 0' }}>
                <Filter size={20} />
                Filters
              </h3>
              
              {/* Date Filter */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Date Range</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {[
                    { value: 'all', label: 'All time' },
                    { value: 'thisMonth', label: 'This month' },
                    { value: 'last30', label: 'Last 30 days' },
                    { value: 'last90', label: 'Last 90 days' }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => setFilters(prev => ({ ...prev, dateRange: option.value }))}
                      style={{
                        padding: '4px 12px',
                        borderRadius: '9999px',
                        fontSize: '12px',
                        border: 'none',
                        cursor: 'pointer',
                        backgroundColor: filters.dateRange === option.value ? '#2563eb' : '#e5e7eb',
                        color: filters.dateRange === option.value ? 'white' : '#374151'
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Categories</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => toggleFilter('categories', category)}
                      style={{
                        padding: '4px 12px',
                        borderRadius: '9999px',
                        fontSize: '12px',
                        border: 'none',
                        cursor: 'pointer',
                        backgroundColor: filters.categories.includes(category) ? '#2563eb' : '#e5e7eb',
                        color: filters.categories.includes(category) ? 'white' : '#374151'
                      }}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Mode Filter */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Payment Modes</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {paymentModes.map(mode => (
                    <button
                      key={mode}
                      onClick={() => toggleFilter('paymentModes', mode)}
                      style={{
                        padding: '4px 12px',
                        borderRadius: '9999px',
                        fontSize: '12px',
                        border: 'none',
                        cursor: 'pointer',
                        backgroundColor: filters.paymentModes.includes(mode) ? '#2563eb' : '#e5e7eb',
                        color: filters.paymentModes.includes(mode) ? 'white' : '#374151'
                      }}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Expenses List */}
            <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
              <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>
                  Expenses ({getFilteredExpenses().length})
                </h3>
              </div>
              <div>
                {getFilteredExpenses().length === 0 ? (
                  <div style={{ padding: '32px', textAlign: 'center', color: '#6b7280' }}>
                    No expenses found matching your filters.
                  </div>
                ) : (
                  getFilteredExpenses().map((expense, index) => (
                    <div key={expense.id} style={{ 
                      padding: '16px',
                      borderBottom: index < getFilteredExpenses().length - 1 ? '1px solid #e5e7eb' : 'none'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <span style={{ fontSize: '18px', fontWeight: '600', color: '#111827' }}>
                              {formatCurrency(expense.amount)}
                            </span>
                            <span style={{ 
                              padding: '2px 8px', 
                              backgroundColor: '#dbeafe', 
                              color: '#1e40af', 
                              fontSize: '10px', 
                              borderRadius: '9999px' 
                            }}>
                              {expense.category}
                            </span>
                            <span style={{ 
                              padding: '2px 8px', 
                              backgroundColor: '#f3f4f6', 
                              color: '#1f2937', 
                              fontSize: '10px', 
                              borderRadius: '9999px' 
                            }}>
                              {expense.paymentMode}
                            </span>
                          </div>
                          {expense.notes && (
                            <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 4px 0' }}>{expense.notes}</p>
                          )}
                          <p style={{ color: '#9ca3af', fontSize: '12px', margin: 0 }}>{expense.date}</p>
                        </div>
                        <button
                          onClick={() => deleteExpense(expense.id)}
                          style={{
                            color: '#dc2626',
                            backgroundColor: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px',
                            borderRadius: '4px'
                          }}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#fee2e2'}
                          onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                          title="Delete expense"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '24px', margin: '0 0 24px 0' }}>Monthly Expenses by Category</h3>
            {getChartData().length === 0 ? (
              <div style={{ textAlign: 'center', color: '#6b7280', padding: '32px 0' }}>
                No data available for chart. Add some expenses first.
              </div>
            ) : (
              <div style={{ height: '384px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `₹${value}`} />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    {categories.map(category => (
                      <Bar
                        key={category}
                        dataKey={category}
                        stackId="a"
                        fill={categoryColors[category]}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      {showAddForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          zIndex: 50
        }}>
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '8px', 
            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', 
            maxWidth: '448px', 
            width: '100%' 
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>Add New Expense</h2>
              <button
                onClick={() => setShowAddForm(false)}
                style={{ 
                  color: '#9ca3af', 
                  backgroundColor: 'transparent', 
                  border: 'none', 
                  cursor: 'pointer',
                  padding: '4px'
                }}
                onMouseOver={(e) => e.target.style.color = '#6b7280'}
                onMouseOut={(e) => e.target.style.color = '#9ca3af'}
              >
                <X size={24} />
              </button>
            </div>
            
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                  Amount (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Enter amount"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="">Select category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                  Payment Mode *
                </label>
                <select
                  value={formData.paymentMode}
                  onChange={(e) => setFormData({...formData, paymentMode: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="">Select payment mode</option>
                  {paymentModes.map(mode => (
                    <option key={mode} value={mode}>{mode}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                  Date *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                  Notes
                </label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Add a note (optional)"
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', paddingTop: '16px' }}>
                <button
                  onClick={() => setShowAddForm(false)}
                  style={{
                    flex: 1,
                    padding: '8px 16px',
                    color: '#374151',
                    backgroundColor: '#e5e7eb',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#d1d5db'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#e5e7eb'}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddExpense}
                  style={{
                    flex: 1,
                    padding: '8px 16px',
                    backgroundColor: '#2563eb',
                    color: 'white',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
                >
                  Add Expense
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseTracker;
