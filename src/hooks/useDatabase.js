// src/hooks/useDatabase.js
import { useState } from 'react';

export const useDatabase = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const testConnection = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/database/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const result = await response.json();
      
      if (result.success) {
        setIsConnected(true);
        return { success: true, message: 'Database connected successfully' };
      } else {
        setError(result.message);
        return { success: false, error: result.message };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const exportData = async (table, format = 'json') => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/database/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table, format })
      });

      if (format === 'csv') {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${table}_export_${Date.now()}.csv`;
        a.click();
        return { success: true, message: 'CSV export downloaded' };
      } else {
        const result = await response.json();
        if (result.success) {
          // Download JSON file
          const dataStr = JSON.stringify(result, null, 2);
          const blob = new Blob([dataStr], { type: 'application/json' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${table}_export_${Date.now()}.json`;
          a.click();
          return { success: true, message: 'JSON export downloaded', data: result };
        } else {
          throw new Error(result.message);
        }
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const importData = async (table, data) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/database/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table, data })
      });
      
      const result = await response.json();
      
      if (result.success) {
        return { success: true, message: 'Data imported successfully', result: result.result };
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

  const createBackup = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/database/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Download backup file
        const dataStr = JSON.stringify(result.backup, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `crm_backup_${Date.now()}.json`;
        a.click();
        return { success: true, message: 'Backup created and downloaded', metadata: result.metadata };
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

  return {
    isConnected,
    isLoading,
    error,
    testConnection,
    exportData,
    importData,
    createBackup
  };
};