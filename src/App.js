// Tasks Module
const TasksModule = ({ tasks, customers, staffMembers, onAddTask, onEditTask, onUpdateTaskStatus }) => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterAssignee, setFilterAssignee] = useState('all');

  const filteredTasks = tasks.filter(task => {
    const statusMatch = filterStatus === 'all' || task.status === filterStatus;
    const priorityMatch = filterPriority === 'all' || task.priority === filterPriority;
    const assigneeMatch = filterAssignee === 'all' || task.assignedTo === filterAssignee;
    return statusMatch && priorityMatch && assigneeMatch;
  });

  const getTaskStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const taskStats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'Pending').length,
    inProgress: tasks.filter(t => t.status === 'In Progress').length,
    completed: tasks.filter(t => t.status === 'Completed').length,
    overdue: tasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'Completed').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold">Task Management</h3>
          <p className="text-gray-600">{tasks.length} total tasks</p>
        </div>
        <button
          onClick={onAddTask}
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
            <select
              value={filterAssignee}
              onChange={(e) => setFilterAssignee(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Staff</option>
              {staffMembers.map(staff => (
                <option key={staff.id} value={staff.name}>{staff.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.map(task => (
          <div key={task.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <h4 className="font-medium text-gray-900 flex-1 mr-2">{task.title}</h4>
              <button
                onClick={() => onEditTask(task)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Edit2 size={16} />
              </button>
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
                <span className={`font-medium ${
                  new Date(task.dueDate) < new Date() && task.status !== 'Completed' ? 'text-red-600' : 'text-gray-900'
                }`}>
                  {task.dueDate}
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

            {/* Quick Status Update */}
            <div className="pt-3 border-t">
              <label className="block text-xs text-gray-500 mb-1">Quick Status Update:</label>
              <select
                value={task.status}
                onChange={(e) => onUpdateTaskStatus(task.id, e.target.value)}
                className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <CheckSquare className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filterStatus !== 'all' || filterPriority !== 'all' || filterAssignee !== 'all'
              ? 'Try adjusting your filters.' 
              : 'Get started by creating a new task.'
            }
          </p>
        </div>
      )}
    </div>
  );
};

// Email Module
const EmailModule = ({ emails, customers, onSelectEmail, selectedEmail, onBackToInbox }) => {
  const [filter, setFilter] = useState('all');

  const filteredEmails = emails.filter(email => {
    if (filter === 'unread') return !email.isRead;
    if (filter === 'starred') return email.isStarred;
    return true;
  });

  const emailStats = {
    total: emails.length,
    unread: emails.filter(e => !e.isRead).length,
    starred: emails.filter(e => e.isStarred).length
  };

  if (selectedEmail) {
    return (
      <EmailDetail
        email={selectedEmail}
        onBack={onBackToInbox}
        customer={customers.find(c => c.id === selectedEmail.customerId)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold">Email Inbox</h3>
          <p className="text-gray-600">{emailStats.unread} unread of {emailStats.total} total</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center transition-colors">
          <Plus size={16} className="mr-2" />
          Compose
        </button>
      </div>

      {/* Email Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-gray-900">{emailStats.total}</div>
          <div className="text-sm text-gray-500">Total Emails</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-blue-600">{emailStats.unread}</div>
          <div className="text-sm text-gray-500">Unread</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-yellow-600">{emailStats.starred}</div>
          <div className="text-sm text-gray-500">Starred</div>
        </div>
      </div>

      {/* Email Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex space-x-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === 'all' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            All ({emails.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === 'unread' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Unread ({emailStats.unread})
          </button>
          <button
            onClick={() => setFilter('starred')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === 'starred' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Starred ({emailStats.starred})
          </button>
        </div>
      </div>

      {/* Email List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="divide-y divide-gray-200">
          {filteredEmails.map(email => (
            <div
              key={email.id}
              onClick={() => onSelectEmail(email)}
              className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                !email.isRead ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="text-blue-600" size={16} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <p className={`text-sm ${!email.isRead ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                          {email.customerName}
                        </p>
                        {email.isStarred && <Star className="text-yellow-500" size={14} />}
                        {!email.isRead && <div className="w-2 h-2 bg-blue-600 rounded-full"></div>}
                      </div>
                      <p className={`text-sm ${!email.isRead ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                        {email.subject}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 truncate ml-11 mr-4">
                    {email.body}
                  </p>
                </div>
                <div className="flex flex-col items-end space-y-1 ml-4">
                  <p className="text-xs text-gray-500">{email.timestamp.split(' ')[1]}</p>
                  <p className="text-xs text-gray-400">{email.timestamp.split(' ')[0]}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {filteredEmails.length === 0 && (
        <div className="text-center py-12">
          <Mail className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No emails found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filter !== 'all' ? 'No emails match your current filter.' : 'Your inbox is empty.'}
          </p>
        </div>
      )}
    </div>
  );
};

// Email Detail View
const EmailDetail = ({ email, onBack, customer }) => {
  const [replyText, setReplyText] = useState('');
  const [showReply, setShowReply] = useState(false);

  const handleReply = () => {
    if (replyText.trim()) {
      alert(`Reply sent to ${email.from}: ${replyText}`);
      setReplyText('');
      setShowReply(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack} 
          className="text-blue-600 hover:text-blue-800 flex items-center font-medium"
        >
          ← Back to Inbox
        </button>
        <div className="flex space-x-2">
          <button className="p-2 text-gray-600 hover:text-gray-800 border rounded transition-colors">
            <Archive size={16} />
          </button>
          <button className="p-2 text-yellow-600 hover:text-yellow-800 border rounded transition-colors">
            <Star size={16} />
          </button>
          <button className="p-2 text-red-600 hover:text-red-800 border rounded transition-colors">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="border-b pb-4 mb-6">
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">{email.subject}</h2>
            <div className="flex items-center space-x-2">
              {email.isStarred && <Star className="text-yellow-500" size={16} />}
              {!email.isRead && <div className="w-2 h-2 bg-blue-600 rounded-full"></div>}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <p><strong>From:</strong> {email.from}</p>
              <p><strong>To:</strong> {email.to}</p>
            </div>
            <div>
              <p><strong>Date:</strong> {email.timestamp}</p>
              {customer && <p><strong>Customer:</strong> {customer.name} ({customer.company})</p>}
            </div>
          </div>
        </div>

        <div className="prose max-w-none mb-6">
          <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{email.body}</p>
        </div>

        <div className="pt-4 border-t">
          <div className="flex space-x-3 mb-4">
            <button
              onClick={() => setShowReply(!showReply)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center transition-colors"
            >
              <Reply size={16} className="mr-2" />
              Reply
            </button>
            <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center transition-colors">
              <Forward size={16} className="mr-2" />
              Forward
            </button>
            <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center transition-colors">
              <Archive size={16} className="mr-2" />
              Archive
            </button>
          </div>

          {showReply && (
            <div className="p-4 border rounded-lg bg-gray-50">
              <h4 className="font-medium text-gray-900 mb-3">Reply to {email.from}</h4>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply..."
                className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <div className="mt-3 flex space-x-2">
                <button
                  onClick={handleReply}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center transition-colors"
                >
                  <Send size={16} className="mr-2" />
                  Send Reply
                </button>
                <button
                  onClick={() => setShowReply(false)}
                  className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

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
      onSubmit({
        ...formData,
        orderValue: parseFloat(formData.orderValue) || 0,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      });
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            placeholder="VIP, Enterprise, Hot Lead"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
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
    assignedToEmail: task?.assignedToEmail || '',
    priority: task?.priority || 'Medium',
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
      const selectedStaff = staffMembers.find(s => s.name === formData.assignedTo);
      const selectedCustomer = customers.find(c => c.id === parseInt(formData.customerId));
      
      onSubmit({
        ...formData,
        customerId: parseInt(formData.customerId),
        customerName: selectedCustomer?.name || '',
        assignedToEmail: selectedStaff?.email || '',
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      });
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Priority <span className="text-red-500">*</span>
          </label>
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
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {task ? 'Update Task' : 'Create Task'}
        </button>
      </div>
    </form>
  );
};

export default CRM;// src/App.js - Complete CRM WebApp
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Users, CheckSquare, Mail, Upload, Plus, Edit2, Trash2, 
  Calendar, Clock, AlertCircle, User, Phone, MapPin, Building,
  Send, Reply, Forward, Archive, Star, Filter, Download,
  Settings, Bell, Menu, X, Eye, UserPlus, FileText, Tag
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
    body: 'Hi, I\'m interested in learning more about your enterprise package. Could you provide more details about pricing and features? We\'re looking to implement a solution for our 500+ employee company.',
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
    body: 'Hello, I would like to schedule a product demo for our team. We\'re evaluating solutions for our upcoming project and your platform looks promising.',
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
    body: 'We need to discuss the contract terms for our enterprise agreement. Please schedule a call to review the specific requirements.',
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
  const [emails, setEmails] = useState(initialEmails);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notification, setNotification] = useState(null);

  // Show notification helper
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
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

  // Modal handlers
  const openModal = (type, data = null) => {
    setModalType(type);
    setShowModal(true);
    if (type === 'edit-customer' && data) setSelectedCustomer(data);
    if (type === 'edit-task' && data) setSelectedTask(data);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCustomer(null);
    setSelectedTask(null);
    setModalType('');
  };

  // Customer operations
  const addCustomer = (customerData) => {
    const newCustomer = {
      ...customerData,
      id: customers.length + 1,
      created: new Date().toISOString().split('T')[0],
      status: 'Lead',
      lastContact: '',
      source: 'Manual'
    };
    setCustomers([...customers, newCustomer]);
    showNotification('Customer added successfully!');
    closeModal();
  };

  const updateCustomer = (updatedData) => {
    setCustomers(customers.map(c => 
      c.id === selectedCustomer.id ? { ...c, ...updatedData } : c
    ));
    showNotification('Customer updated successfully!');
    closeModal();
  };

  const deleteCustomer = (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      setCustomers(customers.filter(c => c.id !== id));
      showNotification('Customer deleted successfully!');
    }
  };

  // Task operations
  const addTask = (taskData) => {
    const newTask = {
      ...taskData,
      id: tasks.length + 1,
      created: new Date().toISOString().split('T')[0],
      status: 'Pending'
    };
    setTasks([...tasks, newTask]);
    showNotification(`Task assigned to ${taskData.assignedTo}!`);
    closeModal();
    
    // Simulate email notification
    console.log(`📧 Email notification sent to ${taskData.assignedToEmail} for new task: ${taskData.title}`);
  };

  const updateTask = (updatedData) => {
    setTasks(tasks.map(t => 
      t.id === selectedTask.id ? { ...t, ...updatedData } : t
    ));
    showNotification('Task updated successfully!');
    closeModal();
  };

  const updateTaskStatus = (taskId, newStatus) => {
    setTasks(tasks.map(t => 
      t.id === taskId ? { ...t, status: newStatus } : t
    ));
    showNotification(`Task status updated to ${newStatus}!`);
  };

  // CSV Import handler
  const handleCSVImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const csv = e.target.result;
          const lines = csv.split('\n').filter(line => line.trim());
          const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
          
          const newCustomers = lines.slice(1).map((line, index) => {
            const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
            const customer = {
              id: customers.length + index + 1,
              name: values[0] || '',
              email: values[1] || '',
              phone: values[2] || '',
              company: values[3] || '',
              address: values[4] || '',
              status: 'Lead',
              source: 'CSV Import',
              created: new Date().toISOString().split('T')[0],
              lastContact: '',
              orderValue: parseFloat(values[5]) || 0,
              tags: values[6] ? values[6].split(';').map(tag => tag.trim()) : []
            };
            return customer;
          }).filter(customer => customer.name && customer.email);
          
          setCustomers([...customers, ...newCustomers]);
          showNotification(`Successfully imported ${newCustomers.length} customers!`);
        } catch (error) {
          showNotification('Error importing CSV file. Please check the format.', 'error');
        }
      };
      reader.readAsText(file);
      // Reset file input
      event.target.value = '';
    }
  };

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
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg fade-in ${
          notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
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
              onSelectCustomer={setSelectedCustomer}
              onClearSearch={() => setSearchQuery('')}
            />
          )}
          
          {!searchQuery && activeModule === 'dashboard' && (
            <Dashboard customers={customers} tasks={tasks} emails={emails} />
          )}
          {!searchQuery && activeModule === 'customers' && (
            <CustomersModule
              customers={customers}
              onAddCustomer={() => openModal('add-customer')}
              onEditCustomer={(customer) => openModal('edit-customer', customer)}
              onDeleteCustomer={deleteCustomer}
              onImportCSV={handleCSVImport}
              tasks={tasks}
              emails={emails}
              onSelectCustomer={setSelectedCustomer}
              selectedCustomer={selectedCustomer}
              onBackToList={() => setSelectedCustomer(null)}
            />
          )}
          {!searchQuery && activeModule === 'tasks' && (
            <TasksModule
              tasks={tasks}
              customers={customers}
              staffMembers={staffMembers}
              onAddTask={() => openModal('add-task')}
              onEditTask={(task) => openModal('edit-task', task)}
              onUpdateTaskStatus={updateTaskStatus}
            />
          )}
          {!searchQuery && activeModule === 'emails' && (
            <EmailModule 
              emails={emails} 
              customers={customers}
              onSelectEmail={setSelectedEmail}
              selectedEmail={selectedEmail}
              onBackToInbox={() => setSelectedEmail(null)}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      {showModal && (
        <Modal onClose={closeModal}>
          {modalType === 'add-customer' && (
            <CustomerForm onSubmit={addCustomer} />
          )}
          {modalType === 'edit-customer' && selectedCustomer && (
            <CustomerForm customer={selectedCustomer} onSubmit={updateCustomer} />
          )}
          {modalType === 'add-task' && (
            <TaskForm customers={customers} staffMembers={staffMembers} onSubmit={addTask} />
          )}
          {modalType === 'edit-task' && selectedTask && (
            <TaskForm task={selectedTask} customers={customers} staffMembers={staffMembers} onSubmit={updateTask} />
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

  const recentActivity = [
    ...tasks.slice(0, 3).map(task => ({
      type: 'task',
      title: task.title,
      subtitle: `Assigned to ${task.assignedTo}`,
      time: task.created,
      priority: task.priority
    })),
    ...emails.slice(0, 2).map(email => ({
      type: 'email',
      title: email.subject,
      subtitle: `From ${email.customerName}`,
      time: email.timestamp.split(' ')[0],
      isRead: email.isRead
    }))
  ].sort((a, b) => new Date(b.time) - new Date(a.time));

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <DashboardCard 
          title="Total Customers" 
          value={stats.totalCustomers} 
          icon={<Users />} 
          color="blue"
          change="+12% from last month"
        />
        <DashboardCard 
          title="Active Deals" 
          value={stats.activeDeals} 
          icon={<Building />} 
          color="green"
          change="+8% from last month"
        />
        <DashboardCard 
          title="Pending Tasks" 
          value={stats.pendingTasks} 
          icon={<CheckSquare />} 
          color="yellow"
          change="3 due today"
        />
        <DashboardCard 
          title="Unread Emails" 
          value={stats.unreadEmails} 
          icon={<Mail />} 
          color="red"
          change="2 high priority"
        />
        <DashboardCard 
          title="Total Revenue" 
          value={`$${stats.totalRevenue.toLocaleString()}`} 
          icon={<FileText />} 
          color="purple"
          change="+15% from last month"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Clock className="mr-2" size={20} />
            Recent Activity
          </h3>
          <div className="space-y-3">
            {recentActivity.slice(0, 6).map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                <div className="flex-1">
                  <p className="font-medium text-sm">{activity.title}</p>
                  <p className="text-xs text-gray-500">{activity.subtitle}</p>
                </div>
                <div className="text-right">
                  {activity.type === 'task' && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      activity.priority === 'High' ? 'bg-red-100 text-red-800' :
                      activity.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {activity.priority}
                    </span>
                  )}
                  {activity.type === 'email' && !activity.isRead && (
                    <span className="w-2 h-2 bg-blue-600 rounded-full inline-block"></span>
                  )}
                  <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Overdue Tasks & Quick Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <AlertCircle className="mr-2 text-red-500" size={20} />
              Overdue Tasks
            </h3>
            {overdueTasks.length === 0 ? (
              <div className="text-center py-8">
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

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 flex items-center">
                <Plus className="mr-3 text-blue-600" size={16} />
                <span className="font-medium">Add New Customer</span>
              </button>
              <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 flex items-center">
                <CheckSquare className="mr-3 text-green-600" size={16} />
                <span className="font-medium">Create Task</span>
              </button>
              <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 flex items-center">
                <Upload className="mr-3 text-purple-600" size={16} />
                <span className="font-medium">Import CSV</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DashboardCard = ({ title, value, icon, color, change }) => {
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
        {change && <p className="text-xs text-gray-500 mt-1">{change}</p>}
      </div>
    </div>
  );
};

// Search Results Component
const SearchResults = ({ results, onSelectCustomer, onClearSearch }) => {
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
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="text-blue-600" size={16} />
                    </div>
                    <div>
                      <p className="font-medium">{customer.name}</p>
                      <p className="text-sm text-gray-500">{customer.email} • {customer.company}</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onSelectCustomer(customer)}
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
                    <div className="flex items-center space-x-2">
                      <p className="font-medium">{email.subject}</p>
                      {!email.isRead && <div className="w-2 h-2 bg-blue-600 rounded-full"></div>}
                      {email.isStarred && <Star className="text-yellow-500" size={14} />}
                    </div>
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

// Customers Module
const CustomersModule = ({ 
  customers, 
  onAddCustomer, 
  onEditCustomer, 
  onDeleteCustomer, 
  onImportCSV, 
  tasks, 
  emails,
  onSelectCustomer,
  selectedCustomer,
  onBackToList
}) => {
  const [viewMode, setViewMode] = useState('grid');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('created');

  const filteredCustomers = customers
    .filter(customer => filterStatus === 'all' || customer.status === filterStatus)
    .sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.name.localeCompare(b.name);
        case 'company': return a.company.localeCompare(b.company);
        case 'orderValue': return b.orderValue - a.orderValue;
        case 'created': return new Date(b.created) - new Date(a.created);
        default: return 0;
      }
    });

  if (selectedCustomer) {
    return (
      <CustomerDetail
        customer={selectedCustomer}
        onBack={onBackToList}
        onEdit={() => onEditCustomer(selectedCustomer)}
        tasks={tasks.filter(t => t.customerId === selectedCustomer.id)}
        emails={emails.filter(e => e.customerId === selectedCustomer.id)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-semibold">Customer Management</h3>
          <p className="text-gray-600">{customers.length} total customers</p>
        </div>
        <div className="flex space-x-3">
          <label className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 cursor-pointer flex items-center transition-colors">
            <Upload size={16} className="mr-2" />
            Import CSV
            <input
              type="file"
              accept=".csv"
              onChange={onImportCSV}
              className="hidden"
            />
          </label>
          <button
            onClick={onAddCustomer}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center transition-colors"
          >
            <Plus size={16} className="mr-2" />
            Add Customer
          </button>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="Lead">Lead</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="created">Date Created</option>
                <option value="name">Name</option>
                <option value="company">Company</option>
                <option value="orderValue">Order Value</option>
              </select>
            </div>
          </div>
          
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

      {/* Customer Grid/Table View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map(customer => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              onSelect={() => onSelectCustomer(customer)}
              onEdit={() => onEditCustomer(customer)}
              onDelete={() => onDeleteCustomer(customer.id)}
              taskCount={tasks.filter(t => t.customerId === customer.id).length}
              emailCount={emails.filter(e => e.customerId === customer.id).length}
            />
          ))}
        </div>
      ) : (
        <CustomerTable
          customers={filteredCustomers}
          onSelect={onSelectCustomer}
          onEdit={onEditCustomer}
          onDelete={onDeleteCustomer}
        />
      )}

      {filteredCustomers.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No customers found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filterStatus !== 'all' 
              ? 'Try adjusting your filters.' 
              : 'Get started by adding your first customer.'
            }
          </p>
        </div>
      )}
    </div>
  );
};

// Customer Card Component
const CustomerCard = ({ customer, onSelect, onEdit, onDelete, taskCount, emailCount }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={onSelect}>
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

      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex space-x-4 text-xs text-gray-500">
          <span>{taskCount} tasks</span>
          <span>{emailCount} emails</span>
        </div>
        <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onEdit()}
            className="text-gray-400 hover:text-blue-600 transition-colors"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => onDelete()}
            className="text-gray-400 hover:text-red-600 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

// Customer Table Component
const CustomerTable = ({ customers, onSelect, onEdit, onDelete }) => {
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Source
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {customers.map(customer => (
              <tr key={customer.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => onSelect(customer)}>
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {customer.source}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => onEdit(customer)}
                      className="text-indigo-600 hover:text-indigo-900 p-1 rounded"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(customer.id)}
                      className="text-red-600 hover:text-red-900 p-1 rounded"
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

// Customer Detail View
const CustomerDetail = ({ customer, onBack, onEdit, tasks, emails }) => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack} 
          className="text-blue-600 hover:text-blue-800 flex items-center font-medium"
        >
          ← Back to Customers
        </button>
        <button
          onClick={onEdit}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center transition-colors"
        >
          <Edit2 size={16} className="mr-2" />
          Edit Customer
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="text-blue-600" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{customer.name}</h2>
              <p className="text-gray-600">{customer.company}</p>
              <div className="flex space-x-2 mt-2">
                {customer.tags.map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            customer.status === 'Active' ? 'bg-green-100 text-green-800' : 
            customer.status === 'Lead' ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {customer.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="flex items-center space-x-3">
            <Mail className="text-gray-400" size={20} />
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-gray-900">{customer.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Phone className="text-gray-400" size={20} />
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="text-gray-900">{customer.phone || 'Not provided'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Building className="text-gray-400" size={20} />
            <div>
              <p className="text-sm text-gray-500">Order Value</p>
              <p className="text-gray-900 font-semibold">${customer.orderValue.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Calendar className="text-gray-400" size={20} />
            <div>
              <p className="text-sm text-gray-500">Customer Since</p>
              <p className="text-gray-900">{customer.created}</p>
            </div>
          </div>
        </div>

        {customer.address && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start space-x-3">
              <MapPin className="text-gray-400 mt-1" size={16} />
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="text-gray-900">{customer.address}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'tasks', label: `Tasks (${tasks.length})` },
              { id: 'emails', label: `Emails (${emails.length})` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Customer Information</h4>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-500">Source</label>
                  <p className="text-gray-900 font-medium">{customer.source}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Created</label>
                  <p className="text-gray-900">{customer.created}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Last Contact</label>
                  <p className="text-gray-900">{customer.lastContact || 'Never'}</p>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Activity Summary</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckSquare className="text-blue-600" size={20} />
                    <span className="font-medium">Active Tasks</span>
                  </div>
                  <span className="text-blue-600 font-bold">{tasks.filter(t => t.status !== 'Completed').length}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Mail className="text-green-600" size={20} />
                    <span className="font-medium">Email Threads</span>
                  </div>
                  <span className="text-green-600 font-bold">{emails.length}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="text-purple-600" size={20} />
                    <span className="font-medium">Total Value</span>
                  </div>
                  <span className="text-purple-600 font-bold">${customer.orderValue.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-4">
            {tasks.length === 0 ? (
              <div className="text-center py-12">
                <CheckSquare className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks assigned</h3>
                <p className="mt-1 text-sm text-gray-500">Tasks related to this customer will appear here</p>
              </div>
            ) : (
              tasks.map(task => (
                <TaskCard key={task.id} task={task} />
              ))
            )}
          </div>
        )}

        {activeTab === 'emails' && (
          <div className="space-y-4">
            {emails.length === 0 ? (
              <div className="text-center py-12">
                <Mail className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No email correspondence</h3>
                <p className="mt-1 text-sm text-gray-500">Email conversations with this customer will appear here</p>
              </div>
            ) : (
              emails.map(email => (
                <EmailCard key={email.id} email={email} />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Task Card Component
const TaskCard = ({ task }) => {
  return (
    <div className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <h5 className="font-medium text-gray-900">{task.title}</h5>
        <div className="flex space-x-2">
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
      </div>
      <p className="text-gray-600 text-sm mb-3">{task.description}</p>
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-4">
          <span>Assigned to: <span className="font-medium">{task.assignedTo}</span></span>
          <span>Due: <span className={`font-medium ${
            new Date(task.dueDate) < new Date() ? 'text-red-600' : 'text-gray-900'
          }`}>{task.dueDate}</span></span>
        </div>
      </div>
    </div>
  );
};

// Email Card Component  
const EmailCard = ({ email }) => {
  return (
    <div className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h5 className="font-medium text-gray-900">{email.subject}</h5>
            {!email.isRead && <div className="w-2 h-2 bg-blue-600 rounded-full"></div>}
            {email.isStarred && <Star className="text-yellow-500" size={16} />}
          </div>
          <p className="text-sm text-gray-500">From: {email.from}</p>
        </div>
        <span className="text-sm text-gray-500">{email.timestamp}</span>
      </div>
      <p className="text-gray-600 text-sm mb-3">{email.body}</p>
      <div className="flex space-x-3">
        <button className="text-blue-600 hover:text-blue-800 text-sm flex items-center transition-colors">
          <Reply size={14} className="mr-1" />
          Reply
        </button>
        <button className="text-blue-600 hover:text-blue-800 text-sm flex items-center transition-colors">
          <Forward size={14} className="mr-1" />
          Forward
        </button>
      </div>
    </div>
  );
};

// Additional components continue...
// (TasksModule, EmailModule, Modal, CustomerForm, TaskForm)
// I'll add these in the next part to avoid hitting length limits

// For now, let's add the essential missing components: