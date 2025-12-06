// Dashboard.tsx (or Dashboard.jsx if you remove TypeScript types)
import { useMemo, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ArrowUpRight, ArrowDownRight, TrendingUp, Wallet } from 'lucide-react';
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

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const userId = user?._id ?? '674b08e91d5a4'; // fallback id if needed
        const res = await axios.get<Transaction[]>(`http://localhost:5000/api/transactions/${userId}`);
        // normalize ensure amounts are numbers and date is string
        const normalized = res.data.map((t) => ({
          ...t,
          amount: typeof t.amount === 'number' ? t.amount : Number(t.amount || 0),
          date: typeof t.date === 'string' ? t.date : new Date(t.date).toISOString(),
        }));
        setTransactions(normalized);
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setTransactions([]); // keep UI stable
      }
    };

    // only fetch if we have user id OR if user is null we still fetch fallback
    fetchTransactions();
  }, [user]);

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

  // If you prefer a visual "loading" while first fetch happens, you can toggle a loading flag.
  // Here we simply render with whatever data we have (empty arrays produce 0 totals).
  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1>Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.name ?? 'User'}! Here's your business overview for{' '}
          {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}.
        </p>
      </div>

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
