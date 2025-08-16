// src/App.js - CRM WebApp with SMTP Email Functionality
import React, { useState, useMemo } from 'react';
import { 
  Search, Users, CheckSquare, Mail, Building, Settings, Menu, X, Eye, FileText,
  Plus, Edit2, Trash2, Save, User, Phone, Send, Paperclip, Clock, AlertCircle
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

// Enhanced email structure with SMTP tracking
const initialEmails = [
  {
    id: 1,
    customerId: 1,
    customerName: 'John Smith',
    subject: 'Re: Enterprise Package Inquiry',
    from: 'john.smith@example.com',
    to: 'sales@company.com',
    body: 'Hi, I am interested in learning more about your enterprise package.',
    timestamp: '2024-08-15 10:30:00',
    isRead: true,
    isStarred: false,
    thread: 'thread_1',
    type: 'incoming',
    status: 'delivered'
  },
  {
    id: 2,
    customerId: 2,
    customerName: 'Sarah Johnson',
    subject: 'Welcome to our CRM!',
    from: 'sales@company.com',
    to: 'sarah.j@techstart.com',
    body: 'Thank you for your interest in our services. We look forward to working with you.',
    timestamp: '2024-08-14 14:15:00',
    isRead: true,
    isStarred: false,
    thread: 'thread_2',
    type: 'outgoing',
    status: 'sent',
    smtpMessageId: 'msg_12345'
  }
];

// Email templates for common scenarios
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

// SMTP Configuration (would be stored securely in backend)
const smtpConfig = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  user: 'your-email@company.com',
  configured: false // Flag to show if SMTP is set up
};

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

  // Email sending state
  const [emailQueue, setEmailQueue] = useState([]);

  // Show notification helper
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
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

  // SMTP Email functionality
  const sendEmail = async (emailData) => {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData)
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
        cc: emailData.cc,
        bcc: emailData.bcc,
        body: emailData.body,
        timestamp: new Date().toLocaleString(),
        isRead: true,
        isStarred: false,
        thread: `thread_${Date.now()}`,
        type: 'outgoing',
        status: 'sent',
        smtpMessageId: result.messageId,
        attachments: emailData.attachments || []
      };

      setEmails([newEmail, ...emails]);
      showNotification('Email sent successfully!', 'success');
      return true;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Email send error:', error);
    showNotification('Failed to send email: ' + error.message, 'error');
    return false;
  }
};

