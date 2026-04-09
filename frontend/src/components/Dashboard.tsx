// Dashboard.tsx (or Dashboard.jsx if you remove TypeScript types)
import { useMemo, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ArrowUpRight, ArrowDownRight, TrendingUp, Wallet, Sparkles } from 'lucide-react';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Alert, AlertDescription } from './ui/alert';
import axios from 'axios';
import { Download } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';
import { Button } from './ui/button';

interface DashboardProps {
  user?: { _id?: string; name?: string } | null;
}

interface Transaction {
  _id: string;
  userId: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  date: string; // ISO string from backend
  createdAt?: string;
  updatedAt?: string;
}

export function Dashboard({ user }: DashboardProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [aiSummary, setAiSummary] = useState<string>('Generating AI insights...');



  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // 1. Determine the correct User ID
        const userId = user?._id ?? '674b08e91d5a4';
        
        // 2. Fetch Transactions from Node.js
        const res = await axios.get<Transaction[]>(`http://localhost:5000/api/transactions/${userId}`);
        
        // 3. Normalize the data so dates and amounts are clean
        const normalized = res.data.map((t) => ({
          ...t,
          amount: typeof t.amount === 'number' ? t.amount : Number(t.amount || 0),
          date: typeof t.date === 'string' ? t.date : new Date(t.date).toISOString(),
        }));
        
        setTransactions(normalized);

        // 4. Fetch the AI Summary
        // We do this inside the same block to ensure it happens in order
        const aiRes = await axios.get(`http://localhost:5000/api/ai/get-monthly-summary/${userId}`);
        setAiSummary(aiRes.data.summary);

      } catch (err) {
        console.error('Dashboard Load Error:', err);
        setAiSummary("Could not load AI insights.");
      }
    };

    loadDashboardData();
  }, [user?._id]); // This ensures it runs once on load, and again if the user changes

  // ... (rest of your useMemo logic for metrics and charts)

  // Current month/year (real calendar)
  const now = useMemo(() => new Date(), []);
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const metrics = useMemo(() => {
    const currentMonthTransactions = transactions.filter((t) => {
      if (!t?.date) return false;
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const income = currentMonthTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + (t.amount ?? 0), 0);

    const expenses = currentMonthTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + (t.amount ?? 0), 0);

    const profit = income - expenses;
    return { income, expenses, profit };
  }, [transactions, currentMonth, currentYear]);

  // Monthly trend for full year (Jan..Dec)
  const monthlyData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map((month, index) => {
      const monthTransactions = transactions.filter((t) => {
        if (!t?.date) return false;
        const d = new Date(t.date);
        return d.getMonth() === index && d.getFullYear() === currentYear;
      });

      const income = monthTransactions.filter((t) => t.type === 'income').reduce((s, t) => s + (t.amount ?? 0), 0);
      const expenses = monthTransactions.filter((t) => t.type === 'expense').reduce((s, t) => s + (t.amount ?? 0), 0);

      return { month, income, expenses };
    });
  }, [transactions, currentYear]);

  // Expense by category for current month
  const expenseByCategory = useMemo(() => {
    const currentMonthExpenses = transactions.filter((t) => {
      if (!t?.date) return false;
      const d = new Date(t.date);
      return t.type === 'expense' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const categories = currentMonthExpenses.reduce((acc: Record<string, number>, t) => {
      const key = t.category ?? 'Uncategorized';
      acc[key] = (acc[key] || 0) + (t.amount ?? 0);
      return acc;
    }, {});

    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [transactions, currentMonth, currentYear]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  const financialHealth = useMemo(() => {
    // avoid division by zero; if income is 0 show neutral 50
    if (metrics.income === 0) return 50;
    const score = Math.min(100, Math.max(0, (metrics.profit / metrics.income) * 100));
    return Math.round(score);
  }, [metrics]);



const downloadPDF = () => {
  try {
    // 1. Change title for the file name
    const oldTitle = document.title;
    document.title = `Financial_Report_${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}`;

    // 2. Show a neutral info message instead of a success message
    const toastId = toast.info("Opening print preview...", { duration: 2000 });

    // 3. Trigger Print (JavaScript PAUSES here until you close the popup)
    window.print();

    // 4. This code only runs AFTER the print window is closed (Saved or Cancelled)
    setTimeout(() => {
      document.title = oldTitle;
      // We don't show a success toast here because we can't be 100% sure they saved it.
      // If you want a message, make it neutral:
      toast.dismiss(toastId);
    }, 500);

  } catch (error) {
    console.error("Print failed", error);
    toast.error("Failed to open print dialog.");
  }
};

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="no-print">
        <h1>Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.name ?? 'User'}! Here's your business overview for{' '}
          {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}.
        </p>
      </div>
     <Button onClick={downloadPDF} variant="outline" className="no-print flex gap-2">
    <Download className="h-4 w-4" />
    Save as PDF
  </Button>
{/* --- INTEGRATED AI INSIGHTS CARD --- */}
<div id="dashboard-content" className="space-y-6 bg-white p-4">
  {/* --- PRINT ONLY HEADER --- */}
  <div className="print-only print:block border-b-2 border-indigo-600 pb-4 mb-6">
    <div className="flex justify-between items-end">
      <div>
        <h1 className="text-2xl font-bold text-indigo-900">BizLedger Analytics</h1>
        <p className="text-sm text-slate-500">Comprehensive Financial Performance Report</p>
      </div>
      <div className="text-right">
        <p className="font-medium">{user?.name || 'Business Owner'}</p>
        <p className="text-xs text-slate-400">
          {new Date().toLocaleDateString(undefined, { dateStyle: 'full' })}
        </p>
      </div>
    </div>
  </div>
      <Card className="bg-slate-50 border-blue-200 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-600" />
            AI Monthly Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-700 italic" style={{ whiteSpace: 'pre-wrap' }}>
            "{aiSummary}"
          </p>
        </CardContent>
      </Card>
      {/* Financial Health Alert */}
      <Alert>
        <TrendingUp className="h-4 w-4" />
        <AlertDescription>
          Your financial health score is <strong>{financialHealth}%</strong>.{' '}
          {financialHealth >= 70 && ' Great job managing your finances!'}
          {financialHealth < 70 && financialHealth >= 50 && ' Consider reviewing your expenses.'}
          {financialHealth < 50 && ' Your expenses are high. Take action to improve cash flow.'}
        </AlertDescription>
      </Alert>

      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Total Income</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-green-600 text-xl font-semibold">${metrics.income.toLocaleString()}</div>
            <p className="text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Total Expenses</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-red-600 text-xl font-semibold">${metrics.expenses.toLocaleString()}</div>
            <p className="text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Net Profit</CardTitle>
            <Wallet className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={metrics.profit >= 0 ? 'text-green-600 text-xl font-semibold' : 'text-red-600 text-xl font-semibold'}>
              ${Math.abs(metrics.profit).toLocaleString()} {metrics.profit < 0 ? '(Loss)' : ''}
            </div>
            <p className="text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Income vs Expenses Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Income vs Expenses</CardTitle>
            <CardDescription>Monthly comparison for {currentYear}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Expenses by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Expenses by Category</CardTitle>
            <CardDescription>Current month breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            {expenseByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expenseByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {expenseByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground">No expenses this month.</p>
            )}
          </CardContent>
        </Card>
        </div>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Latest 5 transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.slice(0, 5).map((transaction) => (
              <div key={transaction._id} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                      transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                    }`}
                  >
                    {transaction.type === 'income' ? (
                      <ArrowUpRight className="h-5 w-5 text-green-600" />
                    ) : (
                      <ArrowDownRight className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate">{transaction.description}</p>
                    <p className="text-muted-foreground truncate">{transaction.category}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                    {transaction.type === 'income' ? '+' : '-'}${(transaction.amount ?? 0).toLocaleString()}
                  </p>
                  <p className="text-muted-foreground whitespace-nowrap">
                    {new Date(transaction.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            {transactions.length === 0 && <p className="text-muted-foreground">No transactions yet.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
