// src/hooks/useCustomers.js
import { useState, useEffect } from 'react';

export const useCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCustomers = async (filters = {}) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await fetch(`/api/database/customers?${queryParams}`);
      const result = await response.json();
      
      if (result.success) {
        setCustomers(result.data);
        return result.data;
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      setError(err.message);
      setCustomers([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const createCustomer = async (customerData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/database/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        setCustomers(prev => [result.data, ...prev]);
        return { success: true, data: result.data };
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const updateCustomer = async (id, customerData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/database/customers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...customerData })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setCustomers(prev => prev.map(c => c.id === id ? result.data : c));
        return { success: true, data: result.data };
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCustomer = async (id) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/database/customers?customerId=${id}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (result.success) {
        setCustomers(prev => prev.filter(c => c.id !== id));
        return { success: true };
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return {
    customers,
    isLoading,
    error,
    fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    refetch: fetchCustomers
  };
};