import React, { useContext, useEffect, useState } from 'react';
import { complaintService, departmentService, programmeService, userService } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import './MasterScreen.css';

const ReportsPage = () => {

  const { user } = useContext(AuthContext);

  const [departments, setDepartments] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [users, setUsers] = useState([]);

  const [filters, setFilters] = useState({
    department: '',
    programme: '',
    complaintType: '',
    status: '',
    assignee: ''
  });

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /* LOAD FILTER DATA */
  useEffect(() => {

    if (user?.role !== 'SuperAdmin') return;

    const loadData = async () => {
      try {

        const deptRes = await departmentService.getAll();
        setDepartments(deptRes.data || []);

        const progRes = await programmeService.getAll();
        setProgrammes(progRes.data || []);

        const userRes = await userService.getAll();
        setUsers(userRes.data || []);

      } catch (err) {
        console.log(err);
      }
    };

    loadData();

  }, [user]);

  /* FETCH REPORT */
  const fetchReport = async () => {

    setError('');
    setLoading(true);

    try {

      const params = { ...filters };

      Object.keys(params).forEach(k => {
        if (!params[k]) delete params[k];
      });

      const res = await complaintService.report(params);

      setResults(res.data || []);

    } catch (err) {

      setError(err.response?.data?.message || 'Failed to fetch report');

    } finally {

      setLoading(false);

    }
  };

  /* EXPORT CSV */
  const exportCSV = () => {

    if (!results.length) return;

    const headers = [
      'Date',
      'Block',
      'Room',
      'Complaint Type',
      'Remarks',
      'Status',
      'Requester',
      'Assigned Staff'
    ];

    const rows = results.map(r => [

      new Date(r.createdAt).toLocaleString(),
      r.blockName || '',
      r.roomNumber || '',
      r.complaintType || '',
      (r.remarks || '').replace(/\n/g, ' '),
      r.status || '',
      r.createdBy?.username || r.createdBy?.email || '',
      r.assignedTo?.username || r.assignedTo?.email || ''

    ]);

    const csv =
      [headers.join(','), ...rows.map(row =>
        row.map(cell => `"${('' + cell).replace(/"/g, '""')}"`).join(',')
      )].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });

    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'complaints_report.csv';
    a.click();

    URL.revokeObjectURL(url);
  };

  /* ACCESS CONTROL */
  if (user?.role !== 'SuperAdmin') {
    return (
      <div className="master-screen">
        <div className="card">
          <h2>Reports</h2>
          <div className="error-message">
            Only SuperAdmin can generate reports.
          </div>
        </div>
      </div>
    );
  }

  return (

    <div className="master-screen fade-in">

      <div className="screen-header">
        <div>
          <h1 className="gradient-text">System Analytics & Reports</h1>
          <div className="page-indicator" style={{ marginTop: '0.5rem' }}>SuperAdmin • Data Export & Analysis</div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="master-card glass-card">

        <div className="reports-filter-grid">

          <div className="form-group">
            <label>Department</label>
            <select
              value={filters.department}
              onChange={e => setFilters({ ...filters, department: e.target.value })}
            >
              <option value="">All Departments</option>
              {departments.map(d =>
                <option key={d._id} value={d._id}>{d.name}</option>
              )}
            </select>
          </div>

          <div className="form-group">
            <label>Programme</label>
            <select
              value={filters.programme}
              onChange={e => setFilters({ ...filters, programme: e.target.value })}
            >
              <option value="">All Programmes</option>
              {programmes.map(p =>
                <option key={p._id} value={p._id}>{p.name}</option>
              )}
            </select>
          </div>

          <div className="form-group">
            <label>Complaint Topic</label>
            <input
              placeholder="Search type..."
              value={filters.complaintType}
              onChange={e => setFilters({ ...filters, complaintType: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Status</label>
            <select
              value={filters.status}
              onChange={e => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Assigned">Assigned</option>
              <option value="In-Progress">In-Progress</option>
              <option value="Onhold">Onhold</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <div className="form-group">
            <label>Assigned Staff</label>
            <select
              value={filters.assignee}
              onChange={e => setFilters({ ...filters, assignee: e.target.value })}
            >
              <option value="">Any Staff Member</option>
              {users.map(u =>
                <option key={u._id} value={u._id}>
                  {u.username} ({u.role})
                </option>
              )}
            </select>
          </div>

        </div>

        <div className="reports-actions">

          <button
            onClick={fetchReport}
            className="btn-primary"
            disabled={loading}
          >
            <span>📊</span> {loading ? 'Processing...' : 'Generate Detailed Report'}
          </button>

          <button
            onClick={exportCSV}
            className="btn-secondary"
            disabled={results.length === 0}
          >
            <span>📥</span> Download CSV
          </button>

        </div>

      </div>

      <div className="master-table-container glass-card fade-in">

        {loading ? (

          <div className="loading" style={{ padding: '4rem' }}>
            Compiling data points...
          </div>

        ) : (

          <table className="master-table">

            <thead>
              <tr>
                <th>Date</th>
                <th>Department</th>
                <th>Location</th>
                <th>Complaint</th>
                <th>Status</th>
                <th>Requester</th>
                <th>Assigned Staff</th>
              </tr>
            </thead>

            <tbody>

              {results.length > 0 ? (

                results.map(r => (

                  <tr key={r._id}>

                    <td>{new Date(r.createdAt).toLocaleDateString()}</td>

                    <td>
                      {r.createdBy?.department?.name || '-'}
                    </td>

                    <td>
                      {r.blockName} - {r.roomNumber}
                    </td>

                    <td>{r.complaintType}</td>

                    <td>
                      <span className={`status-pill ${r.status?.toLowerCase()}`}>
                        {r.status}
                      </span>
                    </td>

                    <td>
                      {r.createdBy?.username || r.createdBy?.email}
                    </td>

                    <td>
                      {r.assignedTo?.username || '-'}
                    </td>

                  </tr>

                ))

              ) : (

                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem', opacity: 0.8 }}>📑</div>
                    <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-main)' }}>No report data loaded</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>Select your filters above and click "Generate Detailed Report"</div>
                  </td>
                </tr>

              )}

            </tbody>

          </table>

        )}

      </div>

    </div>
  );
};

export default ReportsPage;