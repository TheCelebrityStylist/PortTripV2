import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Plus, Trash2, TrendingDown, TrendingUp, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  { value: 'food', label: '🍽 Food & Drink', color: '#f97316' },
  { value: 'transport', label: '🚌 Transport', color: '#3b82f6' },
  { value: 'entrance', label: '🎟 Entrances', color: '#8b5cf6' },
  { value: 'shopping', label: '🛍 Shopping', color: '#ec4899' },
  { value: 'activity', label: '🏄 Activity', color: '#10b981' },
  { value: 'other', label: '💰 Other', color: '#6b7280' },
];

const catColor = (cat) => CATEGORIES.find(c => c.value === cat)?.color || '#6b7280';
const catLabel = (cat) => CATEGORIES.find(c => c.value === cat)?.label || cat;

export default function ExpenseTracker({ planId, diyBudget = 0 }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ label: '', amount: '', category: 'food' });

  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses', planId],
    queryFn: () => base44.entities.Expense.filter({ plan_id: planId }),
    enabled: !!planId,
  });

  const addExpense = useMutation({
    mutationFn: (data) => base44.entities.Expense.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', planId] });
      setForm({ label: '', amount: '', category: 'food' });
    },
  });

  const deleteExpense = useMutation({
    mutationFn: (id) => base44.entities.Expense.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['expenses', planId] }),
  });

  const totalSpent = expenses.reduce((s, e) => s + (e.amount || 0), 0);
  const savings = diyBudget - totalSpent;
  const savingsPct = diyBudget > 0 ? Math.round((savings / diyBudget) * 100) : 0;

  // Chart data
  const byCategory = CATEGORIES.map(cat => ({
    name: cat.label,
    value: expenses.filter(e => e.category === cat.value).reduce((s, e) => s + e.amount, 0),
    color: cat.color,
  })).filter(d => d.value > 0);

  const barData = [
    { name: 'Budget', amount: diyBudget, fill: '#374151' },
    { name: 'Spent', amount: totalSpent, fill: totalSpent > diyBudget ? '#ef4444' : '#f59e0b' },
    ...(savings > 0 ? [{ name: 'Saved', amount: savings, fill: '#10b981' }] : []),
  ];

  const handleAdd = () => {
    if (!form.label.trim() || !form.amount) return;
    addExpense.mutate({ plan_id: planId, label: form.label, amount: parseFloat(form.amount), category: form.category });
  };

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-card/60 border border-border/40 p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Budget</p>
          <p className="text-xl font-bold text-foreground">€{diyBudget}</p>
        </div>
        <div className="rounded-xl bg-card/60 border border-border/40 p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Spent</p>
          <p className={cn("text-xl font-bold", totalSpent > diyBudget ? "text-red-400" : "text-foreground")}>
            €{totalSpent.toFixed(2)}
          </p>
        </div>
        <div className={cn("rounded-xl border p-4 text-center", savings >= 0 ? "bg-green-400/5 border-green-400/20" : "bg-red-400/5 border-red-400/20")}>
          <p className="text-xs text-muted-foreground mb-1">{savings >= 0 ? '💚 Saved' : '⚠️ Over'}</p>
          <p className={cn("text-xl font-bold", savings >= 0 ? "text-green-400" : "text-red-400")}>
            €{Math.abs(savings).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Charts */}
      {expenses.length > 0 && (
        <div className="grid md:grid-cols-2 gap-4">
          {/* Bar chart */}
          <div className="rounded-xl bg-card/60 border border-border/40 p-4">
            <p className="text-xs font-semibold text-muted-foreground mb-3">Budget vs Actual</p>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={barData} barSize={32}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip formatter={(v) => `€${v}`} contentStyle={{ background: '#1e2530', border: '1px solid #374151', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                  {barData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie chart */}
          {byCategory.length > 0 && (
            <div className="rounded-xl bg-card/60 border border-border/40 p-4">
              <p className="text-xs font-semibold text-muted-foreground mb-3">Spending by category</p>
              <div className="flex items-center gap-4">
                <PieChart width={100} height={100}>
                  <Pie data={byCategory} dataKey="value" cx="50%" cy="50%" outerRadius={45} innerRadius={28} strokeWidth={0}>
                    {byCategory.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                </PieChart>
                <div className="space-y-1 flex-1">
                  {byCategory.map(d => (
                    <div key={d.name} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
                        <span className="text-muted-foreground">{d.name}</span>
                      </span>
                      <span className="font-medium text-foreground">€{d.value.toFixed(0)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add expense */}
      <div className="rounded-xl bg-card/60 border border-border/40 p-4">
        <p className="text-xs font-semibold text-muted-foreground mb-3">Log an expense</p>
        <div className="flex gap-2 flex-wrap">
          <Input
            className="flex-1 min-w-32 h-9 text-sm"
            placeholder="What did you spend on?"
            value={form.label}
            onChange={e => setForm(p => ({ ...p, label: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
          />
          <Input
            type="number"
            className="w-24 h-9 text-sm"
            placeholder="€0.00"
            value={form.amount}
            onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
          />
          <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
            <SelectTrigger className="w-36 h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button size="sm" onClick={handleAdd} disabled={!form.label || !form.amount} className="h-9 gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90">
            <Plus className="w-3.5 h-3.5" />Add
          </Button>
        </div>
      </div>

      {/* Expense list */}
      {expenses.length > 0 && (
        <div className="space-y-2">
          {[...expenses].reverse().map(e => (
            <div key={e.id} className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-card/40 border border-border/30">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: catColor(e.category) }} />
                <div>
                  <p className="text-sm text-foreground">{e.label}</p>
                  <p className="text-xs text-muted-foreground">{catLabel(e.category)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-foreground">€{(e.amount || 0).toFixed(2)}</span>
                <button onClick={() => deleteExpense.mutate(e.id)} className="text-muted-foreground hover:text-red-400 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}