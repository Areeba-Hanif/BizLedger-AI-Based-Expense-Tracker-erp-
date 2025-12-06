import { useMemo, useState, useEffect } from 'react';
import axios from "axios";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Download } from 'lucide-react';

interface ReportsProps {
  user: any;
}

export function Reports({ user }: ReportsProps) {
  const [transactions, setTransactions] = useState([]);
 const today = new Date();
const [selectedMonth, setSelectedMonth] = useState(today.getMonth().toString());
const [selectedYear, setSelectedYear] = useState(today.getFullYear().toString());


  // ✅ Fetch data when month/year changes
  useEffect(() => {
    fetchReport();
  }, [selectedMonth, selectedYear]);

  const fetchReport = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/reports/monthly", {
        params: {
          userId: user._id,
          month: selectedMonth,
          year: selectedYear,
        },
      });

      setTransactions(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  // ✅ Filter transactions (already monthly from backend)
  const filteredTransactions = useMemo(() => transactions, [transactions]);

  // ✅ Profit & Loss
  const profitLoss = useMemo(() => {
    const income: Record<string, number> = {};
    const expenses: Record<string, number> = {};

    filteredTransactions.forEach((t: any) => {
      if (t.type === "income") {
        income[t.category] = (income[t.category] || 0) + t.amount;
      } else if (t.type === "expense") {
        expenses[t.category] = (expenses[t.category] || 0) + t.amount;
      }
    });

    const totalIncome = Object.values(income).reduce((sum, val) => sum + val, 0);
    const totalExpenses = Object.values(expenses).reduce((sum, val) => sum + val, 0);
    const netProfit = totalIncome - totalExpenses;

    return { income, expenses, totalIncome, totalExpenses, netProfit };
  }, [filteredTransactions]);

  // ✅ Balance Sheet
  const balanceSheet = useMemo(() => {
    const cash = profitLoss.netProfit;
    return {
      assets: { cash, totalAssets: cash },
      equity: { retainedEarnings: cash, totalEquity: cash }
    };
  }, [profitLoss]);

  // ✅ Cash Flow
  const cashFlow = useMemo(() => {
    const operating = profitLoss.netProfit;
    return {
      operating,
      investing: 0,
      financing: 0,
      netCashFlow: operating
    };
  }, [profitLoss]);

  const handleExportCSV = () => {
    const csvContent = [
      ['Date', 'Type', 'Category', 'Description', 'Amount'],
      ...filteredTransactions.map((t: any) => [
        new Date(t.date).toLocaleDateString(),
        t.type,
        t.category,
        t.description,
        t.amount.toString(),
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${selectedMonth}_${selectedYear}.csv`;
    a.click();
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1>Financial Reports</h1>
          <p className="text-muted-foreground">View and export your financial statements</p>
        </div>
        <Button onClick={handleExportCSV} className="w-full md:w-auto">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Month Selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1">
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <Select value={selectedYear} disabled>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2025">2025</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="profit-loss" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profit-loss">Profit & Loss</TabsTrigger>
          <TabsTrigger value="balance-sheet">Balance Sheet</TabsTrigger>
          <TabsTrigger value="cash-flow">Cash Flow</TabsTrigger>
        </TabsList>

        {/* Profit & Loss */}
        <TabsContent value="profit-loss">
          <Card>
            <CardHeader>
              <CardTitle>Profit & Loss Statement</CardTitle>
              <CardDescription>
                For {months[parseInt(selectedMonth)]} {selectedYear}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Income */}
              <div>
                <h3 className="mb-3">Income</h3>
                <Table>
                  <TableBody>
                    {Object.entries(profitLoss.income).map(([category, amount]) => (
                      <TableRow key={category}>
                        <TableCell>{category}</TableCell>
                        <TableCell className="text-right text-green-600">
                          ${amount.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell>Total Income</TableCell>
                      <TableCell className="text-right text-green-600">
                        ${profitLoss.totalIncome.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {/* Expenses */}
              <div>
                <h3 className="mb-3">Expenses</h3>
                <Table>
                  <TableBody>
                    {Object.entries(profitLoss.expenses).map(([category, amount]) => (
                      <TableRow key={category}>
                        <TableCell>{category}</TableCell>
                        <TableCell className="text-right text-red-600">
                          ${amount.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell>Total Expenses</TableCell>
                      <TableCell className="text-right text-red-600">
                        ${profitLoss.totalExpenses.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {/* Net Profit */}
              <div className="border-t pt-4">
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell>Net Profit</TableCell>
                      <TableCell
                        className={`text-right ${
                          profitLoss.netProfit >= 0
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        ${Math.abs(profitLoss.netProfit).toLocaleString()}
                        {profitLoss.netProfit < 0 && ' (Loss)'}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Balance Sheet */}
        <TabsContent value="balance-sheet">
          <Card>
            <CardHeader>
              <CardTitle>Balance Sheet</CardTitle>
              <CardDescription>
                As of {months[parseInt(selectedMonth)]} {selectedYear}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div>
                <h3 className="mb-3">Assets</h3>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell>Cash</TableCell>
                      <TableCell className="text-right">
                        ${balanceSheet.assets.cash.toLocaleString()}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Total Assets</TableCell>
                      <TableCell className="text-right">
                        ${balanceSheet.assets.totalAssets.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              <div>
                <h3 className="mb-3">Equity</h3>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell>Retained Earnings</TableCell>
                      <TableCell className="text-right">
                        ${balanceSheet.equity.retainedEarnings.toLocaleString()}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Total Equity</TableCell>
                      <TableCell className="text-right">
                        ${balanceSheet.equity.totalEquity.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cash Flow */}
        <TabsContent value="cash-flow">
          <Card>
            <CardHeader>
              <CardTitle>Cash Flow Statement</CardTitle>
              <CardDescription>
                For {months[parseInt(selectedMonth)]} {selectedYear}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell>Operating Activities</TableCell>
                    <TableCell className="text-right">
                      ${cashFlow.operating.toLocaleString()}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Investing Activities</TableCell>
                    <TableCell className="text-right">
                      ${cashFlow.investing.toLocaleString()}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Financing Activities</TableCell>
                    <TableCell className="text-right">
                      ${cashFlow.financing.toLocaleString()}
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-t">
                    <TableCell>Net Cash Flow</TableCell>
                    <TableCell
                      className={`text-right ${
                        cashFlow.netCashFlow >= 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      ${Math.abs(cashFlow.netCashFlow).toLocaleString()}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
