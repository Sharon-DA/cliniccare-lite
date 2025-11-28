/**
 * Analytics Page
 * 
 * @description Analytics dashboard with charts for appointments and inventory trends
 */

import React, { useState, useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { useLocalDB } from '../hooks/useLocalDB';
import { STORAGE_KEYS, APPOINTMENT_STATUS } from '../utils/constants';
import { formatDate, groupBy } from '../utils/helpers';
import Badge from '../components/common/Badge';

// Chart colors
const COLORS = {
  primary: '#22c55e',
  secondary: '#f97316',
  blue: '#3b82f6',
  purple: '#8b5cf6',
  red: '#ef4444',
  amber: '#f59e0b',
  slate: '#64748b'
};

const PIE_COLORS = ['#22c55e', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#64748b'];

function Analytics() {
  const { data: patients } = useLocalDB(STORAGE_KEYS.PATIENTS);
  const { data: inventory } = useLocalDB(STORAGE_KEYS.INVENTORY);
  const { data: appointments } = useLocalDB(STORAGE_KEYS.APPOINTMENTS);
  const { data: settingsArray } = useLocalDB(STORAGE_KEYS.SETTINGS);
  const settings = settingsArray[0] || { lowStockThreshold: 20, nearExpiryDays: 30 };
  
  // Date range filter
  const [dateRange, setDateRange] = useState('7'); // days
  const [selectedClinician, setSelectedClinician] = useState('');
  
  // Get date range
  const getDateRange = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - parseInt(dateRange));
    return { start, end };
  };
  
  // Get unique clinicians
  const clinicians = useMemo(() => {
    const uniqueClinicians = [...new Set(appointments.map(apt => apt.clinician).filter(Boolean))];
    return uniqueClinicians.sort();
  }, [appointments]);
  
  // Appointment stats by day
  const appointmentTrends = useMemo(() => {
    const { start, end } = getDateRange();
    const days = [];
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const dayAppointments = appointments.filter(apt => {
        if (!apt.datetime?.startsWith(dateStr)) return false;
        if (selectedClinician && apt.clinician !== selectedClinician) return false;
        return true;
      });
      
      days.push({
        date: dateStr,
        label: formatDate(dateStr, 'MMM d'),
        total: dayAppointments.length,
        completed: dayAppointments.filter(apt => apt.status === APPOINTMENT_STATUS.COMPLETED).length,
        noShow: dayAppointments.filter(apt => apt.status === APPOINTMENT_STATUS.NO_SHOW).length,
        checkedIn: dayAppointments.filter(apt => 
          [APPOINTMENT_STATUS.CHECKED_IN, APPOINTMENT_STATUS.IN_PROGRESS, APPOINTMENT_STATUS.COMPLETED].includes(apt.status)
        ).length
      });
    }
    
    return days;
  }, [appointments, dateRange, selectedClinician]);
  
  // Appointment status distribution
  const statusDistribution = useMemo(() => {
    const { start, end } = getDateRange();
    const filtered = appointments.filter(apt => {
      const aptDate = new Date(apt.datetime);
      if (aptDate < start || aptDate > end) return false;
      if (selectedClinician && apt.clinician !== selectedClinician) return false;
      return true;
    });
    
    const grouped = groupBy(filtered, 'status');
    
    return Object.entries(grouped).map(([status, items]) => ({
      name: status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: items.length
    }));
  }, [appointments, dateRange, selectedClinician]);
  
  // No-show rate calculation
  const noShowRate = useMemo(() => {
    const { start, end } = getDateRange();
    const filtered = appointments.filter(apt => {
      const aptDate = new Date(apt.datetime);
      return aptDate >= start && aptDate <= end;
    });
    
    if (filtered.length === 0) return 0;
    
    const noShows = filtered.filter(apt => apt.status === APPOINTMENT_STATUS.NO_SHOW).length;
    return ((noShows / filtered.length) * 100).toFixed(1);
  }, [appointments, dateRange]);
  
  // Inventory trends (stock in/out)
  const inventoryTrends = useMemo(() => {
    const { start, end } = getDateRange();
    const days = [];
    
    // Collect all transactions
    const allTransactions = [];
    inventory.forEach(item => {
      (item.transactions || []).forEach(tx => {
        allTransactions.push({
          ...tx,
          itemName: item.name,
          date: tx.date?.split('T')[0]
        });
      });
    });
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const dayTransactions = allTransactions.filter(tx => tx.date === dateStr);
      
      days.push({
        date: dateStr,
        label: formatDate(dateStr, 'MMM d'),
        stockIn: dayTransactions.filter(tx => tx.t === 'in').reduce((sum, tx) => sum + tx.qty, 0),
        stockOut: dayTransactions.filter(tx => tx.t === 'out').reduce((sum, tx) => sum + tx.qty, 0)
      });
    }
    
    return days;
  }, [inventory, dateRange]);
  
  // Inventory status distribution
  const inventoryStatus = useMemo(() => {
    const lowStock = inventory.filter(item => item.quantity <= settings.lowStockThreshold).length;
    const expired = inventory.filter(item => {
      if (!item.expiryDate) return false;
      return new Date(item.expiryDate) < new Date();
    }).length;
    const healthy = inventory.length - lowStock - expired;
    
    return [
      { name: 'Healthy Stock', value: healthy },
      { name: 'Low Stock', value: lowStock },
      { name: 'Expired', value: expired }
    ].filter(item => item.value > 0);
  }, [inventory, settings]);
  
  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const grouped = groupBy(inventory, 'category');
    return Object.entries(grouped).map(([category, items]) => ({
      name: category.charAt(0).toUpperCase() + category.slice(1),
      count: items.length,
      totalQty: items.reduce((sum, item) => sum + item.quantity, 0)
    }));
  }, [inventory]);
  
  // Summary stats
  const summaryStats = useMemo(() => {
    const { start, end } = getDateRange();
    const periodAppointments = appointments.filter(apt => {
      const aptDate = new Date(apt.datetime);
      return aptDate >= start && aptDate <= end;
    });
    
    return {
      totalAppointments: periodAppointments.length,
      completedAppointments: periodAppointments.filter(apt => apt.status === APPOINTMENT_STATUS.COMPLETED).length,
      noShows: periodAppointments.filter(apt => apt.status === APPOINTMENT_STATUS.NO_SHOW).length,
      totalPatients: patients.length,
      newPatients: patients.filter(p => new Date(p.createdAt) >= start).length,
      lowStockItems: inventory.filter(item => item.quantity <= settings.lowStockThreshold).length
    };
  }, [appointments, patients, inventory, dateRange, settings]);
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-slate-800">Analytics & Reports</h1>
          <p className="text-slate-500">Track clinic performance and trends</p>
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="select w-auto"
          >
            <option value="7">Last 7 days</option>
            <option value="14">Last 14 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
          
          <select
            value={selectedClinician}
            onChange={(e) => setSelectedClinician(e.target.value)}
            className="select w-auto"
          >
            <option value="">All Clinicians</option>
            {clinicians.map(clinician => (
              <option key={clinician} value={clinician}>{clinician}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="card text-center">
          <p className="text-3xl font-bold text-slate-800">{summaryStats.totalAppointments}</p>
          <p className="text-sm text-slate-500">Total Appointments</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-green-600">{summaryStats.completedAppointments}</p>
          <p className="text-sm text-slate-500">Completed</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-red-600">{noShowRate}%</p>
          <p className="text-sm text-slate-500">No-Show Rate</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-blue-600">{summaryStats.totalPatients}</p>
          <p className="text-sm text-slate-500">Total Patients</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-purple-600">{summaryStats.newPatients}</p>
          <p className="text-sm text-slate-500">New Patients</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-amber-600">{summaryStats.lowStockItems}</p>
          <p className="text-sm text-slate-500">Low Stock Items</p>
        </div>
      </div>
      
      {/* Appointment Trends Chart */}
      <div className="card">
        <h3 className="text-lg font-heading font-semibold text-slate-800 mb-4">
          Daily Appointments
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={appointmentTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="label" 
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Bar dataKey="total" name="Total" fill={COLORS.blue} radius={[4, 4, 0, 0]} />
              <Bar dataKey="checkedIn" name="Attended" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
              <Bar dataKey="noShow" name="No Show" fill={COLORS.red} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Status Distribution & Inventory Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointment Status Distribution */}
        <div className="card">
          <h3 className="text-lg font-heading font-semibold text-slate-800 mb-4">
            Appointment Status
          </h3>
          <div className="h-64">
            {statusDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500">
                No appointment data for this period
              </div>
            )}
          </div>
        </div>
        
        {/* Inventory Status */}
        <div className="card">
          <h3 className="text-lg font-heading font-semibold text-slate-800 mb-4">
            Inventory Status
          </h3>
          <div className="h-64">
            {inventoryStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={inventoryStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    <Cell fill={COLORS.primary} />
                    <Cell fill={COLORS.amber} />
                    <Cell fill={COLORS.red} />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500">
                No inventory data
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Inventory Trends */}
      <div className="card">
        <h3 className="text-lg font-heading font-semibold text-slate-800 mb-4">
          Inventory Stock Trends
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={inventoryTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="label" 
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="stockIn" 
                name="Stock In" 
                stroke={COLORS.primary} 
                strokeWidth={2}
                dot={{ fill: COLORS.primary }}
              />
              <Line 
                type="monotone" 
                dataKey="stockOut" 
                name="Stock Out" 
                stroke={COLORS.secondary} 
                strokeWidth={2}
                dot={{ fill: COLORS.secondary }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Category Breakdown */}
      <div className="card">
        <h3 className="text-lg font-heading font-semibold text-slate-800 mb-4">
          Inventory by Category
        </h3>
        {categoryBreakdown.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th className="text-right">Items</th>
                  <th className="text-right">Total Quantity</th>
                </tr>
              </thead>
              <tbody>
                {categoryBreakdown.map(cat => (
                  <tr key={cat.name}>
                    <td className="font-medium">{cat.name}</td>
                    <td className="text-right">
                      <Badge variant="neutral">{cat.count}</Badge>
                    </td>
                    <td className="text-right font-semibold text-slate-800">
                      {cat.totalQty.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center py-8 text-slate-500">No inventory data</p>
        )}
      </div>
    </div>
  );
}

export default Analytics;

