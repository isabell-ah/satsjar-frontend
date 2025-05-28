import { toast } from '@/hooks/use-toast';

// Removed problematic caching that was breaking authentication

// Simple apiRequest function without problematic caching
const apiRequest = async (
  endpoint: string,
  method: string = 'GET',
  data: any = null
): Promise<any> => {
  try {
    const API_URL =
      import.meta.env.VITE_API_URL ||
      // 'http://localhost:3000/api'
      'http://localhost:3000' ||
      'https://sats-jar-backend-2.onrender.com';
    const url = `${API_URL}${endpoint}`;

    console.log(`Making ${method} request to: ${url}`);

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options: RequestInit = {
      method,
      headers,
      credentials: 'include',
    };

    // Only add body for non-GET requests and when data is provided
    if (method !== 'GET' && data !== null) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);

    // For 204 No Content responses, return an empty object
    if (response.status === 204) {
      return {};
    }

    // For other responses, try to parse JSON
    let result;
    try {
      const text = await response.text();
      result = text ? JSON.parse(text) : {};
    } catch (parseError) {
      console.error('Error parsing response:', parseError);
      result = {};
    }

    if (!response.ok) {
      throw new Error(
        result.error || response.statusText || 'API request failed'
      );
    }

    return result;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

// Auth API
export const authApi = {
  login: (phoneNumber: string, pin: string) =>
    apiRequest('/auth/login', 'POST', { phoneNumber, pin }),

  childLogin: (jarId: string, childPin: string) =>
    apiRequest('/auth/child-login', 'POST', { jarId, childPin }),

  register: (userData: { phoneNumber: string; pin: string }) =>
    apiRequest('/auth/register', 'POST', userData),

  createChildAccount: (childData: {
    childName: string;
    childAge: number;
    childPin: string;
  }) => apiRequest('/auth/create-child', 'POST', childData),

  // Use wallet/balance as a proxy to verify token - it's a protected route
  // that will return 401 if token is invalid
  verifyToken: () => apiRequest('/wallet/balance'),
};

// Wallet API
export const walletApi = {
  // Get balance - works for both child and parent views
  getBalance: async (childId?: string) => {
    try {
      const endpoint = childId
        ? `/wallet/child/${childId}/balance`
        : '/wallet/balance';
      const response = await apiRequest(endpoint);
      console.log('Balance response:', response);
      return response;
    } catch (error) {
      console.error('Error fetching balance:', error);
      throw error;
    }
  },

  // This is a legacy method - we'll keep it for backward compatibility
  // but implement it using getBalance
  getChildBalance: async (childId: string) => {
    try {
      return await walletApi.getBalance(childId);
    } catch (error) {
      console.error('Error in getChildBalance:', error);
      throw error;
    }
  },

  // Add M-Pesa deposit functionality
  initiateSTKPush: async (phoneNumber: string, amount: number) => {
    try {
      const response = await apiRequest('/payments/mpesa/stk-push', 'POST', {
        phoneNumber,
        amount,
      });
      console.log('STK push response:', response);
      return {
        transactionId: response.transactionId || response.checkoutRequestId,
        message: response.message || 'STK push initiated',
      };
    } catch (error) {
      console.error('Error initiating STK push:', error);
      throw error;
    }
  },

  // Add M-Pesa deposit for child
  initiateChildPayment: async (
    childId: string,
    phoneNumber: string,
    amount: number
  ) => {
    try {
      const response = await apiRequest(
        `/payments/child/${childId}/mpesa/stk-push`,
        'POST',
        {
          phoneNumber,
          amount,
        }
      );
      console.log('Child STK push response:', response);
      return {
        transactionId: response.transactionId || response.checkoutRequestId,
        message: response.message || 'STK push initiated',
      };
    } catch (error) {
      console.error('Error initiating child STK push:', error);
      throw error;
    }
  },

  // Create a Lightning invoice
  createInvoice: async (amount: number, memo: string) => {
    try {
      const response = await apiRequest('/wallet/invoice', 'POST', {
        amount,
        memo,
      });

      console.log('Invoice response:', response);

      const paymentRequest =
        response.payment_request || response.paymentRequest || response.bolt11;
      const paymentHash = response.payment_hash || response.paymentHash;

      if (!paymentRequest) {
        throw new Error('Invalid invoice response: missing payment request');
      }

      return {
        paymentRequest,
        paymentHash,
      };
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  },

  // Create a Lightning invoice for a child (for parent users)
  createChildInvoice: async (childId: string, amount: number, memo: string) => {
    try {
      const response = await apiRequest(
        `/wallet/child/${childId}/invoice`,
        'POST',
        {
          amount,
          memo,
        }
      );

      console.log('Raw child invoice response:', response);

      // Handle different response formats
      const paymentRequest =
        response.payment_request || response.paymentRequest || response.bolt11;
      const paymentHash = response.payment_hash || response.paymentHash;

      if (!paymentRequest) {
        console.error('Missing payment request in response:', response);
        throw new Error('Invalid invoice response: missing payment request');
      }

      return {
        paymentRequest,
        paymentHash,
      };
    } catch (error) {
      console.error('Error creating child invoice:', error);
      throw error;
    }
  },

  // Check if an invoice has been paid
  checkInvoice: async (paymentHash: string) => {
    try {
      const response = await apiRequest(`/wallet/invoice/${paymentHash}`);
      return {
        paid: response.paid || false,
      };
    } catch (error) {
      console.error('Error checking invoice:', error);
      throw error;
    }
  },
};

// M-Pesa API
export const mpesaApi = {
  // Initiate STK Push
  initiateSTKPush: async (phoneNumber: string, amount: number) => {
    try {
      console.log('Initiating STK Push with:', { phoneNumber, amount });
      const response = await apiRequest('/payments/mpesa/stk-push', 'POST', {
        phoneNumber,
        amount,
      });
      console.log('STK Push response:', response);

      return {
        transactionId: response.transactionId || response.checkoutRequestId,
        message: response.message || 'STK push initiated',
      };
    } catch (error) {
      console.error('Error initiating M-Pesa payment:', error);
      throw error;
    }
  },

  // Initiate payment to child account
  initiateChildPayment: async (
    childId: string,
    phoneNumber: string,
    amount: number
  ) => {
    try {
      console.log('Initiating child payment with:', {
        childId,
        phoneNumber,
        amount,
      });
      // Fix the endpoint to match the backend route structure
      const response = await apiRequest(
        `/payments/child/${childId}/mpesa/stk-push`,
        'POST',
        {
          phoneNumber,
          amount,
        }
      );
      console.log('Child payment response:', response);

      return {
        transactionId: response.transactionId || response.checkoutRequestId,
        message: response.message || 'STK push initiated',
      };
    } catch (error) {
      console.error('Error initiating child payment:', error);
      throw error;
    }
  },

  // Check payment status
  checkStatus: async (transactionId: string) => {
    try {
      console.log('Checking payment status for:', transactionId);
      const response = await apiRequest(`/payments/status/${transactionId}`);
      console.log('Payment status response:', response);

      return {
        status: response.status || 'pending',
        message: response.message || '',
      };
    } catch (error) {
      console.error('Error checking M-Pesa status:', error);
      throw error;
    }
  },
};

// Child management API (for parents)
export const childrenApi = {
  // Get all children for the parent
  getChildren: async () => {
    try {
      const response = await apiRequest('/parent/children');
      console.log('Children data from API:', response);
      return response;
    } catch (error) {
      console.error('Error fetching children:', error);
      throw error;
    }
  },

  // Add a new child
  addChild: async (childData: any) => {
    try {
      // Use the auth/create-child endpoint for adding a child
      const response = await apiRequest(
        '/auth/create-child',
        'POST',
        childData
      );
      console.log('Add child response:', response);
      return response;
    } catch (error) {
      console.error('Error adding child:', error);
      throw error;
    }
  },

  // Get details for a specific child
  getChildDetails: async (childId: string) => {
    try {
      const response = await apiRequest(`/parent/children/${childId}`);
      console.log('Child details:', response);
      return response;
    } catch (error) {
      console.error('Error fetching child details:', error);
      throw error;
    }
  },

  // Update child details
  updateChild: async (childId: string, data: any) => {
    try {
      const response = await apiRequest(
        `/parent/children/${childId}`,
        'PUT',
        data
      );
      console.log('Update child response:', response);
      return response;
    } catch (error) {
      console.error('Error updating child:', error);
      throw error;
    }
  },

  // Delete a child
  deleteChild: async (childId: string) => {
    try {
      const response = await apiRequest(
        `/parent/children/${childId}`,
        'DELETE'
      );
      console.log('Delete child response:', response);
      return response;
    } catch (error) {
      console.error('Error deleting child:', error);
      throw error;
    }
  },

  getChildAchievements: async (childId: string) => {
    try {
      const response = await apiRequest(`/children/${childId}/achievements`);
      return response;
    } catch (error) {
      console.error('Error fetching child achievements:', error);
      throw error;
    }
  },

  markAchievementRewarded: async (childId: string, achievementId: string) => {
    try {
      const response = await apiRequest(
        `/children/${childId}/achievements/${achievementId}/reward`,
        'POST',
        {}
      );
      return response;
    } catch (error) {
      console.error('Error marking achievement as rewarded:', error);
      throw error;
    }
  },
};

// Goals API
export const goalsApi = {
  getGoals: () => apiRequest('/goals'),

  createGoal: (goalData: any) => apiRequest('/goals', 'POST', goalData),

  updateGoal: (goalId: string, data: any) =>
    apiRequest(`/goals/${goalId}`, 'PUT', data),

  deleteGoal: (goalId: string) => apiRequest(`/goals/${goalId}`, 'DELETE'),

  // Add a new method to approve a goal
  approveGoal: async (goalId: string) => {
    try {
      // Send an empty object as the body to ensure valid JSON
      const response = await apiRequest(`/goals/${goalId}/approve`, 'POST', {});
      console.log('Goal approval response:', response);
      return response;
    } catch (error) {
      console.error(`Error approving goal ${goalId}:`, error);
      throw error;
    }
  },

  // Create a new savings goal
  createSavingsGoal: async (goalData: any) => {
    try {
      const response = await apiRequest('/goals', 'POST', goalData);
      console.log('Create goal response:', response);
      return response;
    } catch (error) {
      console.error('Error creating goal:', error);
      throw error;
    }
  },

  // Get all savings goals
  getSavingsGoals: async (childId?: string) => {
    try {
      const endpoint = childId ? `/goals?childId=${childId}` : '/goals';
      const response = await apiRequest(endpoint);
      console.log('Goals response:', response);
      return response;
    } catch (error) {
      console.error('Error fetching goals:', error);
      throw error;
    }
  },

  // Contribute to a goal
  contributeToGoal: async (goalId: string, amount: number) => {
    try {
      const response = await apiRequest(`/goals/${goalId}/contribute`, 'POST', {
        amount,
      });
      console.log('Contribute response:', response);
      return response;
    } catch (error) {
      console.error('Error contributing to goal:', error);
      throw error;
    }
  },
};

// Education API
export const educationApi = {
  getLearningModules: () => apiRequest('/education/modules'),

  getContent: (filters?: any) =>
    apiRequest('/education/content', 'GET', filters),

  submitQuiz: (answers: any) =>
    apiRequest('/education/quizzes/submit', 'POST', answers),

  completeLesson: (lessonId: string) =>
    apiRequest(`/education/lessons/${lessonId}/complete`, 'POST'),
};

// Transactions API
export const transactionsApi = {
  // Get authenticated user's transactions
  getTransactions: async (limit?: number) => {
    try {
      // Update the endpoint to match your backend API
      const endpoint = limit
        ? `/wallet/transactions?limit=${limit}`
        : '/wallet/transactions';
      const response = await apiRequest(endpoint);
      console.log('Transactions response:', response);
      return response;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  },

  // Get a specific child's transactions (parent only)
  getChildTransactions: async (childId: string, limit?: number) => {
    try {
      // Update the endpoint to match your backend API
      const endpoint = limit
        ? `/wallet/child/${childId}/transactions?limit=${limit}`
        : `/wallet/child/${childId}/transactions`;
      const response = await apiRequest(endpoint);
      console.log('Child transactions response:', response);
      return response;
    } catch (error) {
      console.error('Error fetching child transactions:', error);
      throw error;
    }
  },

  // Get all transactions for the parent (across all children)
  getParentTransactions: async (limit?: number) => {
    try {
      const endpoint = limit
        ? `/wallet/parent/transactions?limit=${limit}`
        : '/wallet/parent/transactions';

      const response = await apiRequest(endpoint);
      console.log('Parent transactions response:', response);

      // The new endpoint returns an array directly
      if (Array.isArray(response)) {
        return { transactions: response };
      } else if (response.transactions) {
        return response;
      } else {
        return { transactions: [] };
      }
    } catch (error) {
      console.error('Error fetching parent transactions:', error);
      // Return an empty object with transactions array to prevent errors
      return { transactions: [] };
    }
  },

  addFunds: async (data: {
    childId: string;
    amount: number;
    description?: string;
    type?: string;
  }) => {
    try {
      const response = await apiRequest(
        '/transactions/add-funds',
        'POST',
        data
      );
      return response;
    } catch (error) {
      console.error('Error adding funds:', error);
      throw error;
    }
  },
};

// Savings API
export const savingsApi = {
  // Get all savings plans
  getSavingsPlans: async (childId?: string) => {
    try {
      const endpoint = childId ? `/savings?childId=${childId}` : '/savings';
      const response = await apiRequest(endpoint);
      return response || [];
    } catch (error) {
      console.error('Error fetching savings plans:', error);
      throw error;
    }
  },

  // Create a new savings plan
  createSavingsPlan: async (planData: any) => {
    try {
      const response = await apiRequest('/savings', 'POST', planData);
      return response;
    } catch (error) {
      console.error('Error creating savings plan:', error);
      throw error;
    }
  },

  // Toggle a savings plan (activate/deactivate)
  toggleSavingsPlan: async (planId: string) => {
    try {
      // Send an empty object as the body to avoid "Invalid JSON" errors
      const response = await apiRequest(
        `/savings/${planId}/toggle`,
        'POST',
        {}
      );
      return response;
    } catch (error) {
      console.error('Error toggling savings plan:', error);
      throw error;
    }
  },

  // Delete a savings plan
  deleteSavingsPlan: async (planId: string) => {
    try {
      const response = await apiRequest(`/savings/${planId}`, 'DELETE');
      return response;
    } catch (error) {
      console.error('Error deleting savings plan:', error);
      throw error;
    }
  },

  // Get savings summary for a child
  getChildSavingsSummary: async () => apiRequest('/savings/summary'),

  // Get savings history
  getSavingsHistory: async (childId?: string) => {
    const endpoint = childId
      ? `/transactions/savings?childId=${childId}`
      : '/transactions/savings';
    return apiRequest(endpoint);
  },

  // Create a new savings goal
  createSavingsGoal: async (goalData: any) =>
    apiRequest('/goals', 'POST', goalData),

  // Get all savings goals
  getSavingsGoals: async (childId?: string) => {
    const endpoint = childId ? `/goals?childId=${childId}` : '/goals';
    return apiRequest(endpoint);
  },

  // Update a savings goal
  updateSavingsGoal: async (goalId: string, goalData: any) =>
    apiRequest(`/goals/${goalId}`, 'PUT', goalData),

  // Delete a savings goal
  deleteSavingsGoal: async (goalId: string) =>
    apiRequest(`/goals/${goalId}`, 'DELETE'),

  // Approve a child's savings goal (parent only)
  approveGoal: async (goalId: string) =>
    apiRequest(`/goals/${goalId}/approve`, 'PATCH'),
};

// Achievements API
export const achievementsApi = {
  // Get achievements for a specific child
  getChildAchievements: async (childId: string) => {
    try {
      const response = await apiRequest(`/achievements?childId=${childId}`);
      console.log('Child achievements response:', response);
      return response;
    } catch (error) {
      console.error('Error fetching child achievements:', error);
      throw error;
    }
  },

  // Get achievements for the current user (when child is logged in)
  getMyAchievements: async () => {
    try {
      const response = await apiRequest('/achievements');
      console.log('My achievements response:', response);
      return response;
    } catch (error) {
      console.error('Error fetching my achievements:', error);
      throw error;
    }
  },

  // Award an achievement to a child (parent only)
  awardAchievement: async (
    childId: string,
    achievementData: {
      type: string;
      title: string;
      description: string;
      rewardAmount?: number;
    }
  ) => {
    try {
      const response = await apiRequest(
        `/achievements/${childId}/award`,
        'POST',
        achievementData
      );
      console.log('Award achievement response:', response);
      return response;
    } catch (error) {
      console.error('Error awarding achievement:', error);
      throw error;
    }
  },
};
