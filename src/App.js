// src/App.js - CRM WebApp with Full CRUD Operations
import React, { useState, useMemo } from 'react';
import { 
  Search, Users, CheckSquare, Mail, Building, Settings, Menu, X, Eye, FileText,
  Plus, Edit2, Trash2, Save, Calendar, Clock, AlertCircle, User, Phone, MapPin
} from 'lucide-react';

// Sample data - in production this would come from your backend API
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
  },
  {
    id: 3,
    name: 'Michael Chen',
    email: 'mchen@innovate.co',
    phone: '+1-555-0125',
    company: 'Innovate Co',
    address: '789 Pine St, City, State 12345',
    status: 'Active',
    source: 'Referral',
    created: '2024-03-10',
    lastContact: '2024-08-14',
    orderValue: 5500.00,
    tags: ['Enterprise', 'Priority']
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
  },
  {
    id: 3,
    title: 'Prepare contract documents',
    description: 'Draft and review contract for enterprise client',
    customerId: 3,
    customerName: 'Michael Chen',
    assignedTo: 'David Brown',
    assignedToEmail: 'david@company.com',
    priority: 'High',
    status: 'Pending',
    dueDate: '2024-08-19',
    created: '2024-08-16',
    tags: ['Legal', 'Contract']
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
    body: 'Hi, I\'m interested in learning more about your enterprise package. Could you provide more details about pricing and features?',
    timestamp: '2024-08-15 10:30:00',
    isRead: true,
    isStarred: false,
    thread: 'thread_1'
  },
  {
    id: 2,
    customerId: 2,
    customerName: 'Sarah Johnson',
    subject: 'Product Demo Request',
    from: 'sarah.j@techstart.com',
    to: 'info@company.com',
    body: 'Hello, I would like to schedule a product demo for our team. We\'re evaluating solutions for our upcoming project.',
    timestamp: '2024-08-14 14:20:00',
    isRead: false,
    isStarred: true,
    thread: 'thread_2'
  },
  {
    id: 3,
    customerId: 3,
    customerName: 'Michael Chen',
    subject: 'Contract Terms Discussion',
    from: 'mchen@innovate.co',
    to: 'legal@company.com',
    body: 'We need to discuss the contract terms for our enterprise agreement. Please schedule a call to review requirements.',
    timestamp: '2024-08-16 09:15:00',
    isRead: false,
    isStarred: false,
    thread: 'thread_3'
  }
];

const staffMembers = [
  { id: 1, name: 'Mike Wilson', email: 'mike@company.com', role: 'Sales Manager' },
  { id: 2, name: 'Lisa Chen', email: 'lisa@company.com', role: 'Account Executive' },
  { id: 3, name: 'David Brown', email: 'david@company.com', role: 'Support Lead' },
  { id: 4, name: 'Emma Rodriguez', email: 'emma@company.com', role: 'Customer Success' }
];

const CRM = () => {
  const [activeModule, setActiveModule] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [customers, setCustomers] = useState(initialCustomers);
  const [tasks, setTasks] = useState(initialTasks);
  const [emails] = useState(initialEmails);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [notification, setNotification] = useState(null);

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

  // Customer CRUD operations
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
    if (window.confirm(`Are you sure you want to delete "${customer.name}"? This action cannot be undone.`)) {
      setCustomers(customers.filter(c => c.id !== id));
      // Also delete related tasks
      setTasks(tasks.filter(t => t.customerId !== id));
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
    setTasks([...tasks, newTask]);
    showNotification(`Task "${newTask.title}" assigned to ${newTask.assignedTo}!`);
    closeModal();
    
    // Simulate email notification
    console.log(`📧 Email notification sent to ${newTask.assignedToEmail} for new task: ${newTask.title}`);
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
      email.customerName.toLowerCase().includes(query)
    );
    
    return { customers: customerResults, tasks: taskResults, emails: emailResults };
  }, [searchQuery, customers, tasks, emails]);

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <Settings size={20} /> },
    { id: 'customers', label: 'Customers', icon: <Users size={20} /> },
    { id: 'tasks', label: 'Tasks', icon: <CheckSquare size={20} /> },
    { id: 'emails', label: 'Email Inbox', icon: <Mail size={20} /> }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
          notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center space-x-2">
            <span>{notification.message}</span>
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
                <p className="text-xs text-gray-500">v2.0.0 - Full CRUD</p>
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
            </button>
          ))}
        </nav>

        {sidebarOpen && (
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-green-50 rounded-lg p-3">
              <p className="text-xs text-green-800 font-medium">🎉 CRUD Enabled!</p>
              <p className="text-xs text-green-600 mt-1">Now you can add, edit & delete!</p>
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
                {activeModule === 'dashboard' ? 'Dashboard' : activeModule}
              </h2>
              {activeModule !== 'dashboard' && (
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
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <EmailModule emails={emails} />
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
        </Modal>
      )}
    </div>
  );
};

