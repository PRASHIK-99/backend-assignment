  import React, { useState, useEffect, createContext, useContext } from 'react';
  import { 
    AlertCircle, CheckCircle, Loader2, LogOut, Plus, 
    LayoutDashboard, ListTodo, Trash2, Edit2, Shield 
  } from 'lucide-react';

  // --- CONFIGURATION ---
  // Set this to FALSE to connect to your real Node.js localhost backend
  const USE_MOCK_API = false; 
  const API_BASE_URL = 'http://localhost:5000/api';

  // --- MOCK API LAYER (Simulates Backend) ---
  const mockDb = {
    users: JSON.parse(localStorage.getItem('mock_users') || '[]'),
    tasks: JSON.parse(localStorage.getItem('mock_tasks') || '[]'),
    save() {
      localStorage.setItem('mock_users', JSON.stringify(this.users));
      localStorage.setItem('mock_tasks', JSON.stringify(this.tasks));
    }
  };

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const mockApi = {
    async login(email, password) {
      await delay(800); // Simulate network latency
      const user = mockDb.users.find(u => u.email === email && u.password === password);
      if (!user) throw new Error('Invalid email or password');
      return { ...user, token: 'mock-jwt-token-123' };
    },

    async register(name, email, password, role = 'user') {
      await delay(800);
      if (mockDb.users.find(u => u.email === email)) throw new Error('User already exists');
      const newUser = { _id: Date.now().toString(), name, email, password, role };
      mockDb.users.push(newUser);
      mockDb.save();
      return { ...newUser, token: 'mock-jwt-token-123' };
    },

    async getTasks(token) {
      await delay(600);
      // In a real app, we decode token to get user ID. Here we cheat and assume current user.
      // For demo purposes, we will filter by the user stored in localStorage 'currentUser'
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (!currentUser) throw new Error('Not authorized');

      if (currentUser.role === 'admin') return mockDb.tasks; // Admin sees all
      return mockDb.tasks.filter(t => t.userId === currentUser._id);
    },

    async createTask(token, taskData) {
      await delay(600);
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      const newTask = { 
        _id: Date.now().toString(), 
        userId: currentUser._id, 
        ...taskData, 
        createdAt: new Date().toISOString() 
      };
      mockDb.tasks.push(newTask);
      mockDb.save();
      return newTask;
    },

    async updateTask(token, id, updates) {
      await delay(500);
      const index = mockDb.tasks.findIndex(t => t._id === id);
      if (index === -1) throw new Error('Task not found');
      
      mockDb.tasks[index] = { ...mockDb.tasks[index], ...updates };
      mockDb.save();
      return mockDb.tasks[index];
    },

    async deleteTask(token, id) {
      await delay(500);
      mockDb.tasks = mockDb.tasks.filter(t => t._id !== id);
      mockDb.save();
      return { message: 'Deleted' };
    }
  };

  // --- REAL API CLIENT ---
  const realApi = {
    async request(endpoint, method = 'GET', body = null, token = null) {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Something went wrong');
      return data;
    },

    login: (email, password) => realApi.request('/auth/login', 'POST', { email, password }),
    register: (name, email, password, role) => realApi.request('/auth/register', 'POST', { name, email, password, role }),
    getTasks: (token) => realApi.request('/tasks', 'GET', null, token),
    createTask: (token, data) => realApi.request('/tasks', 'POST', data, token),
    updateTask: (token, id, data) => realApi.request(`/tasks/${id}`, 'PUT', data, token),
    deleteTask: (token, id) => realApi.request(`/tasks/${id}`, 'DELETE', null, token),
  };

  const api = USE_MOCK_API ? mockApi : realApi;

  // --- AUTH CONTEXT ---
  const AuthContext = createContext(null);

  const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('currentUser')) || null);
    const [token, setToken] = useState(localStorage.getItem('authToken') || null);

    const login = (userData, authToken) => {
      setUser(userData);
      setToken(authToken);
      localStorage.setItem('currentUser', JSON.stringify(userData));
      localStorage.setItem('authToken', authToken);
    };

    const logout = () => {
      setUser(null);
      setToken(null);
      localStorage.removeItem('currentUser');
      localStorage.removeItem('authToken');
    };

    return (
      <AuthContext.Provider value={{ user, token, login, logout }}>
        {children}
      </AuthContext.Provider>
    );
  };

  // --- COMPONENTS ---

  const Button = ({ children, onClick, variant = 'primary', className = '', type = 'button', disabled = false }) => {
    const baseStyle = "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2";
    const variants = {
      primary: "bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-300",
      secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200",
      danger: "bg-red-50 text-red-600 hover:bg-red-100",
      outline: "border-2 border-gray-200 text-gray-600 hover:border-indigo-600 hover:text-indigo-600"
    };

    return (
      <button 
        type={type} 
        onClick={onClick} 
        disabled={disabled}
        className={`${baseStyle} ${variants[variant]} ${className}`}
      >
        {disabled && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </button>
    );
  };

  const Input = ({ label, type = "text", value, onChange, placeholder, required = false }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
      />
    </div>
  );

  const Badge = ({ status }) => {
    const styles = {
      'completed': 'bg-green-100 text-green-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      'pending': 'bg-yellow-100 text-yellow-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${styles[status] || styles.pending}`}>
        {status}
      </span>
    );
  };

  // --- PAGES ---

  const LoginPage = ({ onSwitch }) => {
    const { login } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({ email: '', password: '' });

    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError('');
      try {
        const data = await api.login(formData.email, formData.password);
        login(data, data.token);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <LayoutDashboard className="w-8 h-8 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
            <p className="text-gray-500 mt-2">Sign in to manage your tasks</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded text-red-700 text-sm flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <Input 
              label="Email Address" 
              value={formData.email} 
              onChange={e => setFormData({...formData, email: e.target.value})}
              placeholder="john@example.com"
              type="email"
              required
            />
            <Input 
              label="Password" 
              value={formData.password} 
              onChange={e => setFormData({...formData, password: e.target.value})}
              type="password"
              placeholder="••••••••"
              required
            />
            <Button type="submit" className="w-full mt-6" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <button onClick={onSwitch} className="text-indigo-600 hover:text-indigo-800 font-medium">
              Create account
            </button>
          </p>
          
          {USE_MOCK_API && (
            <div className="mt-8 pt-6 border-t border-gray-100 text-xs text-gray-400 text-center">
              <p className="font-semibold mb-1">Mock Mode Active</p>
              <p>Use any email/password to register first.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const RegisterPage = ({ onSwitch }) => {
    const { login } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'user' });

    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError('');
      try {
        const data = await api.register(formData.name, formData.email, formData.password, formData.role);
        login(data, data.token);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
            <p className="text-gray-500 mt-2">Join us to boost your productivity</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <Input 
              label="Full Name" 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="John Doe"
              required
            />
            <Input 
              label="Email Address" 
              value={formData.email} 
              onChange={e => setFormData({...formData, email: e.target.value})}
              placeholder="john@example.com"
              type="email"
              required
            />
            <Input 
              label="Password" 
              value={formData.password} 
              onChange={e => setFormData({...formData, password: e.target.value})}
              type="password"
              placeholder="••••••••"
              required
            />
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select 
                value={formData.role}
                onChange={e => setFormData({...formData, role: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <button onClick={onSwitch} className="text-indigo-600 hover:text-indigo-800 font-medium">
              Sign in
            </button>
          </p>
        </div>
      </div>
    );
  };

  const TaskDashboard = () => {
    const { user, logout, token } = useContext(AuthContext);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [error, setError] = useState('');
    
    // New Task Form State
    const [newTask, setNewTask] = useState({ title: '', description: '', status: 'pending' });

    const fetchTasks = async () => {
      try {
        const data = await api.getTasks(token);
        setTasks(data);
      } catch (err) {
        setError('Failed to load tasks');
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      fetchTasks();
    }, []);

    const handleCreate = async (e) => {
      e.preventDefault();
      try {
        await api.createTask(token, newTask);
        setIsModalOpen(false);
        setNewTask({ title: '', description: '', status: 'pending' });
        fetchTasks();
      } catch (err) {
        alert(err.message);
      }
    };

    const handleDelete = async (id) => {
      if(!window.confirm("Are you sure?")) return;
      try {
        await api.deleteTask(token, id);
        setTasks(tasks.filter(t => t._id !== id));
      } catch (err) {
        alert(err.message);
      }
    };

    const handleStatusUpdate = async (task, newStatus) => {
      try {
        const updated = await api.updateTask(token, task._id, { status: newStatus });
        setTasks(tasks.map(t => t._id === task._id ? updated : t));
      } catch (err) {
        alert('Failed to update status');
      }
    };

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Navbar */}
        <nav className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <ListTodo className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-gray-800">TaskMaster</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500 uppercase flex items-center justify-end gap-1">
                {user.role === 'admin' && <Shield className="w-3 h-3 text-indigo-500"/>}
                {user.role}
              </p>
            </div>
            <Button variant="secondary" onClick={logout} className="!p-2">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-5xl mx-auto p-6">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
              <p className="text-gray-500">Manage your projects and tasks</p>
            </div>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="w-5 h-5" />
              New Task
            </Button>
          </div>

          {error && <div className="text-red-500 mb-4">{error}</div>}

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 border-dashed">
              <ListTodo className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No tasks found</h3>
              <p className="text-gray-500">Get started by creating your first task</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {tasks.map(task => (
                <div key={task._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
                  <div className="flex justify-between items-start mb-4">
                    <Badge status={task.status} />
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleDelete(task._id)}
                        className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="font-bold text-gray-900 mb-2 truncate">{task.title}</h3>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2 h-10">{task.description || "No description provided."}</p>
                  
                  <div className="pt-4 border-t border-gray-50 flex gap-2">
                    {task.status !== 'completed' && (
                      <button 
                        onClick={() => handleStatusUpdate(task, 'completed')}
                        className="flex-1 text-xs bg-green-50 text-green-700 py-2 rounded-lg font-medium hover:bg-green-100 transition-colors"
                      >
                        Mark Done
                      </button>
                    )}
                    {task.status === 'completed' && (
                      <button 
                        onClick={() => handleStatusUpdate(task, 'pending')}
                        className="flex-1 text-xs bg-gray-50 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                      >
                        Reopen
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* Create Task Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
              <h3 className="text-xl font-bold mb-4">Create New Task</h3>
              <form onSubmit={handleCreate}>
                <Input 
                  label="Task Title"
                  value={newTask.title}
                  onChange={e => setNewTask({...newTask, title: e.target.value})}
                  placeholder="e.g. Fix API Bug"
                  required
                />
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={newTask.description}
                    onChange={e => setNewTask({...newTask, description: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-24 resize-none"
                    placeholder="Details..."
                  />
                </div>
                <div className="flex gap-3 justify-end mt-6">
                  <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                  <Button type="submit">Create Task</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  const Main = () => {
    const { user } = useContext(AuthContext);
    const [isRegistering, setIsRegistering] = useState(false);

    if (user) return <TaskDashboard />;

    return isRegistering 
      ? <RegisterPage onSwitch={() => setIsRegistering(false)} /> 
      : <LoginPage onSwitch={() => setIsRegistering(true)} />;
  };

  export default function App() {
    return (
      <AuthProvider>
        <Main />
      </AuthProvider>
    );
  }