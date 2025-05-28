export interface SavingsPlan {
  id: string;
  name: string;
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly';
  active: boolean;
  goalId?: string;
  goalName?: string;
  nextExecution?: string;
  pausedAt?: string;
}

export interface Goal {
  id: string;
  name: string;
  target: number;
  current: number;
  status: 'pending' | 'approved' | 'completed';
  description?: string;
}

export interface SavingsPlanFormData {
  name: string;
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly';
  childId?: string;
  goalId?: string;
}