// Dashboard Component
const Dashboard = ({ customers, tasks, emails }) => {
  const stats = {
    totalCustomers: customers.length,
    activeDeals: customers.filter(c => c.status === 'Active').length,
    pendingTasks: tasks.filter(t => t.status === 'Pending').length,
    unreadEmails: emails.filter(e => !e.isRead).length,
    totalRevenue: customers.reduce((sum, c) => sum + c.orderValue, 0)
  };

  const overdueTasks = tasks.filter(task => 
    new Date(task.dueDate) < new Date() && task.status !== 'Completed'
  );

  const recentTasks = tasks.slice(-3).reverse();

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <DashboardCard 
          title="Total Customers" 
          value={stats.totalCustomers} 
          icon={<Users />} 
          color="blue"
        />
        <DashboardCard 
          title="Active Deals" 
          value={stats.activeDeals} 
          icon={<Building />} 
          color="green"
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
          title="Total Revenue" 
          value={`$${stats.totalRevenue.toLocaleString()}`} 
          icon={<FileText />} 
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Clock className="mr-2" size={20} />
            Recent Tasks
          </h3>
          {recentTasks.length === 0 ? (
            <p className="text-gray-500">No tasks yet. Create your first task!</p>
          ) : (
            <div className="space-y-3">
              {recentTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{task.title}</p>
                    <p className="text-xs text-gray-500">{task.customerName} • {task.assignedTo}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    task.priority === 'High' ? 'bg-red-100 text-red-800' :
                    task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Overdue Tasks & New Features */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <AlertCircle className="mr-2 text-red-500" size={20} />
              Overdue Tasks
            </h3>
            {overdueTasks.length === 0 ? (
              <div className="text-center py-4">
                <CheckSquare className="mx-auto h-8 w-8 text-green-500 mb-2" />
                <p className="text-green-600 font-medium">All caught up! 🎉</p>
                <p className="text-sm text-gray-500">No overdue tasks</p>
              </div>
            ) : (
              <div className="space-y-3">
                {overdueTasks.map(task => (
                  <div key={task.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                    <div>
                      <p className="font-medium text-red-600">{task.title}</p>
                      <p className="text-sm text-gray-500">Due: {task.dueDate} • {task.customerName}</p>
                    </div>
                    <AlertCircle className="text-red-500" size={16} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* New Features */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 border-2 border-blue-200">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">🎉 New Features!</h3>
            <div className="space-y-2 text-sm text-blue-700">
              <div className="flex items-center">
                <Plus className="mr-2" size={14} />
                <span>Add new customers and tasks</span>
              </div>
              <div className="flex items-center">
                <Edit2 className="mr-2" size={14} />
                <span>Edit existing records</span>
              </div>
              <div className="flex items-center">
                <Trash2 className="mr-2" size={14} />
                <span>Delete unwanted items</span>
              </div>
              <div className="flex items-center">
                <Save className="mr-2" size={14} />
                <span>Auto-save with notifications</span>
              </div>
            </div>
          </div>
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

// Search Results Component
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
          <h4 className="font-medium text-gray-700 mb-3 flex items-center">
            <Users className="mr-2" size={16} />
            Customers ({results.customers.length})
          </h4>
          <div className="space-y-2">
            {results.customers.map(customer => (
              <div key={customer.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <div>
                  <p className="font-medium">{customer.name}</p>
                  <p className="text-sm text-gray-500">{customer.email} • {customer.company}</p>
                </div>
                <button className="text-blue-600 hover:text-blue-800 p-2 rounded">
                  <Eye size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {results.tasks.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-700 mb-3 flex items-center">
            <CheckSquare className="mr-2" size={16} />
            Tasks ({results.tasks.length})
          </h4>
          <div className="space-y-2">
            {results.tasks.map(task => (
              <div key={task.id} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">{task.title}</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    task.priority === 'High' ? 'bg-red-100 text-red-800' :
                    task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {task.priority}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                <p className="text-xs text-gray-500">{task.customerName} • Due: {task.dueDate}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {results.emails.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-700 mb-3 flex items-center">
            <Mail className="mr-2" size={16} />
            Emails ({results.emails.length})
          </h4>
          <div className="space-y-2">
            {results.emails.map(email => (
              <div key={email.id} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="font-medium">{email.subject}</p>
                    <p className="text-sm text-gray-500">{email.customerName} • {email.timestamp}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 truncate">{email.body}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Customers Module with CRUD
const CustomersModule = ({ customers, onAdd, onEdit, onDelete }) => {
  const [viewMode, setViewMode] = useState('grid');

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

      {/* View Mode Toggle */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center">
          <h4 className="font-medium">View Options</h4>
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
              </div>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded ${viewMode === 'table' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <div className="w-4 h-4 flex flex-col gap-0.5">
                <div className="bg-current h-0.5 rounded"></div>
                <div className="bg-current h-0.5 rounded"></div>
                <div className="bg-current h-0.5 rounded"></div>
                <div className="bg-current h-0.5 rounded"></div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Customer Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {customers.map(customer => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              onEdit={() => onEdit(customer)}
              onDelete={() => onDelete(customer.id)}
            />
          ))}
        </div>
      ) : (
        <CustomerTable
          customers={customers}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}

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
const CustomerCard = ({ customer, onEdit, onDelete }) => {
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
          customer.status === 'Active' ? 'bg-green-100 text-green-800' : 
          customer.status === 'Lead' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
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

      {customer.tags.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {customer.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                {tag}
              </span>
            ))}
            {customer.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                +{customer.tags.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t">
        <div className="text-xs text-gray-500">
          Created: {customer.created}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={onEdit}
            className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50 transition-colors"
            title="Edit customer"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={onDelete}
            className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50 transition-colors"
            title="Delete customer"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

// Customer Table Component
const CustomerTable = ({ customers, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order Value
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {customers.map(customer => (
              <tr key={customer.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <User className="text-blue-600" size={16} />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                      <div className="text-sm text-gray-500">{customer.company}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{customer.email}</div>
                  <div className="text-sm text-gray-500">{customer.phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    customer.status === 'Active' ? 'bg-green-100 text-green-800' : 
                    customer.status === 'Lead' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {customer.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${customer.orderValue.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => onEdit(customer)}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded"
                      title="Edit customer"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(customer.id)}
                      className="text-red-600 hover:text-red-900 p-1 rounded"
                      title="Delete customer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Tasks Module with CRUD
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
    completed: tasks.filter(t => t.status === 'Completed').length,
    overdue: tasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'Completed').length
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
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

      {/* Task Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-red-600">{taskStats.overdue}</div>
          <div className="text-sm text-gray-500">Overdue</div>
        </div>
      </div>

      {/* Filters */}
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

      {/* Tasks Grid */}
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {tasks.length === 0 ? 'No tasks yet' : 'No tasks match your filters'}
          </h3>
          <p className="text-gray-500 mb-4">
            {tasks.length === 0 
              ? 'Get started by creating your first task' 
              : 'Try adjusting your filter criteria'
            }
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
  const getTaskStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

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
            className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50 transition-colors"
            title="Edit task"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={onDelete}
            className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50 transition-colors"
            title="Delete task"
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
            {isOverdue && <span className="ml-1 text-xs">(Overdue)</span>}
          </span>
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTaskStatusColor(task.status)}`}>
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

      {task.tags.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {task.tags.map((tag, index) => (
              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Quick Status Update */}
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

// Email Module (unchanged)
const EmailModule = ({ emails }) => (
  <div className="space-y-6">
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Email Management</h3>
      <p className="text-gray-600 mb-6">View and manage email communications</p>
      
      <div className="space-y-4">
        {emails.map(email => (
          <div key={email.id} className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
            !email.isRead ? 'bg-blue-50 border-blue-200' : ''
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{email.subject}</h4>
                <p className="text-sm text-gray-600 mt-1">{email.customerName}</p>
                <p className="text-sm text-gray-500 mt-2">{email.body}</p>
              </div>
              <div className="ml-4 text-right">
                <p className="text-xs text-gray-500">{email.timestamp}</p>
                {!email.isRead && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 ml-auto"></div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Modal Component
const Modal = ({ children, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
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