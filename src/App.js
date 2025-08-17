// src/App.js - Complete CRM WebApp with Enhanced Email Integration
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, Users, CheckSquare, Mail, Building, Settings, Menu, X, Eye, FileText,
  Plus, Edit2, Trash2, Save, User, Phone, Send, Paperclip, Clock, Database,
  RefreshCw, AlertCircle, Download, Upload, Shield, BarChart3, Star, 
  Archive, MoreVertical, Filter, SortAsc, Inbox, Outbox, Settings2
} from 'lucide-react';

// Sample data (existing data structure)
const initialCustomers = [
  {
    id: 1,
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '+1-555-0123',
    company: 'Acme Corp',
    address: '123 Main St, City, State 12345',
    status: 'Active',
    source: 'WooCommerce',
    created: '2024-01-15',
    lastContact: '2024-08-10',
    orderValue: 2500.00,
    tags: ['VIP', 'Enterprise']
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    email: 'sarah.j@techstart.com',
    phone: '+1-555-0124',
    company: 'TechStart Inc',
    address: '456 Oak Ave, City, State 12345',
    status: 'Lead',
    source: 'Manual',
    created: '2024-02-20',
    lastContact: '2024-08-12',
    orderValue: 1200.00,
    tags: ['Hot Lead']
  }
];

const initialTasks = [
  {
    id: 1,
    title: 'Follow up on proposal',
    description: 'Send follow-up email regarding the enterprise package proposal',
    customerId: 1,
    customerName: 'John Smith',
    assignedTo: 'Mike Wilson',
    assignedToEmail: 'mike@company.com',
    priority: 'High',
    status: 'In Progress',
    dueDate: '2024-08-20',
    created: '2024-08-15',
    tags: ['Sales', 'Follow-up']
  },
  {
    id: 2,
    title: 'Schedule demo call',
    description: 'Set up product demo for potential client',
    customerId: 2,
    customerName: 'Sarah Johnson',
    assignedTo: 'Lisa Chen',
    assignedToEmail: 'lisa@company.com',
    priority: 'Medium',
    status: 'Pending',
    dueDate: '2024-08-18',
    created: '2024-08-14',
    tags: ['Demo', 'Sales']
  }
];

const initialEmails = [
  {
    id: 1,
    customerId: 1,
    customerName: 'John Smith',
    subject: 'Re: Enterprise Package Inquiry',
    from: 'john.smith@example.com',
    to: 'sales@company.com',
    cc: '',
    bcc: '',
    body: 'Hi, I am interested in learning more about your enterprise package. Could you please send me more details about pricing and features?',
    timestamp: '2024-08-15 10:30:00',
    isRead: true,
    isStarred: false,
    thread: 'thread_1',
    type: 'incoming',
    status: 'delivered',
    priority: 'normal',
    attachments: []
  },
  {
    id: 2,
    customerId: 2,
    customerName: 'Sarah Johnson',
    subject: 'Welcome to our CRM!',
    from: 'sales@company.com',
    to: 'sarah.j@techstart.com',
    cc: '',
    bcc: '',
    body: 'Thank you for your interest in our services. We are excited to work with you!',
    timestamp: '2024-08-14 14:15:00',
    isRead: true,
    isStarred: false,
    thread: 'thread_2',
    type: 'outgoing',
    status: 'sent',
    priority: 'normal',
    smtpMessageId: 'msg_12345',
    attachments: []
  }
];

const emailTemplates = [
  {
    id: 1,
    name: 'Welcome Email',
    subject: 'Welcome to {{company_name}}!',
    body: `Hi {{customer_name}},

Thank you for your interest in our services. We're excited to work with you!

Here's what you can expect:
- Personalized service from our team
- Regular updates on your projects
- 24/7 support when you need it

If you have any questions, feel free to reach out.

Best regards,
{{sender_name}}
{{company_name}}`
  },
  {
    id: 2,
    name: 'Follow-up Email',
    subject: 'Following up on our conversation',
    body: `Hi {{customer_name}},

I wanted to follow up on our recent conversation about {{topic}}.

Do you have any questions or would you like to schedule a call to discuss further?

Looking forward to hearing from you.

Best regards,
{{sender_name}}`
  },
  {
    id: 3,
    name: 'Proposal Email',
    subject: 'Proposal for {{project_name}}',
    body: `Hi {{customer_name}},

As discussed, please find attached our proposal for {{project_name}}.

The proposal includes:
- Detailed project scope
- Timeline and milestones
- Investment breakdown

Please review and let us know if you have any questions.

Best regards,
{{sender_name}}`
  }
];

const staffMembers = [
  { id: 1, name: 'Mike Wilson', email: 'mike@company.com', role: 'Sales Manager' },
  { id: 2, name: 'Lisa Chen', email: 'lisa@company.com', role: 'Account Executive' },
  { id: 3, name: 'David Brown', email: 'david@company.com', role: 'Support Lead' }
];

