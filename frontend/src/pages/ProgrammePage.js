import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { programmeService, departmentService } from '../services/api';
import './MasterScreen.css';

const ProgrammePage = () => {
  const { user } = useContext(AuthContext);
  const [programmes, setProgrammes] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', shortName: '', department: '' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (user?.role === 'SuperAdmin') {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [progRes, deptRes] = await Promise.all([
        programmeService.getAll(),
        departmentService.getAll()
      ]);
      setProgrammes(progRes.data);
      setDepartments(deptRes.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch data');
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
        await programmeService.update(editingId, formData);
      } else {
        await programmeService.create(formData);
      }
      setFormData({ name: '', shortName: '', department: '' });
      setEditingId(null);
      setShowForm(false);
      fetchData();
    } catch (err) {
      setError('Failed to save programme');
    }
  };

  const handleEdit = (programme) => {
    setFormData(programme);
    setEditingId(programme._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await programmeService.delete(id);
        fetchData();
      } catch (err) {
        setError('Failed to delete programme');
      }
    }
  };

  if (loading) return <div className="master-screen"><p>Loading...</p></div>;

  return (
    <div className="master-screen">
      <div className="screen-header">
        <div className="screen-header-left">
          <h1>Programme Registry</h1>
          <span className="page-indicator">Curriculum & Academic Modules</span>
        </div>
        {user?.role === 'SuperAdmin' && (
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            {showForm ? 'Cancel' : '+ NEW PROGRAMME'}
          </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && user?.role === 'SuperAdmin' && (
        <form onSubmit={handleSubmit} className="master-form">
          <div className="form-group">
            <label>Programme Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Short Name / ID</label>
            <input
              type="text"
              value={formData.shortName}
              onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
              required
              minLength="1"
              maxLength="20"
              placeholder="e.g. BCA, B.SC.CS"
            />
          </div>
          <div className="form-group">
            <label>Department</label>
            <select
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              required
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept._id}>{dept.name}</option>
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
          <span className="registry-title">Programme Directory</span>
          <span className="registry-badge">{programmes.length} MODULES ACTIVE</span>
        </div>
        <table className="master-table">
          <thead>
            <tr>
              <th>ACADEMIC IDENTITY</th>
              <th>ID</th>
              <th>DEPARTMENT</th>
              {user?.role === 'SuperAdmin' && <th className="actions-th">MANAGEMENT</th>}
            </tr>
          </thead>
          <tbody>
            {programmes.map((prog) => (
              <tr key={prog._id}>
                <td style={{ fontWeight: 600 }}>{prog.name}</td>
                <td><span className="badge-pill" style={{ color: '#38bdf8', fontWeight: 700 }}>{prog.shortName}</span></td>
                <td>{prog.department?.name || '-'}</td>
                {user?.role === 'SuperAdmin' && (
                  <td className="actions-td">
                    <div className="actions-cell">
                      <button onClick={() => handleEdit(prog)} className="btn-edit">
                        <span>✏️</span> EDIT
                      </button>
                      <button onClick={() => handleDelete(prog._id)} className="btn-delete">
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

export default ProgrammePage;
