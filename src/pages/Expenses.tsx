import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

export interface Expense {
    id: number;
    title: string;
    amount: number;
    category: 'Transport' | 'Purchase' | 'Salary' | 'Misc';
    date: string;
    notes: string;
}

export default function Expenses() {
    const [expenses, setExpenses] = useState<Expense[]>([]);

    // Form State
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState<'Transport' | 'Purchase' | 'Salary' | 'Misc'>('Misc');
    const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [notes, setNotes] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);

    // Filters
    const [filterCategory, setFilterCategory] = useState<string>('All');
    const [filterDate, setFilterDate] = useState<string>('');

    useEffect(() => {
        const stored = localStorage.getItem('expenses');
        if (stored) {
            setExpenses(JSON.parse(stored));
        }
    }, []);

    const saveExpenses = (updated: Expense[]) => {
        setExpenses(updated);
        localStorage.setItem('expenses', JSON.stringify(updated));
    };

    const handleSave = () => {
        if (!title.trim() || !amount) {
            Swal.fire({ title: 'Error', text: 'Title and Amount are required', icon: 'error', background: '#222', color: '#fff' });
            return;
        }

        const newExpense: Expense = {
            id: editingId || Date.now(),
            title,
            amount: Number(amount),
            category,
            date,
            notes
        };

        let updated;
        if (editingId) {
            updated = expenses.map(e => e.id === editingId ? newExpense : e);
        } else {
            updated = [newExpense, ...expenses];
        }

        saveExpenses(updated);
        resetForm();
    };

    const resetForm = () => {
        setTitle('');
        setAmount('');
        setCategory('Misc');
        setDate(new Date().toISOString().split('T')[0]);
        setNotes('');
        setEditingId(null);
    };

    const handleEdit = (exp: Expense) => {
        setTitle(exp.title);
        setAmount(exp.amount.toString());
        setCategory(exp.category);
        setDate(exp.date);
        setNotes(exp.notes);
        setEditingId(exp.id);
        window.scrollTo(0, 0);
    };

    const handleDelete = (id: number) => {
        Swal.fire({
            title: 'Delete Expense?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete',
            background: '#222',
            color: '#fff',
            confirmButtonColor: '#d33'
        }).then((res) => {
            if (res.isConfirmed) {
                const updated = expenses.filter(e => e.id !== id);
                saveExpenses(updated);
            }
        });
    };

    const filteredExpenses = expenses.filter(e => {
        if (filterCategory !== 'All' && e.category !== filterCategory) return false;
        if (filterDate && e.date !== filterDate) return false;
        return true;
    });

    const totalFiltered = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

    return (
        <div className="pb-16">
            <h1 className="text-2xl font-bold mb-6">Expenses</h1>

            <div className="card p-4 space-y-4 mb-8 border border-[#333]">
                <h2 className="text-lg font-bold">{editingId ? 'Edit Expense' : 'Add Expense'}</h2>
                <input type="text" placeholder="Expense Title" className="input-field w-full block" value={title} onChange={e => setTitle(e.target.value)} />
                <div className="grid grid-cols-2 gap-4">
                    <input type="number" placeholder="Amount" className="input-field" value={amount} onChange={e => setAmount(e.target.value)} />
                    <select className="input-field w-full" value={category} onChange={e => setCategory(e.target.value as any)}>
                        <option value="Transport">Transport</option>
                        <option value="Purchase">Purchase</option>
                        <option value="Salary">Salary</option>
                        <option value="Misc">Misc</option>
                    </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <input type="date" className="input-field" value={date} onChange={e => setDate(e.target.value)} />
                    <input type="text" placeholder="Notes (Optional)" className="input-field" value={notes} onChange={e => setNotes(e.target.value)} />
                </div>
                <div className="flex gap-2">
                    <button onClick={handleSave} className="btn-primary flex-1">{editingId ? 'Update' : 'Save'}</button>
                    {editingId && <button onClick={resetForm} className="bg-gray-700 text-white rounded font-bold px-4 hover:bg-gray-600 transition">Cancel</button>}
                </div>
            </div>

            <h2 className="text-lg font-bold mb-4">Expense Records</h2>

            <div className="flex gap-2 mb-4">
                <select className="input-field flex-1" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                    <option value="All">All Categories</option>
                    <option value="Transport">Transport</option>
                    <option value="Purchase">Purchase</option>
                    <option value="Salary">Salary</option>
                    <option value="Misc">Misc</option>
                </select>
                <input type="date" className="input-field flex-1" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
                {filterDate && <button onClick={() => setFilterDate('')} className="bg-gray-700 text-white px-3 rounded text-sm">Clear</button>}
            </div>

            <div className="mb-4 text-emerald-500 font-bold p-2 bg-emerald-900/20 rounded">
                Total for this view: ₹ {totalFiltered.toFixed(2)}
            </div>

            <div className="space-y-4">
                {filteredExpenses.length === 0 ? (
                    <p className="text-gray-500 text-center">No expenses found.</p>
                ) : (
                    filteredExpenses.map(exp => (
                        <div key={exp.id} className="card p-4 flex justify-between items-center group">
                            <div>
                                <h3 className="font-bold text-lg">{exp.title}</h3>
                                <div className="text-xs text-gray-400 mt-1 flex gap-2">
                                    <span className="bg-blue-900/40 text-blue-400 px-2 rounded">{exp.category}</span>
                                    <span>{exp.date}</span>
                                </div>
                                {exp.notes && <p className="text-xs text-gray-500 mt-1">{exp.notes}</p>}
                            </div>
                            <div className="text-right">
                                <p className="text-xl font-bold text-red-400 mb-2">₹{exp.amount}</p>
                                <div className="flex gap-2 justify-end">
                                    <button onClick={() => handleEdit(exp)} className="text-sm bg-gray-800 px-3 py-1 rounded hover:bg-gray-700">Edit</button>
                                    <button onClick={() => handleDelete(exp.id)} className="text-sm bg-red-900/40 text-red-500 px-3 py-1 rounded hover:bg-red-900/60">Del</button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
