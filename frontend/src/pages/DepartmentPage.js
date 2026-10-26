import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { departmentService } from '../services/api';
import './MasterScreen.css';

const DepartmentPage = () => {
  const { user } = useContext(AuthContext);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', shortName: '' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (user?.role === 'SuperAdmin') {
      fetchDepartments();
    }
  }, [user]);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await departmentService.getAll();
      setDepartments(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch departments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // client-side validation for shortName length (2-8 chars)
    const shortLen = (formData.shortName || '').trim().length;
    if (shortLen < 2 || shortLen > 8) {
      setError('Short Name must be between 2 and 8 characters');
      return;
    }

    try {
      if (editingId) {
        await departmentService.update(editingId, formData);
      } else {
        await departmentService.create(formData);
      }
      setFormData({ name: '', shortName: '' });
      setEditingId(null);
      setShowForm(false);
      fetchDepartments();
    } catch (err) {
      setError('Failed to save department');
    }
  };

  const handleEdit = (department) => {
    setFormData(department);
    setEditingId(department._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await departmentService.delete(id);
        fetchDepartments();
      } catch (err) {
        setError('Failed to delete department');
      }
    }
  };

  if (loading) return <div className="master-screen"><p>Loading...</p></div>;

  return (
    <div className="master-screen">
      <div className="screen-header">
        <div className="screen-header-left">
          <h1>Department Hub</h1>
          <span className="page-indicator">Department Directory & Core Units</span>
        </div>
        {user?.role === 'SuperAdmin' && (
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            {showForm ? 'Cancel' : '+ NEW DEPARTMENT'}
          </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && user?.role === 'SuperAdmin' && (
        <form onSubmit={handleSubmit} className="master-form">
          <div className="form-group">
            <label>Department Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Short Name</label>
            <input
              type="text"
              value={formData.shortName}
              onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
              required
              minLength="2"
              maxLength="8"
              placeholder="2-8 chars"
            />
          </div>
          <button type="submit" className="btn-primary">
            {editingId ? 'Update' : 'Create'}
          </button>
        </form>
      )}

      <div className="master-table-container glass-card fade-in">
        <div className="registry-header-bar">
          <span className="registry-title">Registry Output</span>
          <span className="registry-badge">{departments.length} UNITS ACTIVE</span>
        </div>
        <table className="master-table">
          <thead>
            <tr>
              <th>IDENTITY</th>
              <th>CORE ID</th>
              {user?.role === 'SuperAdmin' && <th className="actions-th">MANAGEMENT</th>}
            </tr>
          </thead>
          <tbody>
            {departments.map((dept) => (
              <tr key={dept._id}>
                <td style={{ fontWeight: 600 }}>{dept.name}</td>
                <td><span className="badge-pill" style={{ color: '#38bdf8', fontWeight: 700 }}>{dept.shortName}</span></td>
                {user?.role === 'SuperAdmin' && (
                  <td className="actions-td">
                    <div className="actions-cell">
                      <button onClick={() => handleEdit(dept)} className="btn-edit">
                        <span>✏️</span> EDIT
                      </button>
                      <button onClick={() => handleDelete(dept._id)} className="btn-delete">
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

export default DepartmentPage;
