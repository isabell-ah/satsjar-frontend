import { toast } from '@/hooks/use-toast';

// Simple apiRequest function without problematic caching
const apiRequest = async (
  endpoint: string,
  method: string = 'GET',
  data: any = null
): Promise<any> => {
  try {
    // Define base API URL with environment variable fallbacks
    let API_URL = import.meta.env.VITE_API_URL;
    
    // If not set, use appropriate fallback based on environment
    if (!API_URL) {
      // Check if we're in production (deployed) environment
      const isProduction = window.location.hostname !== 'localhost';
      
      if (isProduction) {
        // In production, use the deployed backend URL WITH /api
        API_URL = 'https://sats-jar-backend-2.onrender.com/api';
      } else {
        // In development, use localhost with /api
        API_URL = 'http://localhost:3000/api';
      }
    }
    
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
      // Remove credentials: 'include' which can cause CORS issues
      mode: 'cors', // Explicitly request CORS
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

// Rest of the API functions remain unchanged
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