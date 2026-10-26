import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { roleService } from '../services/api';
import './MasterScreen.css';

const RolePage = () => {
  const { user } = useContext(AuthContext);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', permissions: '' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (user?.role === 'SuperAdmin') {
      fetchRoles();
    }
  }, [user]);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await roleService.getAll();
      setRoles(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch roles');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const permissions = formData.permissions
        .split(',')
        .map((p) => p.trim())
        .filter((p) => p);

      const data = { ...formData, permissions };

      if (editingId) {
        await roleService.update(editingId, data);
      } else {
        await roleService.create(data);
      }
      setFormData({ name: '', permissions: '' });
      setEditingId(null);
      setShowForm(false);
      fetchRoles();
    } catch (err) {
      setError('Failed to save role');
    }
  };

  const handleEdit = (role) => {
    setFormData({
      name: role.name,
      permissions: role.permissions?.join(', ') || ''
    });
    setEditingId(role._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await roleService.delete(id);
        fetchRoles();
      } catch (err) {
        setError('Failed to delete role');
      }
    }
  };

  if (loading) return <div className="master-screen"><p>Loading...</p></div>;

  return (
    <div className="master-screen">
      <div className="screen-header">
        <div className="screen-header-left">
          <h1>Authorization Registry</h1>
          <span className="page-indicator">ACCESS CONTROL & ROLE DESIGNATIONS</span>
        </div>
        {user?.role === 'SuperAdmin' && (
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            {showForm ? 'Cancel' : '+ REGISTER ROLE'}
          </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && user?.role === 'SuperAdmin' && (
        <form onSubmit={handleSubmit} className="master-form">
          <div className="form-group">
            <label>Designation / Role Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="e.g., Electrician"
            />
          </div>
          <div className="form-group">
            <label>Permission Vectors (comma separated, optional)</label>
            <textarea
              value={formData.permissions}
              onChange={(e) => setFormData({ ...formData, permissions: e.target.value })}
              rows="3"
              placeholder="e.g., view_tickets, update_status"
            ></textarea>
          </div>
          <button type="submit" className="btn-primary">
            {editingId ? 'Update' : 'Create'}
          </button>
        </form>
      )}

      <div className="master-table-container glass-card fade-in">
        <div className="registry-header-bar">
          <span className="registry-title">Role Matrix</span>
          <span className="registry-badge">{roles.length} TIERS ACTIVE</span>
        </div>
        <table className="master-table">
          <thead>
            <tr>
              <th>DESIGNATION</th>
              <th>PERMISSION VECTORS</th>
              {user?.role === 'SuperAdmin' && <th className="actions-th">MANAGEMENT</th>}
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => (
              <tr key={role._id}>
                <td style={{ fontWeight: 600 }}>{role.name}</td>
                <td>{role.permissions && role.permissions.length > 0 ? role.permissions.join(', ') : '-'}</td>
                {user?.role === 'SuperAdmin' && (
                  <td className="actions-td">
                    <div className="actions-cell">
                      <button onClick={() => handleEdit(role)} className="btn-edit">
                        <span>✏️</span> EDIT
                      </button>
                      <button onClick={() => handleDelete(role._id)} className="btn-delete">
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

export default RolePage;
