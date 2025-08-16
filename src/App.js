// src/App.js - Clean CRM WebApp with No Unused Imports
import React, { useState, useMemo } from 'react';
import { 
  Search, Users, CheckSquare, Mail, Building, Settings, Menu, X, Eye, FileText
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

const CRM = () => {
  const [activeModule, setActiveModule] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [customers] = useState(initialCustomers);
  const [tasks] = useState(initialTasks);
  const [emails] = useState(initialEmails);
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-white shadow-lg transition-all duration-300 ease-in-out flex-shrink-0`}>
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div>
                <h1 className="text-xl font-bold text-gray-800">CRM Pro</h1>
                <p className="text-xs text-gray-500">v1.0.0</p>
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
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-xs text-blue-800 font-medium">💡 Pro Tip</p>
              <p className="text-xs text-blue-600 mt-1">Use global search to quickly find anything!</p>
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
            <CustomersModule customers={customers} />
          )}
          {!searchQuery && activeModule === 'tasks' && (
            <TasksModule tasks={tasks} />
          )}
          {!searchQuery && activeModule === 'emails' && (
            <EmailModule emails={emails} />
          )}
        </main>
      </div>
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

      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">🎉 Welcome to Your CRM!</h3>
        <p className="text-gray-600 mb-4">
          Your professional customer relationship management system is now live and ready to use. 
          Start by exploring the different modules using the sidebar navigation.
        </p>
        
        {overdueTasks.length > 0 && (
          <div className="mt-6 p-4 bg-red-50 rounded-lg">
            <h4 className="font-medium text-red-800 mb-2">⚠️ You have {overdueTasks.length} overdue task(s)</h4>
            <div className="space-y-1">
              {overdueTasks.map(task => (
                <p key={task.id} className="text-sm text-red-700">• {task.title} (Due: {task.dueDate})</p>
              ))}
            </div>
          </div>
        )}
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h5 className="font-medium text-blue-800 mb-2">📊 Dashboard</h5>
            <p className="text-sm text-blue-700">View analytics and key metrics</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h5 className="font-medium text-green-800 mb-2">👥 Customers</h5>
            <p className="text-sm text-green-700">Manage customer relationships</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <h5 className="font-medium text-purple-800 mb-2">📋 Tasks</h5>
            <p className="text-sm text-purple-700">Track and assign work items</p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg">
            <h5 className="font-medium text-orange-800 mb-2">📧 Emails</h5>
            <p className="text-sm text-orange-700">Manage email communications</p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
          <h5 className="font-medium text-gray-800 mb-2">🚀 Getting Started</h5>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Try the global search to find customers, tasks, or emails</li>
            <li>• Navigate between modules using the sidebar</li>
            <li>• This is your foundation - we can add more features step by step!</li>
          </ul>
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
                <button
                  className="text-blue-600 hover:text-blue-800 p-2 rounded"
                >
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

// Module Components
const CustomersModule = ({ customers }) => (
  <div className="space-y-6">
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Customer Management</h3>
      <p className="text-gray-600 mb-6">View and manage your customer database</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {customers.map(customer => (
          <div key={customer.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <h4 className="font-medium text-gray-900">{customer.name}</h4>
            <p className="text-sm text-gray-600">{customer.company}</p>
            <p className="text-sm text-gray-500">{customer.email}</p>
            <div className="mt-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                customer.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {customer.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const TasksModule = ({ tasks }) => (
  <div className="space-y-6">
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Task Management</h3>
      <p className="text-gray-600 mb-6">Track and manage your tasks</p>
      
      <div className="space-y-4">
        {tasks.map(task => (
          <div key={task.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{task.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Customer: {task.customerName} • Assigned to: {task.assignedTo}
                </p>
              </div>
              <div className="ml-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  task.priority === 'High' ? 'bg-red-100 text-red-800' :
                  task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {task.priority}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

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
                <p className="text-sm text-gray-500 mt-2 line-clamp-2">{email.body}</p>
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

export default CRM;