const CRM = () => {
  const [activeModule, setActiveModule] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [customers, setCustomers] = useState(initialCustomers);
  const [tasks, setTasks] = useState(initialTasks);
  const [emails, setEmails] = useState(initialEmails);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [notification, setNotification] = useState(null);
  const [emailQueue, setEmailQueue] = useState([]);
  const [showDatabaseManager, setShowDatabaseManager] = useState(false);
  const [isDatabaseConnected, setIsDatabaseConnected] = useState(false);
  const [emailConfig, setEmailConfig] = useState({
    smtp: { configured: false },
    imap: { configured: false },
    sendgrid: { configured: false }
  });

  // Check email configuration on mount
  useEffect(() => {
    checkEmailConfig();
  }, []);

  // Check email configuration
  const checkEmailConfig = async () => {
    try {
      const response = await fetch('/api/email/config', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setEmailConfig(result.config);
        }
      }
    } catch (error) {
      console.warn('Failed to check email configuration:', error);
    }
  };

  // Show notification helper
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Modal handlers
  const openModal = (type, item = null) => {
    setModalType(type);
    setSelectedItem(item);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
    setModalType('');
  };

  // Enhanced SMTP Email functionality
  const sendEmail = async (emailData) => {
    try {
      // Show sending notification
      showNotification('Sending email...', 'info');

      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...emailData,
          timestamp: new Date().toISOString()
        })
      });

      const result = await response.json();

      if (result.success) {
        // Add sent email to emails list
        const newEmail = {
          id: Math.max(...emails.map(e => e.id), 0) + 1,
          customerId: emailData.customerId,
          customerName: emailData.customerName,
          subject: emailData.subject,
          from: emailData.from,
          to: emailData.to,
          cc: emailData.cc || '',
          bcc: emailData.bcc || '',
          body: emailData.body,
          timestamp: new Date().toLocaleString(),
          isRead: true,
          isStarred: false,
          thread: `thread_${Date.now()}`,
          type: 'outgoing',
          status: 'sent',
          priority: emailData.priority || 'normal',
          smtpMessageId: result.messageId,
          attachments: emailData.attachments || []
        };

        setEmails(prev => [newEmail, ...prev]);
        
        // Store in database if connected
        if (isDatabaseConnected) {
          try {
            await fetch('/api/database/emails', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                customer_id: emailData.customerId,
                customer_name: emailData.customerName,
                subject: emailData.subject,
                from_email: emailData.from,
                to_email: emailData.to,
                cc_email: emailData.cc,
                bcc_email: emailData.bcc,
                body: emailData.body,
                type: 'outgoing',
                status: 'sent',
                priority: emailData.priority || 'normal',
                smtp_message_id: result.messageId,
                attachments: JSON.stringify(emailData.attachments || [])
              })
            });
          } catch (dbError) {
            console.warn('Failed to store email in database:', dbError);
          }
        }

        showNotification('Email sent successfully! ✅', 'success');
        return true;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Email send error:', error);
      showNotification(`Failed to send email: ${error.message}`, 'error');
      return false;
    }
  };

  // Queue email function
  const queueEmail = (emailData) => {
    const queuedEmail = {
      ...emailData,
      id: Math.max(...emailQueue.map(e => e.id || 0), 0) + 1,
      queuedAt: new Date().toISOString()
    };
    setEmailQueue(prev => [...prev, queuedEmail]);
    showNotification('Email added to queue! 📧', 'info');
  };

  // Process email queue function
  const processEmailQueue = async () => {
    if (emailQueue.length === 0) {
      showNotification('No emails in queue', 'info');
      return;
    }

    showNotification(`Processing ${emailQueue.length} queued emails...`, 'info');
    
    try {
      const response = await fetch('/api/bulk-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emails: emailQueue })
      });

      const result = await response.json();

      if (result.success) {
        // Process results and update UI
        result.results.forEach((emailResult, index) => {
          if (emailResult.success) {
            const originalEmail = emailQueue[index];
            const newEmail = {
              id: Math.max(...emails.map(e => e.id), 0) + index + 1,
              ...originalEmail,
              timestamp: new Date().toLocaleString(),
              isRead: true,
              isStarred: false,
              thread: `thread_${Date.now()}_${index}`,
              type: 'outgoing',
              status: 'sent',
              smtpMessageId: emailResult.messageId,
              attachments: originalEmail.attachments || []
            };
            setEmails(prev => [newEmail, ...prev]);
          }
        });

        // Clear successful emails from queue
        const failedEmails = emailQueue.filter((_, index) => 
          !result.results[index].success
        );
        setEmailQueue(failedEmails);

        showNotification(
          `${result.summary.successful} emails sent successfully, ${result.summary.failed} failed`,
          result.summary.failed > 0 ? 'warning' : 'success'
        );
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Bulk email error:', error);
      showNotification('Failed to process email queue: ' + error.message, 'error');
    }
  };

  // Email management functions
  const markEmailAsRead = (emailId, isRead = true) => {
    setEmails(prev => prev.map(email => 
      email.id === emailId ? { ...email, isRead } : email
    ));
  };

  const toggleEmailStar = (emailId) => {
    setEmails(prev => prev.map(email => 
      email.id === emailId ? { ...email, isStarred: !email.isStarred } : email
    ));
  };

  const deleteEmail = (emailId) => {
    const email = emails.find(e => e.id === emailId);
    if (window.confirm(`Are you sure you want to delete "${email.subject}"?`)) {
      setEmails(prev => prev.filter(e => e.id !== emailId));
      showNotification('Email deleted successfully', 'info');
    }
  };

  // Fetch emails from IMAP
  const fetchEmails = async () => {
    try {
      showNotification('Fetching emails from server...', 'info');
      
      const response = await fetch('/api/email/fetch-inbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          folderName: 'INBOX',
          limit: 50,
          since: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // Last 7 days
        })
      });

      const result = await response.json();

      if (result.success) {
        showNotification(`Fetched ${result.emailsProcessed.length} new emails`, 'success');
        // Refresh emails list if connected to database
        if (isDatabaseConnected) {
          // Could fetch updated emails from database here
        }
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Email fetch error:', error);
      showNotification(`Failed to fetch emails: ${error.message}`, 'error');
    }
  };

  // Sync emails
  const syncEmails = async () => {
    try {
      showNotification('Syncing emails...', 'info');
      
      const response = await fetch('/api/email/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'recent',
          hours: 24
        })
      });

      const result = await response.json();

      if (result.success) {
        showNotification(
          `Sync completed: ${result.results.newEmails} new emails, ${result.results.matchedCustomers} matched customers`,
          'success'
        );
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Email sync error:', error);
      showNotification(`Failed to sync emails: ${error.message}`, 'error');
    }
  };

  // Customer CRUD operations with database support
  const addCustomer = async (customerData) => {
    const newCustomer = {
      ...customerData,
      id: Math.max(...customers.map(c => c.id), 0) + 1,
      created: new Date().toISOString().split('T')[0],
      lastContact: '',
      source: 'Manual',
      orderValue: parseFloat(customerData.orderValue) || 0,
      tags: customerData.tags ? customerData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
    };

    // Add to local state
    setCustomers(prev => [...prev, newCustomer]);

    // Try to add to database if connected
    if (isDatabaseConnected) {
      try {
        await fetch('/api/database/customers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: newCustomer.name,
            email: newCustomer.email,
            phone: newCustomer.phone,
            company: newCustomer.company,
            address: newCustomer.address,
            status: newCustomer.status,
            source: newCustomer.source,
            order_value: newCustomer.orderValue,
            tags: newCustomer.tags
          })
        });
      } catch (dbError) {
        console.warn('Failed to save customer to database:', dbError);
      }
    }

    showNotification(`Customer "${newCustomer.name}" added successfully!`);
    closeModal();
  };

  const updateCustomer = async (updatedData) => {
    const updatedCustomer = {
      ...updatedData,
      orderValue: parseFloat(updatedData.orderValue) || 0,
      tags: updatedData.tags ? updatedData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
    };

    // Update local state
    setCustomers(prev => prev.map(c => 
      c.id === selectedItem.id ? { ...c, ...updatedCustomer } : c
    ));

    // Try to update in database if connected
    if (isDatabaseConnected) {
      try {
        await fetch('/api/database/customers', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: selectedItem.id,
            name: updatedCustomer.name,
            email: updatedCustomer.email,
            phone: updatedCustomer.phone,
            company: updatedCustomer.company,
            address: updatedCustomer.address,
            status: updatedCustomer.status,
            order_value: updatedCustomer.orderValue,
            tags: updatedCustomer.tags
          })
        });
      } catch (dbError) {
        console.warn('Failed to update customer in database:', dbError);
      }
    }

    showNotification(`Customer "${updatedCustomer.name}" updated successfully!`);
    closeModal();
  };

  const deleteCustomer = async (id) => {
    const customer = customers.find(c => c.id === id);
    if (window.confirm(`Are you sure you want to delete "${customer.name}"?`)) {
      // Delete from local state
      setCustomers(prev => prev.filter(c => c.id !== id));
      setTasks(prev => prev.filter(t => t.customerId !== id));

      // Try to delete from database if connected
      if (isDatabaseConnected) {
        try {
          await fetch(`/api/database/customers?customerId=${id}`, {
            method: 'DELETE'
          });
        } catch (dbError) {
          console.warn('Failed to delete customer from database:', dbError);
        }
      }

      showNotification(`Customer "${customer.name}" deleted successfully!`);
    }
  };

  // Task CRUD operations
  const addTask = (taskData) => {
    const selectedCustomer = customers.find(c => c.id === parseInt(taskData.customerId));
    const selectedStaff = staffMembers.find(s => s.name === taskData.assignedTo);
    
    const newTask = {
      ...taskData,
      id: Math.max(...tasks.map(t => t.id), 0) + 1,
      customerId: parseInt(taskData.customerId),
      customerName: selectedCustomer?.name || '',
      assignedToEmail: selectedStaff?.email || '',
      created: new Date().toISOString().split('T')[0],
      status: 'Pending',
      tags: taskData.tags ? taskData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
    };
    setTasks(prev => [...prev, newTask]);
    showNotification(`Task "${newTask.title}" assigned to ${newTask.assignedTo}!`);
    closeModal();
  };

  const updateTask = (updatedData) => {
    const selectedCustomer = customers.find(c => c.id === parseInt(updatedData.customerId));
    const selectedStaff = staffMembers.find(s => s.name === updatedData.assignedTo);
    
    const updatedTask = {
      ...updatedData,
      customerId: parseInt(updatedData.customerId),
      customerName: selectedCustomer?.name || '',
      assignedToEmail: selectedStaff?.email || '',
      tags: updatedData.tags ? updatedData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
    };
    setTasks(prev => prev.map(t => 
      t.id === selectedItem.id ? { ...t, ...updatedTask } : t
    ));
    showNotification(`Task "${updatedTask.title}" updated successfully!`);
    closeModal();
  };

  const deleteTask = (id) => {
    const task = tasks.find(t => t.id === id);
    if (window.confirm(`Are you sure you want to delete the task "${task.title}"?`)) {
      setTasks(prev => prev.filter(t => t.id !== id));
      showNotification(`Task "${task.title}" deleted successfully!`);
    }
  };

  const updateTaskStatus = (taskId, newStatus) => {
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, status: newStatus } : t
    ));
    const task = tasks.find(t => t.id === taskId);
    showNotification(`Task "${task.title}" marked as ${newStatus}!`);
  };

  // Global search functionality
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return { customers: [], tasks: [], emails: [] };
    
    const query = searchQuery.toLowerCase();
    
    const customerResults = customers.filter(customer =>
      customer.name.toLowerCase().includes(query) ||
      customer.email.toLowerCase().includes(query) ||
      customer.company.toLowerCase().includes(query) ||
      customer.tags.some(tag => tag.toLowerCase().includes(query))
    );
    
    const taskResults = tasks.filter(task =>
      task.title.toLowerCase().includes(query) ||
      task.description.toLowerCase().includes(query) ||
      task.customerName.toLowerCase().includes(query) ||
      task.assignedTo.toLowerCase().includes(query)
    );
    
    const emailResults = emails.filter(email =>
      email.subject.toLowerCase().includes(query) ||
      email.body.toLowerCase().includes(query) ||
      email.customerName.toLowerCase().includes(query) ||
      email.from.toLowerCase().includes(query) ||
      email.to.toLowerCase().includes(query)
    );
    
    return { customers: customerResults, tasks: taskResults, emails: emailResults };
  }, [searchQuery, customers, tasks, emails]);

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <Settings size={20} /> },
    { id: 'customers', label: 'Customers', icon: <Users size={20} /> },
    { id: 'tasks', label: 'Tasks', icon: <CheckSquare size={20} /> },
    { id: 'emails', label: 'Emails', icon: <Mail size={20} /> },
    { id: 'compose', label: 'Compose', icon: <Send size={20} /> },
    { id: 'email-setup', label: 'Email Setup', icon: <Settings2 size={20} /> },
    { id: 'database', label: 'Database', icon: <Database size={20} /> }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
          notification.type === 'success' ? 'bg-green-500 text-white' : 
          notification.type === 'info' ? 'bg-blue-500 text-white' : 
          notification.type === 'warning' ? 'bg-yellow-500 text-white' : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center justify-between">
            <span>{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="ml-4 text-white hover:text-gray-200"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-white shadow-lg transition-all duration-300 ease-in-out flex-shrink-0`}>
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div>
                <h1 className="text-xl font-bold text-gray-800">CRM Pro</h1>
                <div className="flex items-center space-x-2">
                  <p className="text-xs text-gray-500">v4.0.0 - Database Ready</p>
                  <div className={`w-2 h-2 rounded-full ${isDatabaseConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                </div>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 rounded hover:bg-gray-100 transition-colors"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
        
        <nav className="mt-4">
          {sidebarItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'database') {
                  setShowDatabaseManager(true);
                } else {
                  setActiveModule(item.id);
                }
              }}
              className={`w-full flex items-center px-4 py-3 text-left hover:bg-gray-100 transition-colors ${
                activeModule === item.id ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' : 'text-gray-700'
              }`}
              title={!sidebarOpen ? item.label : ''}
            >
              <span className="mr-3">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
              {item.id === 'database' && !isDatabaseConnected && sidebarOpen && (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1">
                  !
                </span>
              )}
              {item.id === 'emails' && emails.filter(e => !e.isRead).length > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1">
                  {emails.filter(e => !e.isRead).length}
                </span>
              )}
              {item.id === 'email-setup' && (!emailConfig.smtp.configured && !emailConfig.sendgrid.configured) && sidebarOpen && (
                <span className="ml-auto bg-yellow-500 text-white text-xs rounded-full px-2 py-1">
                  !
                </span>
              )}
            </button>
          ))}
        </nav>

        {sidebarOpen && (
          <div className="absolute bottom-4 left-4 right-4">
            {emailQueue.length > 0 && (
              <div className="bg-yellow-50 rounded-lg p-3 mb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-yellow-800 font-medium">📧 {emailQueue.length} Queued</p>
                    <button
                      onClick={processEmailQueue}
                      className="text-xs text-yellow-600 hover:text-yellow-800 underline"
                    >
                      Send now
                    </button>
                  </div>
                  <Clock size={16} className="text-yellow-600" />
                </div>
              </div>
            )}
            
            <div className={`rounded-lg p-3 ${isDatabaseConnected ? 'bg-green-50' : 'bg-yellow-50'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs font-medium ${isDatabaseConnected ? 'text-green-800' : 'text-yellow-800'}`}>
                    {isDatabaseConnected ? '🗄️ Database Online' : '⚠️ Database Offline'}
                  </p>
                  <button
                    onClick={() => setShowDatabaseManager(true)}
                    className={`text-xs underline hover:no-underline ${isDatabaseConnected ? 'text-green-600' : 'text-yellow-600'}`}
                  >
                    Manage Database
                  </button>
                </div>
                <Database size={16} className={isDatabaseConnected ? 'text-green-600' : 'text-yellow-600'} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-2xl font-semibold text-gray-800 capitalize">
                {activeModule === 'dashboard' ? 'Dashboard' : 
                 activeModule === 'compose' ? 'Compose Email' : 
                 activeModule === 'email-setup' ? 'Email Setup' : activeModule}
              </h2>
              {activeModule !== 'dashboard' && activeModule !== 'compose' && activeModule !== 'email-setup' && (
                <span className="text-sm text-gray-500">
                  {activeModule === 'customers' && `${customers.length} total`}
                  {activeModule === 'tasks' && `${tasks.length} total`}
                  {activeModule === 'emails' && `${emails.length} total`}
                </span>
              )}
            </div>
            
            {/* Global Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search everything..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-80 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-6">
          {/* Database connection warning */}
          {!isDatabaseConnected && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="text-yellow-600 mr-3" size={20} />
                <div className="flex-1">
                  <p className="text-yellow-800 font-medium">Database Not Connected</p>
                  <p className="text-yellow-700 text-sm">
                    Your data is currently stored locally. Connect to a database for persistence across sessions.
                  </p>
                </div>
                <button
                  onClick={() => setShowDatabaseManager(true)}
                  className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 text-sm"
                >
                  Setup Database
                </button>
              </div>
            </div>
          )}

          {searchQuery && (
            <SearchResults 
              results={searchResults} 
              onClearSearch={() => setSearchQuery('')}
            />
          )}
          
          {!searchQuery && activeModule === 'dashboard' && (
            <Dashboard 
              customers={customers} 
              tasks={tasks} 
              emails={emails} 
              isDatabaseConnected={isDatabaseConnected}
              emailConfig={emailConfig}
            />
          )}
          {!searchQuery && activeModule === 'customers' && (
            <CustomersModule 
              customers={customers} 
              onAdd={() => openModal('add-customer')}
              onEdit={(customer) => openModal('edit-customer', customer)}
              onDelete={deleteCustomer}
              onSendEmail={(customer) => openModal('compose-email', customer)}
            />
          )}
          {!searchQuery && activeModule === 'tasks' && (
            <TasksModule 
              tasks={tasks} 
              customers={customers}
              staffMembers={staffMembers}
              onAdd={() => openModal('add-task')}
              onEdit={(task) => openModal('edit-task', task)}
              onDelete={deleteTask}
              onUpdateStatus={updateTaskStatus}
            />
          )}
          {!searchQuery && activeModule === 'emails' && (
            <EmailModule 
              emails={emails}
              customers={customers}
              onCompose={() => setActiveModule('compose')}
              onReply={(email) => openModal('compose-email', { email, type: 'reply' })}
              onMarkAsRead={markEmailAsRead}
              onToggleStar={toggleEmailStar}
              onDelete={deleteEmail}
              onFetchEmails={fetchEmails}
              onSyncEmails={syncEmails}
              emailConfig={emailConfig}
            />
          )}
          {!searchQuery && activeModule === 'compose' && (
            <ComposeEmailModule
              customers={customers}
              templates={emailTemplates}
              onSend={sendEmail}
              onQueue={queueEmail}
              staffMembers={staffMembers}
              emailConfig={emailConfig}
            />
          )}
          {!searchQuery && activeModule === 'email-setup' && (
            <EmailSetupModule
              emailConfig={emailConfig}
              onConfigUpdate={setEmailConfig}
              onTestEmail={sendEmail}
            />
          )}
        </main>
      </div>

      {/* Database Manager Modal */}
      {showDatabaseManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Database Management</h3>
              <button
                onClick={() => setShowDatabaseManager(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <DatabaseManager 
                onClose={() => setShowDatabaseManager(false)} 
                onConnectionChange={setIsDatabaseConnected}
                isDatabaseConnected={isDatabaseConnected}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <Modal onClose={closeModal}>
          {modalType === 'add-customer' && (
            <CustomerForm onSubmit={addCustomer} />
          )}
          {modalType === 'edit-customer' && selectedItem && (
            <CustomerForm customer={selectedItem} onSubmit={updateCustomer} />
          )}
          {modalType === 'add-task' && (
            <TaskForm 
              customers={customers} 
              staffMembers={staffMembers} 
              onSubmit={addTask} 
            />
          )}
          {modalType === 'edit-task' && selectedItem && (
            <TaskForm 
              task={selectedItem}
              customers={customers} 
              staffMembers={staffMembers} 
              onSubmit={updateTask} 
            />
          )}
          {modalType === 'compose-email' && (
            <ComposeEmailForm
              customer={selectedItem?.email ? null : selectedItem}
              replyToEmail={selectedItem?.email}
              replyType={selectedItem?.type}
              customers={customers}
              templates={emailTemplates}
              staffMembers={staffMembers}
              onSend={sendEmail}
              onQueue={queueEmail}
              onClose={closeModal}
              emailConfig={emailConfig}
            />
          )}
        </Modal>
      )}
    </div>
  );
};

