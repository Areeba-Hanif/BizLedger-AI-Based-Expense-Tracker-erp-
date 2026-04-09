import axios from "axios";
import { useState, useMemo, useEffect, SetStateAction } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Plus, Edit, Trash2, Search, Sparkles } from 'lucide-react';
import { getMockTransactions, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../lib/mockData';
import { Alert, AlertDescription } from './ui/alert';
import { toast } from "sonner";


interface TransactionsProps {
  user: any;
}

interface Transaction {
  _id: string;
  userId: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  date: string;
}

export function Transactions({ user }: TransactionsProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
 const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  
useEffect(() => {
  if (user?._id) {
    axios.get(`http://localhost:5000/api/transactions/${user._id}`)
      .then(res => setTransactions(res.data))
      .catch(err => console.log(err));
  }
}, [user]);


  // Form state
  const [formType, setFormType] = useState<'income' | 'expense'>('expense');
  const [formAmount, setFormAmount] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [openEdit, setOpenEdit] = useState(false);
  const [editId, setEditId] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editType, setEditType] = useState("expense");
  const [editDate, setEditDate] = useState("");


/* ---------- REAL AI CATEGORY PREDICTION ---------- */
/* ---------- REAL AI CATEGORY PREDICTION ---------- */
useEffect(() => {
  // 1. Only run if we have a description and we aren't editing
  if (!formDescription || formDescription.length < 3 || openEdit) {
    setAiSuggestion(null);
    return;
  }

  const timer = setTimeout(async () => {
    try {
      setAiLoading(true);

      // 2. We MUST send formType (income or expense) to the backend
      const res = await axios.post(
        "http://localhost:5000/api/ai/predict",
        { 
          description: formDescription,
          type: formType // This ensures Node.js knows which category list to use
        }
      );

      if (res.data?.predictedCategory) {
        setAiSuggestion(res.data.predictedCategory);
      }
    } catch (err) {
      console.error("AI error:", err);
    } finally {
      setAiLoading(false);
    }
  }, 600);

  return () => clearTimeout(timer);
  // 3. Add formType to dependencies so it re-predicts if you toggle the switch
}, [formDescription, formType, openEdit]);
// Simulate AI categorization
const handleDescriptionChange = (description: string) => {
  setFormDescription(description);

  // Disable AI category auto-change while editing
  if (openEdit) return;

  // If description is cleared, remove suggestion
  if (description.length <= 5) {
    setAiSuggestion(null);
  }
};

useEffect(() => {
  // Clear suggestion if user switches between Income/Expense
  setAiSuggestion(null);
  setFormCategory(""); 
}, [formType]);

const handleAddTransaction = async (e: any) => {
  e.preventDefault();

  const newTransaction = {
    userId: user?._id,
    type: formType,
    amount: parseFloat(formAmount),
    description: formDescription,
    category: formCategory,
    date: formDate,
  };

  try {
    const res = await axios.post("http://localhost:5000/api/transactions/add", newTransaction);

    setTransactions([res.data, ...transactions]);
    toast.success("Transaction added successfully!");
    setIsAddDialogOpen(false);

    // Reset
    setFormAmount("");
    setFormDescription("");
    setFormCategory("");
    setFormDate(new Date().toISOString().split("T")[0]);
  } catch (err) {
    console.log(err);
    toast.error("Update failed. Please try again.");
  }
};


const handleDeleteTransaction = async (id: string) => {
  try {
    await axios.delete(`http://localhost:5000/api/transactions/${id}`);
    setTransactions(transactions.filter((t) => t._id !== id));
  } catch (err) {
    console.log(err);
  }
};
const handleUpdateTransaction = async () => {
  try {
    const payload = {
      amount: Number(editAmount),
      description: editDescription,
      category: editCategory,
      type: editType,
      date: editDate
    };

  const res = await axios.put(
  `http://localhost:5000/api/transactions/${editId}`,
  payload
);

    // Fetch updated transactions
    const updatedData = await axios.get(`http://localhost:5000/api/transactions/${user._id}`);
    setTransactions(updatedData.data);
    
    toast.success("Transaction updated successfully!");

    setOpenEdit(false);

  } catch (error) {
    console.error(error);
   toast.error("Update failed. Please try again.");

  }
};


const handleOpenEdit = (transaction: Transaction) => {
  setEditId(transaction._id);
  setEditAmount(String(transaction.amount));
  setEditDescription(transaction.description);
  setEditCategory(transaction.category);
  setEditType(transaction.type);
  setEditDate(transaction.date.slice(0, 10)); // yyyy-mm-dd format
  setOpenEdit(true);
};


  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const matchesSearch =
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || transaction.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [transactions, searchTerm, filterType]);

  const categories = formType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1>Transactions</h1>
          <p className="text-muted-foreground">Manage your income and expenses</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full md:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add Transaction
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Transaction</DialogTitle>
              <DialogDescription>Enter transaction details below</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={formType} onValueChange={(value: any) => setFormType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Amount</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Enter transaction description..."
                  value={formDescription}
                  onChange={(e) => handleDescriptionChange(e.target.value)}
                  required
                />
                {aiSuggestion && (
                  <Alert>
                    <Sparkles className="h-4 w-4" />
                    <AlertDescription>
                      AI suggests category: <strong>{aiSuggestion}</strong>
                      <Button
                        type="button"
                        variant="link"
                        size="sm"
                        className="ml-2 h-auto p-0"
                        onClick={() => setFormCategory(aiSuggestion)}
                      >
                        Apply
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={formCategory} onValueChange={setFormCategory} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  Add Transaction
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
<Dialog open={openEdit} onOpenChange={setOpenEdit}>
  <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>Edit Transaction</DialogTitle>
      <DialogDescription>Update the transaction details below</DialogDescription>
    </DialogHeader>

    {/* TYPE */}
    <div className="space-y-2">
      <Label>Type</Label>
      <Select value={editType} onValueChange={(v: SetStateAction<string>) => setEditType(v)}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="income">Income</SelectItem>
          <SelectItem value="expense">Expense</SelectItem>
        </SelectContent>
      </Select>
    </div>

    {/* AMOUNT */}
    <div className="space-y-2 mt-3">
      <Label>Amount</Label>
      <Input
        type="number"
        value={editAmount}
        onChange={(e) => setEditAmount(e.target.value)}
        placeholder="0.00"
        required
      />
    </div>

    {/* DESCRIPTION */}
    <div className="space-y-2 mt-3">
      <Label>Description</Label>
      <Textarea
        value={editDescription}
        onChange={(e) => setEditDescription(e.target.value)}
        placeholder="Enter description..."
        required
      />
    </div>

    {/* CATEGORY */}
    <div className="space-y-2 mt-3">
      <Label>Category</Label>
      <Select value={editCategory} onValueChange={setEditCategory}>
        <SelectTrigger>
          <SelectValue placeholder="Select category" />
        </SelectTrigger>

        <SelectContent>
    {categories.map((cat) => (
      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
    ))}
    {/* ✅ Add AI category dynamically if not in list */}
    {aiSuggestion && !categories.includes(aiSuggestion) && (
      <SelectItem key={aiSuggestion} value={aiSuggestion}>
        {aiSuggestion} (AI)
      </SelectItem>
    )}
  </SelectContent>
      </Select>
    </div>

    {/* DATE */}
    <div className="space-y-2 mt-3">
      <Label>Date</Label>
      <Input
        type="date"
        value={editDate}
        onChange={(e) => setEditDate(e.target.value)}
        required
      />
    </div>

    <Button onClick={handleUpdateTransaction} className="mt-4 w-full">
      Update Transaction
    </Button>
  </DialogContent>
</Dialog>



      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 md:flex">
              <Button
                variant={filterType === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterType('all')}
                className="w-full md:w-auto"
              >
                All
              </Button>
              <Button
                variant={filterType === 'income' ? 'default' : 'outline'}
                onClick={() => setFilterType('income')}
                className="w-full md:w-auto"
              >
                Income
              </Button>
              <Button
                variant={filterType === 'expense' ? 'default' : 'outline'}
                onClick={() => setFilterType('expense')}
                className="w-full md:w-auto"
              >
                Expenses
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
          <CardDescription>{filteredTransactions.length} transactions found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
            <Table className="min-w-[600px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">Date</TableHead>
                  <TableHead className="whitespace-nowrap">Description</TableHead>
                  <TableHead className="whitespace-nowrap">Category</TableHead>
                  <TableHead className="whitespace-nowrap">Type</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Amount</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                 <TableRow key={transaction._id}>

                    <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell>{transaction.category}</TableCell>
                    <TableCell>
                      <Badge variant={transaction.type === 'income' ? 'default' : 'secondary'}>
                        {transaction.type}
                      </Badge>
                    </TableCell>
                    <TableCell className={`text-right ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'income' ? '+' : '-'}$
                      {transaction.amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(transaction)}>
                        <Edit className="h-4 w-4" />
                      </Button>


                        
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteTransaction(transaction._id)}

                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