// Update processEmailQueue function
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
            smtpMessageId: emailResult.messageId
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
        `${result.successful} emails sent successfully, ${result.failed} failed`,
        result.failed > 0 ? 'warning' : 'success'
      );
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Bulk email error:', error);
    showNotification('Failed to process email queue: ' + error.message, 'error');
  }
};

  // Customer CRUD operations (existing code)
  const addCustomer = (customerData) => {
    const newCustomer = {
      ...customerData,
      id: Math.max(...customers.map(c => c.id), 0) + 1,
      created: new Date().toISOString().split('T')[0],
      lastContact: '',
      source: 'Manual',
      orderValue: parseFloat(customerData.orderValue) || 0,
      tags: customerData.tags ? customerData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
    };
    setCustomers([...customers, newCustomer]);
    showNotification(`Customer "${newCustomer.name}" added successfully!`);
    closeModal();
  };

  const updateCustomer = (updatedData) => {
    const updatedCustomer = {
      ...updatedData,
      orderValue: parseFloat(updatedData.orderValue) || 0,
      tags: updatedData.tags ? updatedData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
    };
    setCustomers(customers.map(c => 
      c.id === selectedItem.id ? { ...c, ...updatedCustomer } : c
    ));
    showNotification(`Customer "${updatedCustomer.name}" updated successfully!`);
    closeModal();
  };

  const deleteCustomer = (id) => {
    const customer = customers.find(c => c.id === id);
    if (window.confirm(`Are you sure you want to delete "${customer.name}"?`)) {
      setCustomers(customers.filter(c => c.id !== id));
      setTasks(tasks.filter(t => t.customerId !== id));
      showNotification(`Customer "${customer.name}" deleted successfully!`);
    }
  };

  // Task CRUD operations (existing code)
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
    setTasks([...tasks, newTask]);
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
    setTasks(tasks.map(t => 
      t.id === selectedItem.id ? { ...t, ...updatedTask } : t
    ));
    showNotification(`Task "${updatedTask.title}" updated successfully!`);
    closeModal();
  };

  const deleteTask = (id) => {
    const task = tasks.find(t => t.id === id);
    if (window.confirm(`Are you sure you want to delete the task "${task.title}"?`)) {
      setTasks(tasks.filter(t => t.id !== id));
      showNotification(`Task "${task.title}" deleted successfully!`);
    }
  };

  const updateTaskStatus = (taskId, newStatus) => {
    setTasks(tasks.map(t => 
      t.id === taskId ? { ...t, status: newStatus } : t
    ));
    const task = tasks.find(t => t.id === taskId);
    showNotification(`Task "${task.title}" marked as ${newStatus}!`);
  };

  // Global search functionality (existing code)
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
      email.customerName.toLowerCase().includes(query)
    );
    
    return { customers: customerResults, tasks: taskResults, emails: emailResults };
  }, [searchQuery, customers, tasks, emails]);

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <Settings size={20} /> },
    { id: 'customers', label: 'Customers', icon: <Users size={20} /> },
    { id: 'tasks', label: 'Tasks', icon: <CheckSquare size={20} /> },
    { id: 'emails', label: 'Emails', icon: <Mail size={20} /> },
    { id: 'compose', label: 'Compose', icon: <Send size={20} /> }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
          notification.type === 'success' ? 'bg-green-500 text-white' : 
          notification.type === 'info' ? 'bg-blue-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-white shadow-lg transition-all duration-300 ease-in-out flex-shrink-0`}>
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div>
                <h1 className="text-xl font-bold text-gray-800">CRM Pro</h1>
                <p className="text-xs text-gray-500">v3.0.0 - SMTP Ready</p>
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
              onClick={() => setActiveModule(item.id)}
              className={`w-full flex items-center px-4 py-3 text-left hover:bg-gray-100 transition-colors ${
                activeModule === item.id ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' : 'text-gray-700'
              }`}
              title={!sidebarOpen ? item.label : ''}
            >
              <span className="mr-3">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
              {item.id === 'emails' && emails.filter(e => !e.isRead).length > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1">
                  {emails.filter(e => !e.isRead).length}
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
            <div className="bg-green-50 rounded-lg p-3">
              <p className="text-xs text-green-800 font-medium">📧 SMTP Enabled!</p>
              <p className="text-xs text-green-600 mt-1">Send emails directly!</p>
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
                 activeModule === 'compose' ? 'Compose Email' : activeModule}
              </h2>
              {activeModule !== 'dashboard' && activeModule !== 'compose' && (
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
          {searchQuery && (
            <SearchResults 
              results={searchResults} 
              onClearSearch={() => setSearchQuery('')}
            />
          )}
          
          {!searchQuery && activeModule === 'dashboard' && (
            <Dashboard customers={customers} tasks={tasks} emails={emails} />
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
            />
          )}
          {!searchQuery && activeModule === 'compose' && (
            <ComposeEmailModule
              customers={customers}
              templates={emailTemplates}
              onSend={sendEmail}
              onQueue={queueEmail}
              staffMembers={staffMembers}
            />
          )}
        </main>
      </div>

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
            />
          )}
          {modalType === 'smtp-config' && (
            <SMTPConfigForm
              config={smtpConfig}
              onSave={(config) => {
                // In a real app, this would save to backend
                showNotification('SMTP configuration saved!');
                closeModal();
              }}
            />
          )}
        </Modal>
      )}
    </div>
  );
};