// Email Setup Module Component
const EmailSetupModule = ({ emailConfig, onConfigUpdate, onTestEmail }) => {
  const [activeTab, setActiveTab] = useState('smtp');
  const [isLoading, setIsLoading] = useState(false);
  const [testConfig, setTestConfig] = useState({
    host: '',
    port: 587,
    secure: false,
    user: '',
    password: '',
    testEmail: ''
  });
  const [testResult, setTestResult] = useState(null);

  const handleTestSMTP = async () => {
    if (!testConfig.host || !testConfig.user || !testConfig.password || !testConfig.testEmail) {
      setTestResult({ success: false, message: 'Please fill in all required fields' });
      return;
    }

    setIsLoading(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/test-smtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: testConfig,
          testEmail: testConfig.testEmail
        })
      });

      const result = await response.json();
      setTestResult(result);
    } catch (error) {
      setTestResult({ success: false, message: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'smtp', label: 'SMTP Setup', icon: <Send size={18} /> },
    { id: 'imap', label: 'IMAP Setup', icon: <Inbox size={18} /> },
    { id: 'sendgrid', label: 'SendGrid', icon: <Mail size={18} /> }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Email Configuration</h3>
        <p className="text-gray-600">Configure your email settings to send and receive emails</p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className={`p-4 rounded-lg border ${emailConfig.smtp?.configured ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-center">
            <Send className={`mr-3 ${emailConfig.smtp?.configured ? 'text-green-600' : 'text-red-600'}`} size={20} />
            <div>
              <p className="font-medium">SMTP</p>
              <p className="text-sm text-gray-600">{emailConfig.smtp?.configured ? 'Configured' : 'Not Configured'}</p>
            </div>
          </div>
        </div>
        
        <div className={`p-4 rounded-lg border ${emailConfig.imap?.configured ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
          <div className="flex items-center">
            <Inbox className={`mr-3 ${emailConfig.imap?.configured ? 'text-green-600' : 'text-yellow-600'}`} size={20} />
            <div>
              <p className="font-medium">IMAP</p>
              <p className="text-sm text-gray-600">{emailConfig.imap?.configured ? 'Configured' : 'Optional'}</p>
            </div>
          </div>
        </div>
        
        <div className={`p-4 rounded-lg border ${emailConfig.sendgrid?.configured ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
          <div className="flex items-center">
            <Mail className={`mr-3 ${emailConfig.sendgrid?.configured ? 'text-green-600' : 'text-yellow-600'}`} size={20} />
            <div>
              <p className="font-medium">SendGrid</p>
              <p className="text-sm text-gray-600">{emailConfig.sendgrid?.configured ? 'Configured' : 'Alternative'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b mb-6">
        <nav className="flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'smtp' && (
        <div className="bg-white border rounded-lg p-6">
          <h4 className="text-lg font-medium mb-4">SMTP Configuration</h4>
          <p className="text-gray-600 mb-6">Configure SMTP to send emails from your CRM system.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Host *</label>
              <input
                type="text"
                value={testConfig.host}
                onChange={(e) => setTestConfig({...testConfig, host: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="smtp.gmail.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Port</label>
              <input
                type="number"
                value={testConfig.port}
                onChange={(e) => setTestConfig({...testConfig, port: parseInt(e.target.value)})}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="587"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username/Email *</label>
              <input
                type="email"
                value={testConfig.user}
                onChange={(e) => setTestConfig({...testConfig, user: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="your-email@gmail.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
              <input
                type="password"
                value={testConfig.password}
                onChange={(e) => setTestConfig({...testConfig, password: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Your app password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Test Email *</label>
              <input
                type="email"
                value={testConfig.testEmail}
                onChange={(e) => setTestConfig({...testConfig, testEmail: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="test@example.com"
              />
            </div>
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={testConfig.secure}
                  onChange={(e) => setTestConfig({...testConfig, secure: e.target.checked})}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Use TLS/SSL</span>
              </label>
            </div>
          </div>

          <button
            onClick={handleTestSMTP}
            disabled={isLoading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            {isLoading ? (
              <RefreshCw className="animate-spin mr-2" size={16} />
            ) : (
              <Send className="mr-2" size={16} />
            )}
            Test SMTP Configuration
          </button>

          {testResult && (
            <div className={`mt-4 p-4 rounded-lg ${
              testResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              <p className="font-medium">
                {testResult.success ? '✅ Success!' : '❌ Error'}
              </p>
              <p className="text-sm mt-1">{testResult.message}</p>
              {testResult.details && (
                <p className="text-xs mt-2 font-mono">{testResult.details}</p>
              )}
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h5 className="font-medium text-blue-800 mb-2">Environment Variables Required:</h5>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• SMTP_HOST={testConfig.host}</p>
              <p>• SMTP_PORT={testConfig.port}</p>
              <p>• SMTP_USER={testConfig.user}</p>
              <p>• SMTP_PASSWORD=your_app_password</p>
              <p>• SMTP_SECURE={testConfig.secure ? 'true' : 'false'}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'imap' && (
        <div className="bg-white border rounded-lg p-6">
          <h4 className="text-lg font-medium mb-4">IMAP Configuration</h4>
          <p className="text-gray-600 mb-6">Configure IMAP to receive and sync emails automatically.</p>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800 text-sm">
              <strong>Note:</strong> IMAP is optional but recommended for two-way email synchronization.
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-medium text-gray-800 mb-2">Required Environment Variables:</h5>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>• IMAP_HOST=imap.gmail.com</p>
                  <p>• IMAP_PORT=993</p>
                  <p>• IMAP_USER=your-email@gmail.com</p>
                  <p>• IMAP_PASSWORD=your_app_password</p>
                  <p>• IMAP_SECURE=true</p>
                </div>
              </div>
              <div>
                <h5 className="font-medium text-gray-800 mb-2">Features:</h5>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>• Automatic email fetching</p>
                  <p>• Customer email matching</p>
                  <p>• Thread organization</p>
                  <p>• Attachment handling</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'sendgrid' && (
        <div className="bg-white border rounded-lg p-6">
          <h4 className="text-lg font-medium mb-4">SendGrid Configuration</h4>
          <p className="text-gray-600 mb-6">Alternative email service with advanced features and analytics.</p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-800 text-sm">
              <strong>SendGrid:</strong> Reliable email delivery with analytics and high deliverability rates.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <h5 className="font-medium text-gray-800 mb-2">Required Environment Variable:</h5>
              <p className="text-sm text-gray-600">• SENDGRID_API_KEY=your_sendgrid_api_key</p>
            </div>
            
            <div>
              <h5 className="font-medium text-gray-800 mb-2">Setup Instructions:</h5>
              <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                <li>Create a SendGrid account at sendgrid.com</li>
                <li>Generate an API key in your SendGrid dashboard</li>
                <li>Add SENDGRID_API_KEY to your environment variables</li>
                <li>Test email sending through the bulk email feature</li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced Dashboard Component
const Dashboard = ({ customers, tasks, emails, isDatabaseConnected, emailConfig }) => {
  const stats = {
    totalCustomers: customers.length,
    activeDeals: customers.filter(c => c.status === 'Active').length,
    pendingTasks: tasks.filter(t => t.status === 'Pending').length,
    unreadEmails: emails.filter(e => !e.isRead).length,
    totalRevenue: customers.reduce((sum, c) => sum + c.orderValue, 0),
    sentEmails: emails.filter(e => e.type === 'outgoing').length,
    databaseStatus: isDatabaseConnected ? 'Connected' : 'Offline',
    emailStatus: emailConfig.smtp?.configured || emailConfig.sendgrid?.configured ? 'Configured' : 'Not Configured'
  };

  const recentEmails = emails.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard 
          title="Total Customers" 
          value={stats.totalCustomers} 
          icon={<Users />} 
          color="blue"
        />
        <DashboardCard 
          title="Pending Tasks" 
          value={stats.pendingTasks} 
          icon={<CheckSquare />} 
          color="yellow"
        />
        <DashboardCard 
          title="Unread Emails" 
          value={stats.unreadEmails} 
          icon={<Mail />} 
          color="red"
        />
        <DashboardCard 
          title="Email Setup" 
          value={stats.emailStatus} 
          icon={<Settings2 />} 
          color={emailConfig.smtp?.configured || emailConfig.sendgrid?.configured ? "green" : "red"}
        />
      </div>

      {/* Email Configuration Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">📧 Email System Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center mb-3">
              <Send className={`mr-2 ${emailConfig.smtp?.configured ? 'text-green-600' : 'text-red-600'}`} size={20} />
              <h4 className="font-medium text-blue-800">SMTP Email Sending</h4>
            </div>
            <p className="text-sm text-blue-700">
              {emailConfig.smtp?.configured ? 'Ready to send emails via SMTP' : 'SMTP not configured - emails will fail'}
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center mb-3">
              <Inbox className={`mr-2 ${emailConfig.imap?.configured ? 'text-green-600' : 'text-yellow-600'}`} size={20} />
              <h4 className="font-medium text-green-800">IMAP Email Sync</h4>
            </div>
            <p className="text-sm text-green-700">
              {emailConfig.imap?.configured ? 'Email synchronization enabled' : 'Optional - for incoming email sync'}
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center mb-3">
              <Mail className={`mr-2 ${emailConfig.sendgrid?.configured ? 'text-green-600' : 'text-purple-600'}`} size={20} />
              <h4 className="font-medium text-purple-800">SendGrid Alternative</h4>
            </div>
            <p className="text-sm text-purple-700">
              {emailConfig.sendgrid?.configured ? 'SendGrid configured for bulk emails' : 'Alternative service for high-volume sending'}
            </p>
          </div>
        </div>
      </div>

      {/* Database Features Showcase */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">🗄️ Database Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center mb-3">
              <Database className="text-blue-600 mr-2" size={20} />
              <h4 className="font-medium text-blue-800">PostgreSQL Storage</h4>
            </div>
            <p className="text-sm text-blue-700">Persistent data storage with ACID compliance and automatic backups</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center mb-3">
              <Download className="text-green-600 mr-2" size={20} />
              <h4 className="font-medium text-green-800">Export/Import</h4>
            </div>
            <p className="text-sm text-green-700">JSON and CSV data export/import capabilities for data portability</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center mb-3">
              <Shield className="text-purple-600 mr-2" size={20} />
              <h4 className="font-medium text-purple-800">Backup & Restore</h4>
            </div>
            <p className="text-sm text-purple-700">Complete database backup and restore functionality for data safety</p>
          </div>
        </div>
      </div>

      {/* Recent Email Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Recent Email Activity</h3>
        <div className="space-y-3">
          {recentEmails.map(email => (
            <div key={email.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${
                  email.type === 'outgoing' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                }`}>
                  {email.type === 'outgoing' ? <Send size={16} /> : <Mail size={16} />}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{email.subject}</p>
                  <p className="text-sm text-gray-500">{email.customerName} • {email.timestamp}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                email.status === 'sent' ? 'bg-green-100 text-green-800' :
                email.status === 'delivered' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {email.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const DashboardCard = ({ title, value, icon, color }) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    yellow: 'text-yellow-600 bg-yellow-100',
    red: 'text-red-600 bg-red-100',
    purple: 'text-purple-600 bg-purple-100'
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
};

// Enhanced Search Results Component
const SearchResults = ({ results, onClearSearch }) => {
  const totalResults = results.customers.length + results.tasks.length + results.emails.length;

  if (totalResults === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="text-center py-8">
          <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
          <p className="text-gray-500 mb-4">Try adjusting your search terms</p>
          <button
            onClick={onClearSearch}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Clear search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Search Results ({totalResults})</h3>
        <button
          onClick={onClearSearch}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          Clear search
        </button>
      </div>
      
      {results.customers.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-700 mb-3">Customers ({results.customers.length})</h4>
          <div className="space-y-2">
            {results.customers.map(customer => (
              <div key={customer.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div>
                  <p className="font-medium">{customer.name}</p>
                  <p className="text-sm text-gray-500">{customer.email} • {customer.company}</p>
                </div>
                <Eye size={16} className="text-blue-600" />
              </div>
            ))}
          </div>
        </div>
      )}

      {results.tasks.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-700 mb-3">Tasks ({results.tasks.length})</h4>
          <div className="space-y-2">
            {results.tasks.map(task => (
              <div key={task.id} className="p-3 border rounded-lg hover:bg-gray-50">
                <p className="font-medium">{task.title}</p>
                <p className="text-sm text-gray-500">{task.customerName} • Due: {task.dueDate}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {results.emails.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-700 mb-3">Emails ({results.emails.length})</h4>
          <div className="space-y-2">
            {results.emails.map(email => (
              <div key={email.id} className="p-3 border rounded-lg hover:bg-gray-50">
                <p className="font-medium">{email.subject}</p>
                <p className="text-sm text-gray-500">{email.customerName} • {email.timestamp}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced Customers Module
const CustomersModule = ({ customers, onAdd, onEdit, onDelete, onSendEmail }) => {
  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Customer Management</h3>
          <p className="text-gray-600">{customers.length} total customers</p>
        </div>
        <button
          onClick={onAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center transition-colors"
        >
          <Plus size={16} className="mr-2" />
          Add Customer
        </button>
      </div>

      {/* Customer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {customers.map(customer => (
          <CustomerCard
            key={customer.id}
            customer={customer}
            onEdit={() => onEdit(customer)}
            onDelete={() => onDelete(customer.id)}
            onSendEmail={() => onSendEmail(customer)}
          />
        ))}
      </div>

      {customers.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No customers yet</h3>
          <p className="text-gray-500 mb-4">Get started by adding your first customer</p>
          <button
            onClick={onAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 inline-flex items-center"
          >
            <Plus size={16} className="mr-2" />
            Add Your First Customer
          </button>
        </div>
      )}
    </div>
  );
};

// Customer Card Component
const CustomerCard = ({ customer, onEdit, onDelete, onSendEmail }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="text-blue-600" size={20} />
          </div>
          <div>
            <h4 className="font-medium text-gray-900">{customer.name}</h4>
            <p className="text-sm text-gray-500">{customer.company}</p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          customer.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {customer.status}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <Mail className="mr-2" size={14} />
          {customer.email}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Phone className="mr-2" size={14} />
          {customer.phone || 'No phone'}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Building className="mr-2" size={14} />
          ${customer.orderValue.toLocaleString()}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t">
        <div className="text-xs text-gray-500">
          Created: {customer.created}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={onSendEmail}
            className="text-green-600 hover:text-green-800 p-2 rounded-full hover:bg-green-50"
            title="Send Email"
          >
            <Send size={14} />
          </button>
          <button
            onClick={onEdit}
            className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50"
            title="Edit Customer"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={onDelete}
            className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50"
            title="Delete Customer"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

// Enhanced Tasks Module
const TasksModule = ({ tasks, customers, staffMembers, onAdd, onEdit, onDelete, onUpdateStatus }) => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  const filteredTasks = tasks.filter(task => {
    const statusMatch = filterStatus === 'all' || task.status === filterStatus;
    const priorityMatch = filterPriority === 'all' || task.priority === filterPriority;
    return statusMatch && priorityMatch;
  });

  const taskStats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'Pending').length,
    inProgress: tasks.filter(t => t.status === 'In Progress').length,
    completed: tasks.filter(t => t.status === 'Completed').length
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Task Management</h3>
          <p className="text-gray-600">{tasks.length} total tasks</p>
        </div>
        <button
          onClick={onAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center transition-colors"
        >
          <Plus size={16} className="mr-2" />
          Add Task
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-gray-900">{taskStats.total}</div>
          <div className="text-sm text-gray-500">Total Tasks</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-yellow-600">{taskStats.pending}</div>
          <div className="text-sm text-gray-500">Pending</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-blue-600">{taskStats.inProgress}</div>
          <div className="text-sm text-gray-500">In Progress</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-green-600">{taskStats.completed}</div>
          <div className="text-sm text-gray-500">Completed</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={() => onEdit(task)}
            onDelete={() => onDelete(task.id)}
            onUpdateStatus={onUpdateStatus}
          />
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <CheckSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
          <p className="text-gray-500 mb-4">
            {tasks.length === 0 ? 'Get started by creating your first task' : 'Try adjusting your filters'}
          </p>
          {tasks.length === 0 && (
            <button
              onClick={onAdd}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 inline-flex items-center"
            >
              <Plus size={16} className="mr-2" />
              Create Your First Task
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// Task Card Component
const TaskCard = ({ task, onEdit, onDelete, onUpdateStatus }) => {
  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'Completed';

  return (
    <div className={`bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow ${
      isOverdue ? 'border-l-4 border-red-500' : ''
    }`}>
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-medium text-gray-900 flex-1 mr-2">{task.title}</h4>
        <div className="flex space-x-1">
          <button
            onClick={onEdit}
            className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={onDelete}
            className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      
      <p className="text-gray-600 text-sm mb-4">{task.description}</p>
      
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Customer:</span>
          <span className="font-medium text-gray-900">{task.customerName}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Assigned to:</span>
          <span className="font-medium text-gray-900">{task.assignedTo}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Due date:</span>
          <span className={`font-medium ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
            {task.dueDate}
          </span>
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          task.status === 'Completed' ? 'bg-green-100 text-green-800' :
          task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {task.status}
        </span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          task.priority === 'High' ? 'bg-red-100 text-red-800' :
          task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
          'bg-green-100 text-green-800'
        }`}>
          {task.priority}
        </span>
      </div>

      <div className="pt-3 border-t">
        <label className="block text-xs text-gray-500 mb-1">Quick Status Update:</label>
        <select
          value={task.status}
          onChange={(e) => onUpdateStatus(task.id, e.target.value)}
          className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
      </div>
    </div>
  );
};

// Enhanced Email Module
const EmailModule = ({ 
  emails, 
  customers, 
  onCompose, 
  onReply, 
  onMarkAsRead, 
  onToggleStar, 
  onDelete, 
  onFetchEmails, 
  onSyncEmails,
  emailConfig 
}) => {
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('timestamp');

  const filteredEmails = emails.filter(email => {
    const typeMatch = filterType === 'all' || email.type === filterType;
    const statusMatch = filterStatus === 'all' || 
      (filterStatus === 'unread' && !email.isRead) ||
      (filterStatus === 'starred' && email.isStarred) ||
      email.status === filterStatus;
    return typeMatch && statusMatch;
  }).sort((a, b) => {
    if (sortBy === 'timestamp') {
      return new Date(b.timestamp) - new Date(a.timestamp);
    }
    return a[sortBy].localeCompare(b[sortBy]);
  });

  const emailStats = {
    total: emails.length,
    incoming: emails.filter(e => e.type === 'incoming').length,
    outgoing: emails.filter(e => e.type === 'outgoing').length,
    unread: emails.filter(e => !e.isRead).length,
    starred: emails.filter(e => e.isStarred).length
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Email Management</h3>
          <p className="text-gray-600">{emails.length} total emails</p>
        </div>
        <div className="flex space-x-3">
          {emailConfig.imap?.configured && (
            <>
              <button
                onClick={onFetchEmails}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center transition-colors"
              >
                <Inbox size={16} className="mr-2" />
                Fetch Emails
              </button>
              <button
                onClick={onSyncEmails}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center transition-colors"
              >
                <RefreshCw size={16} className="mr-2" />
                Sync
              </button>
            </>
          )}
          <button
            onClick={onCompose}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center transition-colors"
          >
            <Send size={16} className="mr-2" />
            Compose Email
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-gray-900">{emailStats.total}</div>
          <div className="text-sm text-gray-500">Total Emails</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-blue-600">{emailStats.incoming}</div>
          <div className="text-sm text-gray-500">Incoming</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-green-600">{emailStats.outgoing}</div>
          <div className="text-sm text-gray-500">Outgoing</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-red-600">{emailStats.unread}</div>
          <div className="text-sm text-gray-500">Unread</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-yellow-600">{emailStats.starred}</div>
          <div className="text-sm text-gray-500">Starred</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="incoming">Incoming</option>
              <option value="outgoing">Outgoing</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Emails</option>
              <option value="unread">Unread</option>
              <option value="starred">Starred</option>
              <option value="sent">Sent</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort by</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="timestamp">Date</option>
              <option value="subject">Subject</option>
              <option value="customerName">Customer</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredEmails.map(email => (
          <EmailCard
            key={email.id}
            email={email}
            onReply={() => onReply(email)}
            onMarkAsRead={onMarkAsRead}
            onToggleStar={onToggleStar}
            onDelete={onDelete}
          />
        ))}
      </div>

      {filteredEmails.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Mail className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No emails found</h3>
          <p className="text-gray-500 mb-4">
            {emails.length === 0 ? 'Start by composing your first email' : 'Try adjusting your filters'}
          </p>
          {emails.length === 0 && (
            <button
              onClick={onCompose}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 inline-flex items-center"
            >
              <Send size={16} className="mr-2" />
              Compose Your First Email
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// Enhanced Email Card Component
const EmailCard = ({ email, onReply, onMarkAsRead, onToggleStar, onDelete }) => {
  return (
    <div className={`bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow ${
      !email.isRead ? 'border-l-4 border-blue-500' : ''
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3 flex-1">
          <div className={`p-2 rounded-full ${
            email.type === 'outgoing' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
          }`}>
            {email.type === 'outgoing' ? <Send size={16} /> : <Mail size={16} />}
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h4 className="font-medium text-gray-900">{email.subject}</h4>
              {email.isStarred && <Star className="text-yellow-500" size={16} fill="currentColor" />}
              {!email.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
            </div>
            <p className="text-sm text-gray-500">{email.customerName}</p>
            <p className="text-xs text-gray-400">{email.from} → {email.to}</p>
            {email.cc && <p className="text-xs text-gray-400">CC: {email.cc}</p>}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            email.status === 'sent' ? 'bg-green-100 text-green-800' :
            email.status === 'delivered' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {email.status}
          </span>
          <div className="flex space-x-1">
            <button
              onClick={() => onMarkAsRead(email.id, !email.isRead)}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-50"
              title={email.isRead ? "Mark as unread" : "Mark as read"}
            >
              <Eye size={16} />
            </button>
            <button
              onClick={() => onToggleStar(email.id)}
              className={`p-1 rounded-full hover:bg-yellow-50 ${
                email.isStarred ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'
              }`}
              title={email.isStarred ? "Remove star" : "Add star"}
            >
              <Star size={16} fill={email.isStarred ? "currentColor" : "none"} />
            </button>
            <button
              onClick={() => onReply(email)}
              className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50"
              title="Reply"
            >
              <Send size={16} />
            </button>
            <button
              onClick={() => onDelete(email.id)}
              className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50"
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
      
      <p className="text-gray-700 mb-4 line-clamp-3">{email.body}</p>
      
      {email.attachments && email.attachments.length > 0 && (
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <Paperclip size={14} className="mr-1" />
          {email.attachments.length} attachment(s)
        </div>
      )}
      
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{email.timestamp}</span>
        <div className="flex items-center space-x-4">
          {email.priority && email.priority !== 'normal' && (
            <span className={`px-2 py-1 rounded-full text-xs ${
              email.priority === 'high' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {email.priority}
            </span>
          )}
          {email.smtpMessageId && (
            <span>ID: {email.smtpMessageId}</span>
          )}
        </div>
      </div>
    </div>
  );
};

// Enhanced Compose Email Module
const ComposeEmailModule = ({ customers, templates, onSend, onQueue, staffMembers, emailConfig }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      {(!emailConfig.smtp?.configured && !emailConfig.sendgrid?.configured) && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="text-red-600 mr-3" size={20} />
            <div className="flex-1">
              <p className="text-red-800 font-medium">Email Not Configured</p>
              <p className="text-red-700 text-sm">
                Configure SMTP or SendGrid settings before sending emails.
              </p>
            </div>
          </div>
        </div>
      )}
      <ComposeEmailForm
        customers={customers}
        templates={templates}
        staffMembers={staffMembers}
        onSend={onSend}
        onQueue={onQueue}
        isStandalone={true}
        emailConfig={emailConfig}
      />
    </div>
  );
};

// Enhanced Compose Email Form Component
const ComposeEmailForm = ({ 
  customer, 
  replyToEmail, 
  replyType, 
  customers, 
  templates, 
  staffMembers, 
  onSend, 
  onQueue, 
  onClose,
  isStandalone = false,
  emailConfig 
}) => {
  const [formData, setFormData] = useState({
    from: staffMembers[0]?.email || 'sales@company.com',
    to: customer?.email || replyToEmail?.from || '',
    cc: '',
    bcc: '',
    subject: replyType === 'reply' ? `Re: ${replyToEmail?.subject}` : '',
    body: replyType === 'reply' ? `\n\n--- Original Message ---\n${replyToEmail?.body}` : '',
    customerId: customer?.id || '',
    customerName: customer?.name || '',
    template: '',
    priority: 'normal',
    attachments: []
  });

  const [errors, setErrors] = useState({});
  const [showTemplates, setShowTemplates] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.to.trim()) newErrors.to = 'Recipient email is required';
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.body.trim()) newErrors.body = 'Email body is required';
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.to && !emailRegex.test(formData.to)) {
      newErrors.to = 'Invalid email format';
    }
    if (formData.cc && formData.cc.trim() && !emailRegex.test(formData.cc.trim())) {
      newErrors.cc = 'Invalid CC email format';
    }
    if (formData.bcc && formData.bcc.trim() && !emailRegex.test(formData.bcc.trim())) {
      newErrors.bcc = 'Invalid BCC email format';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const applyTemplate = (template) => {
    const selectedCustomer = customers.find(c => c.id === parseInt(formData.customerId)) || customer;
    const senderName = staffMembers.find(s => s.email === formData.from)?.name || 'Team';
    
    let subject = template.subject
      .replace('{{customer_name}}', selectedCustomer?.name || '')
      .replace('{{company_name}}', selectedCustomer?.company || 'Our Company');
    
    let body = template.body
      .replace('{{customer_name}}', selectedCustomer?.name || '')
      .replace('{{company_name}}', selectedCustomer?.company || 'Our Company')
      .replace('{{sender_name}}', senderName)
      .replace('{{topic}}', '')
      .replace('{{project_name}}', '');
    
    setFormData({ ...formData, subject, body, template: template.id });
    setShowTemplates(false);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsLoading(true);
      const emailData = {
        ...formData,
        customerId: parseInt(formData.customerId) || null,
        customerName: formData.customerName || customers.find(c => c.email === formData.to)?.name || ''
      };
      
      const success = await onSend(emailData);
      if (success && onClose) {
        onClose();
      }
      setIsLoading(false);
    }
  };

  const handleQueue = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      const emailData = {
        ...formData,
        customerId: parseInt(formData.customerId) || null,
        customerName: formData.customerName || customers.find(c => c.email === formData.to)?.name || ''
      };
      
      onQueue(emailData);
      if (onClose) {
        onClose();
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {replyType === 'reply' ? 'Reply to Email' : 'Compose New Email'}
        </h3>
        <p className="text-gray-600">Send professional emails to your customers with templates and tracking</p>
      </div>

      <form onSubmit={handleSend} className="space-y-6">
        {/* Email Header Section */}
        <div className="bg-gray-50 rounded-lg p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
              <select
                value={formData.from}
                onChange={(e) => setFormData({ ...formData, from: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {staffMembers.map(staff => (
                  <option key={staff.id} value={staff.email}>
                    {staff.name} ({staff.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
              <select
                value={formData.customerId}
                onChange={(e) => {
                  const selectedCustomer = customers.find(c => c.id === parseInt(e.target.value));
                  setFormData({
                    ...formData,
                    customerId: e.target.value,
                    to: selectedCustomer?.email || formData.to,
                    customerName: selectedCustomer?.name || ''
                  });
                }}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Customer (Optional)</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} ({customer.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To *</label>
            <input
              type="email"
              value={formData.to}
              onChange={(e) => setFormData({ ...formData, to: e.target.value })}
              className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.to ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="recipient@example.com"
            />
            {errors.to && <p className="text-red-500 text-sm mt-1">{errors.to}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CC</label>
              <input
                type="email"
                value={formData.cc}
                onChange={(e) => setFormData({ ...formData, cc: e.target.value })}
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.cc ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="cc@example.com"
              />
              {errors.cc && <p className="text-red-500 text-sm mt-1">{errors.cc}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">BCC</label>
              <input
                type="email"
                value={formData.bcc}
                onChange={(e) => setFormData({ ...formData, bcc: e.target.value })}
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.bcc ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="bcc@example.com"
              />
              {errors.bcc && <p className="text-red-500 text-sm mt-1">{errors.bcc}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.subject ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter email subject"
            />
            {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Low Priority</option>
              <option value="normal">Normal Priority</option>
              <option value="high">High Priority</option>
            </select>
          </div>
        </div>

        {/* Template Section */}
        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-gray-900">Email Templates</h4>
            <button
              type="button"
              onClick={() => setShowTemplates(!showTemplates)}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              {showTemplates ? 'Hide Templates' : 'Show Templates'}
            </button>
          </div>
          
          {showTemplates && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {templates.map(template => (
                <div
                  key={template.id}
                  className="border rounded-lg p-4 cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  onClick={() => applyTemplate(template)}
                >
                  <h5 className="font-medium text-gray-900 mb-2">{template.name}</h5>
                  <p className="text-sm text-gray-600 mb-2">{template.subject}</p>
                  <p className="text-xs text-gray-500 line-clamp-3">{template.body.substring(0, 100)}...</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Email Body */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
          <textarea
            value={formData.body}
            onChange={(e) => setFormData({ ...formData, body: e.target.value })}
            rows={12}
            className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.body ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Write your email message here..."
          />
          {errors.body && <p className="text-red-500 text-sm mt-1">{errors.body}</p>}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6 border-t">
          <div className="flex items-center space-x-4">
            <button
              type="submit"
              disabled={isLoading || (!emailConfig.smtp?.configured && !emailConfig.sendgrid?.configured)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send size={16} className="mr-2" />
                  Send Email
                </>
              )}
            </button>
            
            <button
              type="button"
              onClick={handleQueue}
              disabled={isLoading}
              className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
            >
              <Clock size={16} className="mr-2" />
              Add to Queue
            </button>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

// Database Manager Component
const DatabaseManager = ({ onClose, onConnectionChange, isDatabaseConnected }) => {
  const [activeTab, setActiveTab] = useState('status');
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [exportData, setExportData] = useState({ table: 'customers', format: 'json' });

  const testConnection = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/database/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const result = await response.json();
      setConnectionStatus(result);
      
      if (result.success) {
        onConnectionChange(true);
      }
    } catch (error) {
      setConnectionStatus({ 
        success: false, 
        message: 'Failed to connect to database',
        error: error.message 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/database/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exportData)
      });

      if (exportData.format === 'csv') {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${exportData.table}_export_${Date.now()}.csv`;
        a.click();
      } else {
        const result = await response.json();
        if (result.success) {
          const dataStr = JSON.stringify(result, null, 2);
          const blob = new Blob([dataStr], { type: 'application/json' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${exportData.table}_export_${Date.now()}.json`;
          a.click();
        }
      }
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackup = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/database/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const result = await response.json();
      
      if (result.success) {
        const dataStr = JSON.stringify(result.backup, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `crm_backup_${Date.now()}.json`;
        a.click();
      }
    } catch (error) {
      console.error('Backup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'status', label: 'Status', icon: <Database size={18} /> },
    { id: 'export', label: 'Export', icon: <Download size={18} /> },
    { id: 'backup', label: 'Backup', icon: <Shield size={18} /> },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Database Management</h3>
        <p className="text-gray-600">Manage your CRM data persistence, exports, and backups</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b mb-6">
        <nav className="flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'status' && (
        <div className="space-y-6">
          <div className="bg-white border rounded-lg p-6">
            <h4 className="text-lg font-medium mb-4">Database Connection Status</h4>
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${isDatabaseConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="font-medium">
                  {isDatabaseConnected ? 'Connected to PostgreSQL' : 'Not Connected'}
                </span>
              </div>
              
              <button
                onClick={testConnection}
                disabled={isLoading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
              >
                {isLoading ? (
                  <RefreshCw className="animate-spin" size={16} />
                ) : (
                  <Database size={16} />
                )}
                <span>Test Connection</span>
              </button>
            </div>

            {connectionStatus && (
              <div className={`p-4 rounded-lg mb-4 ${
                connectionStatus.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              }`}>
                <p className="font-medium">
                  {connectionStatus.success ? '✅ Success!' : '❌ Error'}
                </p>
                <p className="text-sm mt-1">{connectionStatus.message}</p>
                {connectionStatus.error && (
                  <p className="text-xs mt-2 font-mono">{connectionStatus.error}</p>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Database Type:</span>
                <span className="ml-2 font-medium">PostgreSQL</span>
              </div>
              <div>
                <span className="text-gray-500">Platform:</span>
                <span className="ml-2 font-medium">Vercel Serverless</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h5 className="font-medium text-blue-800 mb-2">Setup Instructions:</h5>
            <ol className="text-sm text-blue-700 space-y-1">
              <li>1. Set up PostgreSQL database (Vercel Postgres, Neon, or Supabase)</li>
              <li>2. Add DATABASE_URL environment variable in Vercel</li>
              <li>3. Test connection to initialize database tables</li>
              <li>4. Import existing data or start fresh</li>
            </ol>
          </div>
        </div>
      )}

      {activeTab === 'export' && (
        <div className="space-y-6">
          <div className="bg-white border rounded-lg p-6">
            <h4 className="text-lg font-medium mb-4">Export Data</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Table</label>
                <select
                  value={exportData.table}
                  onChange={(e) => setExportData({ ...exportData, table: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="customers">Customers</option>
                  <option value="tasks">Tasks</option>
                  <option value="emails">Emails</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
                <select
                  value={exportData.format}
                  onChange={(e) => setExportData({ ...exportData, format: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="json">JSON</option>
                  <option value="csv">CSV</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleExport}
              disabled={isLoading || !isDatabaseConnected}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
            >
              {isLoading ? (
                <RefreshCw className="animate-spin" size={16} />
              ) : (
                <Download size={16} />
              )}
              <span>Export {exportData.table}</span>
            </button>
          </div>
        </div>
      )}

      {activeTab === 'backup' && (
        <div className="space-y-6">
          <div className="bg-white border rounded-lg p-6">
            <h4 className="text-lg font-medium mb-4">Database Backup</h4>
            
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-medium text-gray-800 mb-2">Full Database Backup</h5>
                <p className="text-sm text-gray-600 mb-4">
                  Creates a complete backup of all your CRM data including customers, tasks, emails, and templates.
                </p>
                
                <button
                  onClick={handleBackup}
                  disabled={isLoading || !isDatabaseConnected}
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center space-x-2"
                >
                  {isLoading ? (
                    <RefreshCw className="animate-spin" size={16} />
                  ) : (
                    <Shield size={16} />
                  )}
                  <span>Create Full Backup</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Close Button */}
      <div className="flex justify-end pt-6 border-t">
        <button
          onClick={onClose}
          className="px-6 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

// Modal Component
const Modal = ({ children, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Modal</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

// Customer Form Component
const CustomerForm = ({ customer, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: customer?.name || '',
    email: customer?.email || '',
    phone: customer?.phone || '',
    company: customer?.company || '',
    address: customer?.address || '',
    status: customer?.status || 'Lead',
    orderValue: customer?.orderValue || 0,
    tags: customer?.tags?.join(', ') || ''
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">
        {customer ? 'Edit Customer' : 'Add New Customer'}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
          <input
            type="text"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Lead">Lead</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Order Value ($)</label>
          <input
            type="number"
            value={formData.orderValue}
            onChange={(e) => setFormData({ ...formData, orderValue: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
            step="0.01"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
        <textarea
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          rows={2}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
        <input
          type="text"
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="VIP, Enterprise, Hot Lead"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center transition-colors"
        >
          <Save size={16} className="mr-2" />
          {customer ? 'Update Customer' : 'Add Customer'}
        </button>
      </div>
    </form>
  );
};

// Task Form Component
const TaskForm = ({ task, customers, staffMembers, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    customerId: task?.customerId || '',
    assignedTo: task?.assignedTo || '',
    priority: task?.priority || 'Medium',
    dueDate: task?.dueDate || '',
    tags: task?.tags?.join(', ') || ''
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.customerId) newErrors.customerId = 'Customer is required';
    if (!formData.assignedTo) newErrors.assignedTo = 'Assigned to is required';
    if (!formData.dueDate) newErrors.dueDate = 'Due date is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">
        {task ? 'Edit Task' : 'Create New Task'}
      </h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.title ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Customer *</label>
          <select
            value={formData.customerId}
            onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
            className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.customerId ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select Customer</option>
            {customers.map(customer => (
              <option key={customer.id} value={customer.id}>
                {customer.name} ({customer.company})
              </option>
            ))}
          </select>
          {errors.customerId && <p className="text-red-500 text-sm mt-1">{errors.customerId}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To *</label>
          <select
            value={formData.assignedTo}
            onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
            className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.assignedTo ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select Staff Member</option>
            {staffMembers.map(staff => (
              <option key={staff.id} value={staff.name}>
                {staff.name} ({staff.role})
              </option>
            ))}
          </select>
          {errors.assignedTo && <p className="text-red-500 text-sm mt-1">{errors.assignedTo}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
          <input
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.dueDate ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.dueDate && <p className="text-red-500 text-sm mt-1">{errors.dueDate}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
        <input
          type="text"
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Sales, Follow-up, Demo"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center transition-colors"
        >
          <Save size={16} className="mr-2" />
          {task ? 'Update Task' : 'Create Task'}
        </button>
      </div>
    </form>
  );
};

export default CRM;