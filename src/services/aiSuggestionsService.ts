import { getDashboardData } from './dashboardService';
import { getAllBills } from '@/src/db/repository/bills';
import { getAllGoals } from '@/src/db/repository/goal';

type Suggestion = { text: string; question: string };

const fallbackSuggestions: Suggestion[] = [
  { text: 'How am I spending?', question: 'How am I spending this month? Show me a breakdown.' },
  { text: 'Can I afford this?', question: 'Based on my current finances, can I afford a large purchase this week?' },
  { text: 'Help me save', question: 'What are some ways I can save more money based on my spending patterns?' },
  { text: 'Review my budget', question: 'How am I doing against my budgets this month?' },
];

export async function getContextualSuggestions(): Promise<Suggestion[]> {
  try {
    const [dashboard, bills, goals] = await Promise.all([
      getDashboardData(),
      getAllBills(),
      getAllGoals(),
    ]);

    const suggestions: Suggestion[] = [];

    // Check budget usage
    if (dashboard.budgetUsed > 80) {
      suggestions.push({ text: 'Budget running low', question: 'My budget usage seems high. How can I stay within my budget for the rest of the month?' });
    }

    // Check upcoming bills
    const now = Date.now();
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    const upcomingBills = (bills as any[]).filter((b: any) => !b.isPaid && b.dueDate && b.dueDate - now < sevenDays && b.dueDate > now);
    if (upcomingBills.length > 0) {
      suggestions.push({ text: 'Upcoming bills', question: 'What bills do I have coming up soon and how much do they total?' });
    }

    // Check goal progress
    const activeGoals = (goals as any[]).filter((g: any) => !g.isCompleted);
    if (activeGoals.length > 0) {
      const slowGoal = activeGoals.find((g: any) => g.targetAmount > 0 && (g.savedAmount / g.targetAmount) < 0.3);
      if (slowGoal) {
        suggestions.push({ text: 'Reach my goal faster', question: `How can I reach my "${slowGoal.title}" goal faster?` });
      }
    }

    // Check expenses vs income
    if (dashboard.monthlyIncome > 0 && dashboard.monthlyExpense > dashboard.monthlyIncome * 0.9) {
      suggestions.push({ text: 'Spending too much?', question: 'My expenses seem close to my income this month. Where can I cut back?' });
    }

    // If we have some contextual ones, mix with a fallback
    if (suggestions.length > 0) {
      suggestions.push(fallbackSuggestions[0]);
      return suggestions.slice(0, 4);
    }

    // No data or normal state - check if user has any data at all
    if (dashboard.totalBalance === 0 && dashboard.monthlyIncome === 0 && dashboard.monthlyExpense === 0) {
      return [
        { text: 'How does OmniFinance work?', question: 'How does OmniFinance work and what can you help me with?' },
        { text: 'Set up my budget', question: 'How should I set up my first budget in OmniFinance?' },
        { text: 'Start saving', question: 'How should I start saving money? What goals should I create?' },
      ];
    }

    return fallbackSuggestions;
  } catch {
    return fallbackSuggestions;
  }
}
