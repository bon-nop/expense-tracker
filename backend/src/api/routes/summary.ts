// filepath: backend/src/api/routes/summary.ts
import { Elysia } from "elysia";
import { supabase } from "../../lib/supabase-client";

interface Balance {
  userId: string;
  amount: number;
}

interface Settlement {
  from: string;
  to: string;
  amount: number;
}

// Calculate net balance for each member in a group
function calculateBalances(
  groupExpenses: { paid_by: string; amount: string }[],
  groupMembers: { user_id: string }[],
): Balance[] {
  const balances: Map<string, number> = new Map();

  // Initialize all members with 0 balance
  groupMembers.forEach((m) => balances.set(m.user_id, 0));

  // Calculate balances from expenses
  groupExpenses.forEach((expense) => {
    const paidBy = expense.paid_by;
    const amount = parseFloat(expense.amount);
    const numMembers = groupMembers.length;
    const sharePerPerson = amount / numMembers;

    // Person who paid gets credit for what they paid
    const currentPaid = balances.get(paidBy) || 0;
    balances.set(paidBy, currentPaid + amount);

    // Each person (including payer) owes their share
    groupMembers.forEach((member) => {
      const currentOwe = balances.get(member.user_id) || 0;
      balances.set(member.user_id, currentOwe - sharePerPerson);
    });
  });

  // Convert to array
  return Array.from(balances.entries()).map(([userId, amount]) => ({
    userId,
    amount: Math.round(amount * 100) / 100,
  }));
}

// Minimize transactions using greedy algorithm
function calculateSettlements(balances: Balance[]): Settlement[] {
  const settlements: Settlement[] = [];

  const creditors: Balance[] = [];
  const debtors: Balance[] = [];

  balances.forEach((b) => {
    if (b.amount > 0.01) creditors.push({ ...b });
    else if (b.amount < -0.01) debtors.push({ ...b, amount: -b.amount });
  });

  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  let i = 0, j = 0;
  while (i < creditors.length && j < debtors.length) {
    const creditor = creditors[i];
    const debtor = debtors[j];

    const amount = Math.min(creditor.amount, debtor.amount);

    if (amount > 0.01) {
      settlements.push({
        from: debtor.userId,
        to: creditor.userId,
        amount: Math.round(amount * 100) / 100,
      });
    }

    creditor.amount -= amount;
    debtor.amount -= amount;

    if (creditor.amount < 0.01) i++;
    if (debtor.amount < 0.01) j++;
  }

  return settlements;
}

export const summaryRoutes = new Elysia({ prefix: "/groups/:groupId/summary" })
  // GET /groups/:groupId/summary - Get settlement summary
  .get("/", async ({ params: { groupId } }) => {
    // Get group info
    const { data: group } = await supabase
      .from("groups")
      .select("*")
      .eq("id", groupId)
      .single();
    
    if (!group) {
      return { error: "Group not found" };
    }

    // Get all members
    const { data: groupMembers } = await supabase
      .from("members")
      .select("*")
      .eq("group_id", groupId);

    // Get all expenses
    const { data: groupExpenses } = await supabase
      .from("expenses")
      .select("*")
      .eq("group_id", groupId);

    const members = groupMembers || [];
    const expenses = groupExpenses || [];

    // Calculate total expenses
    const totalExpenses = expenses.reduce((sum, e) => {
      return sum + parseFloat(e.amount);
    }, 0);

    // Calculate balances
    const balances = calculateBalances(expenses, members);

    // Calculate settlements
    const settlements = calculateSettlements(balances);

    return {
      groupId,
      isSettled: group.is_settled,
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      memberCount: members.length,
      balances,
      settlements,
    };
  });

export default summaryRoutes;