// Enhanced Dashboard Component
const Dashboard = ({ customers, tasks, emails }) => {
  const stats = {
    totalCustomers: customers.length,
    activeDeals: customers.filter(c => c.status === 'Active').length,
    pendingTasks: tasks.filter(t => t.status === 'Pending').length,
    unreadEmails: emails.filter(e => !e.isRead).length,
    totalRevenue: customers.reduce((sum, c) => sum + c.orderValue, 0),
    sentEmails: emails.filter(e => e.type === 'outgoing').length,
    emailResponseRate: 75 // Would be calculated from actual data
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
          title="Sent Emails" 
          value={stats.sentEmails} 
          icon={<Send />} 
          color="green"
        />
      </div>

      {/* Email Features Showcase */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">📧 SMTP Email Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center mb-3">
              <Send className="text-blue-600 mr-2" size={20} />
              <h4 className="font-medium text-blue-800">Send Emails</h4>
            </div>
            <p className="text-sm text-blue-700">Send emails directly to customers with templates and attachments</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center mb-3">
              <Clock className="text-green-600 mr-2" size={20} />
              <h4 className="font-medium text-green-800">Queue Management</h4>
            </div>
            <p className="text-sm text-green-700">Queue emails for batch sending and better deliverability</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center mb-3">
              <FileText className="text-purple-600 mr-2" size={20} />
              <h4 className="font-medium text-purple-800">Email Templates</h4>
            </div>
            <p className="text-sm text-purple-700">Use pre-built templates for consistent communication</p>
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

// Search Results Component (unchanged)
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

// Enhanced Customers Module with Email Integration
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

// Enhanced Customer Card with Email Button
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

// Tasks Module (unchanged from previous version)
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

// Task Card Component (unchanged)
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
const EmailModule = ({ emails, customers, onCompose, onReply }) => {
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredEmails = emails.filter(email => {
    const typeMatch = filterType === 'all' || email.type === filterType;
    const statusMatch = filterStatus === 'all' || email.status === filterStatus;
    return typeMatch && statusMatch;
  });

  const emailStats = {
    total: emails.length,
    incoming: emails.filter(e => e.type === 'incoming').length,
    outgoing: emails.filter(e => e.type === 'outgoing').length,
    unread: emails.filter(e => !e.isRead).length
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Email Management</h3>
          <p className="text-gray-600">{emails.length} total emails</p>
        </div>
        <button
          onClick={onCompose}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center transition-colors"
        >
          <Send size={16} className="mr-2" />
          Compose Email
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="sent">Sent</option>
              <option value="delivered">Delivered</option>
              <option value="read">Read</option>
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

// Email Card Component
const EmailCard = ({ email, onReply }) => {
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
            <h4 className="font-medium text-gray-900">{email.subject}</h4>
            <p className="text-sm text-gray-500">{email.customerName}</p>
            <p className="text-xs text-gray-400">{email.from} → {email.to}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            email.status === 'sent' ? 'bg-green-100 text-green-800' :
            email.status === 'delivered' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {email.status}
          </span>
          <button
            onClick={onReply}
            className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50"
            title="Reply"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
      
      <p className="text-gray-700 mb-4">{email.body}</p>
      
      {email.attachments && email.attachments.length > 0 && (
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <Paperclip size={14} className="mr-1" />
          {email.attachments.length} attachment(s)
        </div>
      )}
      
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{email.timestamp}</span>
        {email.smtpMessageId && (
          <span>ID: {email.smtpMessageId}</span>
        )}
      </div>
    </div>
  );
};

// New Compose Email Module
const ComposeEmailModule = ({ customers, templates, onSend, onQueue, staffMembers }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <ComposeEmailForm
        customers={customers}
        templates={templates}
        staffMembers={staffMembers}
        onSend={onSend}
        onQueue={onQueue}
        isStandalone={true}
      />
    </div>
  );
};

// Compose Email Form Component
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
  isStandalone = false 
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

  const validateForm = () => {
    const newErrors = {};
    if (!formData.to.trim()) newErrors.to = 'Recipient email is required';
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.body.trim()) newErrors.body = 'Email body is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const applyTemplate = (template) => {
    const selectedCustomer = customers.find(c => c.id === parseInt(formData.customerId));
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
      const emailData = {
        ...formData,
        customerId: parseInt(formData.customerId) || null,
        customerName: formData.customerName || customers.find(c => c.email === formData.to)?.name || ''
      };
      
      const success = await onSend(emailData);
      if (success && onClose) {
        onClose();
      }
    }
  };

  const handleQueue = () => {
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
    <form onSubmit={handleSend} className="space-y-6">
      {!isStandalone && (
        <h3 className="text-lg font-semibold text-gray-900">
          {replyType === 'reply' ? 'Reply to Email' : 'Compose Email'}
        </h3>
      )}
      
      {/* Email Header Fields */}
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            To <span className="text-red-500">*</span>
          </label>
          <div className="flex space-x-2">
            <input
              type="email"
              value={formData.to}
              onChange={(e) => setFormData({ ...formData, to: e.target.value })}
              className={`flex-1 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.to ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="recipient@example.com"
            />
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
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Customer</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>
          {errors.to && <p className="text-red-500 text-xs mt-1">{errors.to}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">CC</label>
          <input
            type="email"
            value={formData.cc}
            onChange={(e) => setFormData({ ...formData, cc: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="cc@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">BCC</label>
          <input
            type="email"
            value={formData.bcc}
            onChange={(e) => setFormData({ ...formData, bcc: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="bcc@example.com"
          />
        </div>
      </div>

      {/* Subject */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Subject <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.subject ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter email subject"
        />
        {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
      </div>

      {/* Template Selection */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">Email Templates</label>
          <button
            type="button"
            onClick={() => setShowTemplates(!showTemplates)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            {showTemplates ? 'Hide Templates' : 'Show Templates'}
          </button>
        </div>
        
        {showTemplates && (
          <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {templates.map(template => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => applyTemplate(template)}
                  className="text-left p-3 border border-gray-300 rounded-md hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <h4 className="font-medium text-gray-900 text-sm">{template.name}</h4>
                  <p className="text-xs text-gray-500 mt-1">{template.subject}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Email Body */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Message <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.body}
          onChange={(e) => setFormData({ ...formData, body: e.target.value })}
          className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.body ? 'border-red-500' : 'border-gray-300'
          }`}
          rows="12"
          placeholder="Enter your message here..."
        />
        {errors.body && <p className="text-red-500 text-xs mt-1">{errors.body}</p>}
      </div>

      {/* Priority and Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Attachments</label>
          <div className="flex items-center space-x-2">
            <input
              type="file"
              multiple
              className="hidden"
              id="attachments"
              onChange={(e) => {
                // In a real app, handle file uploads here
                console.log('Files selected:', e.target.files);
              }}
            />
            <label
              htmlFor="attachments"
              className="cursor-pointer flex items-center space-x-2 text-blue-600 hover:text-blue-800"
            >
              <Paperclip size={16} />
              <span className="text-sm">Add Files</span>
            </label>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-4 border-t">
        <div className="text-sm text-gray-500">
          💡 Tip: Use templates for consistent messaging
        </div>
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={handleQueue}
            className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors flex items-center"
          >
            <Clock size={16} className="mr-2" />
            Queue
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Send size={16} className="mr-2" />
            Send Now
          </button>
        </div>
      </div>
    </form>
  );
};

// SMTP Configuration Form
const SMTPConfigForm = ({ config, onSave }) => {
  const [formData, setFormData] = useState({
    host: config.host || '',
    port: config.port || 587,
    secure: config.secure || false,
    user: config.user || '',
    password: '',
    testEmail: ''
  });

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleTest = async () => {
    setTesting(true);
    try {
      // In a real app, this would test the SMTP connection
      setTimeout(() => {
        setTestResult({ success: true, message: 'SMTP configuration test successful!' });
        setTesting(false);
      }, 2000);
    } catch (error) {
      setTestResult({ success: false, message: 'SMTP test failed: ' + error.message });
      setTesting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">SMTP Configuration</h3>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <div className="flex">
          <AlertCircle className="text-yellow-400 mr-3 mt-0.5" size={20} />
          <div>
            <h4 className="text-sm font-medium text-yellow-800">Configuration Required</h4>
            <p className="text-sm text-yellow-700 mt-1">
              Enter your SMTP server details to enable email sending functionality.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Host</label>
          <input
            type="text"
            value={formData.host}
            onChange={(e) => setFormData({ ...formData, host: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="smtp.gmail.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Port</label>
          <input
            type="number"
            value={formData.port}
            onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="587"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Username/Email</label>
          <input
            type="email"
            value={formData.user}
            onChange={(e) => setFormData({ ...formData, user: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="your-email@domain.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Your password or app password"
          />
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="secure"
          checked={formData.secure}
          onChange={(e) => setFormData({ ...formData, secure: e.target.checked })}
          className="mr-2"
        />
        <label htmlFor="secure" className="text-sm text-gray-700">Use SSL/TLS</label>
      </div>

      {/* Test Configuration */}
      <div className="border-t pt-4">
        <h4 className="text-md font-medium text-gray-900 mb-3">Test Configuration</h4>
        <div className="flex space-x-3">
          <input
            type="email"
            value={formData.testEmail}
            onChange={(e) => setFormData({ ...formData, testEmail: e.target.value })}
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="test@example.com"
          />
          <button
            type="button"
            onClick={handleTest}
            disabled={testing || !formData.testEmail}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
          >
            {testing ? 'Testing...' : 'Send Test'}
          </button>
        </div>
        
        {testResult && (
          <div className={`mt-3 p-3 rounded-md ${
            testResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {testResult.message}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Save size={16} className="mr-2" />
          Save Configuration
        </button>
      </div>
    </form>
  );
};

// Modal Component (unchanged)
const Modal = ({ children, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-end mb-4">
              <button 
                onClick={onClose} 
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// Customer Form Component (unchanged from previous version)
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
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">
        {customer ? 'Edit Customer' : 'Add New Customer'}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter customer name"
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter email address"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter phone number"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
          <input
            type="text"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter company name"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
        <textarea
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="2"
          placeholder="Enter full address"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Due Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.dueDate ? 'border-red-500' : 'border-gray-300'
            }`}
            min={new Date().toISOString().split('T')[0]}
          />
          {errors.dueDate && <p className="text-red-500 text-xs mt-1">{errors.dueDate}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
          <input
            type="text"
            placeholder="Sales, Follow-up"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Save size={16} className="mr-2" />
          {task ? 'Update Task' : 'Create Task'}
        </button>
      </div>
    </form>
  );
};

export default CRM;)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Lead">Lead</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Order Value</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.orderValue}
            onChange={(e) => setFormData({ ...formData, orderValue: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0.00"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
          <input
            type="text"
            placeholder="VIP, Enterprise"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Save size={16} className="mr-2" />
          {customer ? 'Update Customer' : 'Add Customer'}
        </button>
      </div>
    </form>
  );
};

// Task Form Component (unchanged from previous version)
const TaskForm = ({ task, customers, staffMembers, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    customerId: task?.customerId || '',
    assignedTo: task?.assignedTo || '',
    priority: task?.priority || 'Medium',
    status: task?.status || 'Pending',
    dueDate: task?.dueDate || '',
    tags: task?.tags?.join(', ') || ''
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.customerId) newErrors.customerId = 'Customer is required';
    if (!formData.assignedTo) newErrors.assignedTo = 'Assignee is required';
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">
        {task ? 'Edit Task' : 'Add New Task'}
      </h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.title ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter task title"
        />
        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="3"
          placeholder="Enter task description"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Customer <span className="text-red-500">*</span>
          </label>
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
                {customer.name} - {customer.company}
              </option>
            ))}
          </select>
          {errors.customerId && <p className="text-red-500 text-xs mt-1">{errors.customerId}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Assign To <span className="text-red-500">*</span>
          </label>
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
                {staff.name} - {staff.role}
              </option>
            ))}
          </select>
          {errors.assignedTo && <p className="text-red-500 text-xs mt-1">{errors.assignedTo}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value }