import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { userService, departmentService, programmeService } from '../services/api';
import './MasterScreen.css';

const UserPage = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [, setDepartments] = useState([]);
  const [, setProgrammes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    role: 'User',
    department: '',
    programme: ''
  });
  const [editingId, setEditingId] = useState(null);

  const roles = ['SuperAdmin', 'User', 'Networking Staff', 'Plumber', 'Electrician', 'Software Developer', 'Application', 'PC Hardware'];

  useEffect(() => {
    if (user?.role === 'SuperAdmin') {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [userRes, deptRes, progRes] = await Promise.all([
        userService.getAll(),
        departmentService.getAll(),
        programmeService.getAll()
      ]);
      setUsers(userRes.data);
      setDepartments(deptRes.data);
      setProgrammes(progRes.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = { ...formData };
      if (!editingId) {
        if (!submitData.password) {
          setError('Password is required for new users');
          return;
        }
      } else {
        if (!submitData.password) {
          delete submitData.password;
        }
      }

      // Remove department/programme from payload when not used
      if (submitData.department === '') delete submitData.department;
      if (submitData.programme === '') delete submitData.programme;

      if (editingId) {
        await userService.update(editingId, submitData);
      } else {
        await userService.create(submitData);
      }
      setFormData({
        username: '',
        email: '',
        phone: '',
        password: '',
        role: 'User',
        department: '',
        programme: ''
      });
      setEditingId(null);
      setShowForm(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save user');
    }
  };

  const handleEdit = (userData) => {
    setFormData({
      username: userData.username,
      email: userData.email,
      phone: userData.phone,
      password: '',
      role: userData.role,
      department: userData.department?._id || userData.department || '',
      programme: userData.programme?._id || userData.programme || ''
    });
    setEditingId(userData._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await userService.delete(id);
        fetchData();
      } catch (err) {
        setError('Failed to delete user');
      }
    }
  };

  if (loading) return <div className="master-screen"><p>Loading...</p></div>;

  return (
    <div className="master-screen">
      <div className="screen-header">
        <div className="screen-header-left">
          <h1>User Registry</h1>
          <span className="page-indicator">SYSTEM USERS & ROLE ASSIGNMENTS</span>
        </div>
        {user?.role === 'SuperAdmin' && (
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            {showForm ? 'Cancel' : '+ REGISTER USER'}
          </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && user?.role === 'SuperAdmin' && (
        <form onSubmit={handleSubmit} className="master-form">
          <div className="form-group">
            <label>Username / Identity</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="e.g. 9876543210"
            />
          </div>
          <div className="form-group">
            <label>Password {editingId && '(leave empty to keep current)'}</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required={!editingId}
            />
          </div>
          <div className="form-group">
            <label>Core Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              {roles.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn-primary">
            {editingId ? 'Update' : 'Create'}
          </button>
        </form>
      )}

      <div className="master-table-container glass-card fade-in">
        <div className="registry-header-bar">
          <span className="registry-title">User Directory</span>
          <span className="registry-badge">{users.length} IDENTITIES ONLINE</span>
        </div>
        <table className="master-table">
          <thead>
            <tr>
              <th>IDENTITY</th>
              <th>PRIMARY EMAIL</th>
              <th>CORE ROLE</th>
              <th>LINKED UNIT</th>
              {user?.role === 'SuperAdmin' && <th className="actions-th">MANAGEMENT</th>}
            </tr>
          </thead>
          <tbody>
            {users.map((userData) => (
              <tr key={userData._id}>
                <td style={{ fontWeight: 600 }}>{userData.username}</td>
                <td>{userData.email}</td>
                <td>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      letterSpacing: '0.05em',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      background: userData.role === 'SuperAdmin' ? 'rgba(244, 63, 94, 0.15)' : 'rgba(6, 182, 212, 0.15)',
                      border: userData.role === 'SuperAdmin' ? '1px solid rgba(244, 63, 94, 0.45)' : '1px solid rgba(6, 182, 212, 0.45)',
                      color: userData.role === 'SuperAdmin' ? '#fda4af' : '#38bdf8',
                      textTransform: 'uppercase',
                      display: 'inline-block',
                    }}
                  >
                    {userData.role}
                  </span>
                </td>
                <td>{userData.department?.name || '-'}</td>
                {user?.role === 'SuperAdmin' && (
                  <td className="actions-td">
                    <div className="actions-cell">
                      <button onClick={() => handleEdit(userData)} className="btn-edit">
                        <span>✏️</span> EDIT
                      </button>
                      <button onClick={() => handleDelete(userData._id)} className="btn-delete">
                        <span>🗑️</span> DELETE
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserPage;
