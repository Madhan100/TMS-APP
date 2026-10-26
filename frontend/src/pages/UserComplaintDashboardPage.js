import React, { useEffect, useState, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { complaintService } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import './MasterScreen.css';

const StatCard = ({ label, value, color, onClick, active }) => (
  <div
    className={`stat-card ${active ? 'active-filter' : ''}`}
    onClick={onClick}
    role={onClick ? 'button' : undefined}
    tabIndex={onClick ? 0 : undefined}
    onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
    style={{ borderColor: color }}
  >
    <div className="stat-value">{value}</div>
    <div className="stat-label">{label}</div>
  </div>
);

const UserComplaintDashboardPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [myStats, setMyStats] = useState({ total: 0, pending: 0, assigned: 0, closed: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [complaints, setComplaints] = useState([]);
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [statusTarget, setStatusTarget] = useState({ complaintId: null, status: '' });
  const [selectedStatus, setSelectedStatus] = useState('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await complaintService.getAll();
      const rawComplaints = res.data?.data || res.data || [];
      const allComplaints = Array.isArray(rawComplaints) ? rawComplaints : [];

      // Filter complaints for current user: either created by them or assigned to them
      const userId = user?.id || user?._id;
      const userComplaints = allComplaints.filter((c) => {
        const createdById = c.createdBy?._id || c.createdBy;
        const assignedToId = c.assignedTo?._id || c.assignedTo;
        return (
          String(createdById) === String(userId) ||
          String(assignedToId) === String(userId)
        );
      });
      setComplaints(userComplaints);

      // Calculate stats
      const stats = {
        total: userComplaints.length,
        pending: userComplaints.filter(c => c.status === 'Pending').length,
        assigned: userComplaints.filter(c => c.status === 'Assigned').length,
        closed: userComplaints.filter(c => c.status === 'Closed').length,
      };
      setMyStats(stats);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load complaints');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredComplaints = filterStatus === 'All'
    ? complaints
    : complaints.filter(c => c.status === filterStatus);

  const viewComplaintDetails = (complaint) => {
    setSelectedComplaint(complaint);
    setSelectedStatus(complaint.status || '');
  };

  const handleStatusSubmit = async (complaintId, newStatus) => {
    if (!newStatus) return setError('Select a status');
    try {
      await complaintService.updateStatus(complaintId, newStatus);
      setStatusTarget({ complaintId: null, status: '' });
      await loadData();
      if (selectedComplaint && selectedComplaint._id === complaintId) {
        const refreshed = (await complaintService.getById(complaintId)).data;
        setSelectedComplaint(refreshed);
      }
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  if (loading) return <div className="loading">Initializing Dashboard...</div>;

  return (
    <div className="master-screen fade-in">
      <div className="screen-header">
        <div>
          <h1 className="gradient-text">My Complaints</h1>
          <div className="page-indicator">{user?.role || 'User'} • View & Update Complaints</div>
        </div>
        <button onClick={() => navigate('/complaints/new')} className="btn-primary">
          <span>➕</span> Raise New
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="stats-grid">
        <StatCard
          label="Total History"
          value={myStats.total}
          color="var(--primary)"
          active={filterStatus === 'All'}
          onClick={() => setFilterStatus('All')}
        />
        <StatCard
          label="Pending Fix"
          value={myStats.pending}
          color="#f59e0b"
          active={filterStatus === 'Pending'}
          onClick={() => setFilterStatus('Pending')}
        />
        <StatCard
          label="In Progress"
          value={myStats.assigned}
          color="#3b82f6"
          active={filterStatus === 'Assigned'}
          onClick={() => setFilterStatus('Assigned')}
        />
        <StatCard
          label="Resolved"
          value={myStats.closed}
          color="#10b981"
          active={filterStatus === 'Closed'}
          onClick={() => setFilterStatus('Closed')}
        />
      </div>

      {selectedComplaint && (
        <div className="master-card glass-card fade-in">
          <div className="detail-header">
            <h3 className="gradient-text">Complaint Details</h3>
            <button className="btn-icon btn-delete" onClick={() => setSelectedComplaint(null)} title="Close details">✕</button>
          </div>

          <div className="detail-grid">
            <div className="detail-item">
              <label>Location</label>
              <div className="detail-value">{selectedComplaint.blockName} - {selectedComplaint.roomNumber}</div>
            </div>
            <div className="detail-item">
              <label>Category</label>
              <div className="detail-value"><span className="role-badge">{selectedComplaint.complaintType}</span></div>
            </div>
            <div className="detail-item">
              <label>Current Status</label>
              <div className="detail-value">
                <span className={`status-pill ${selectedComplaint.status.toLowerCase()}`}>
                  {selectedComplaint.status}
                </span>
              </div>
            </div>
            <div className="detail-item">
              <label>Created On</label>
              <div className="detail-value">{new Date(selectedComplaint.createdAt).toLocaleDateString()}</div>
            </div>
            {selectedComplaint.assignedTo && (
              <div className="detail-item">
                <label>Assigned Staff</label>
                <div className="detail-value">{selectedComplaint.assignedTo?.username || selectedComplaint.assignedTo}</div>
              </div>
            )}
            <div className="detail-item full-width">
              <label>Remarks</label>
              <div className="detail-value remarks-box">{selectedComplaint.remarks || "No additional remarks provided."}</div>
            </div>
            {selectedComplaint.attachment && (
              <div className="detail-item full-width">
                <label>Evidence / Media</label>
                <a href={`http://localhost:5000${selectedComplaint.attachment}`} target="_blank" rel="noreferrer" className="attachment-link">
                  📎 View Attached Media
                </a>
              </div>
            )}
          </div>

          {/* Status Update Section in Detail View — only if NOT Closed */}
          {selectedComplaint.status !== 'Closed' &&
          (user?.role === 'SuperAdmin' ||
            String(selectedComplaint.assignedTo?._id || selectedComplaint.assignedTo) === String(user?.id || user?._id) ||
            String(selectedComplaint.createdBy?._id || selectedComplaint.createdBy) === String(user?.id || user?._id)) && (
              <div className="detail-actions">
                <div className="status-update-box">
                  <label>Update Status</label>
                  <div className="input-group">
                    <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                      <option value="Pending">Pending</option>
                      <option value="Assigned">Assigned</option>
                      <option value="In-Progress">In-Progress</option>
                      <option value="Onhold">Onhold</option>
                      <option value="Closed">Closed</option>
                    </select>
                    <button className="btn-primary" onClick={() => handleStatusSubmit(selectedComplaint._id, selectedStatus)}>
                      Apply Status Change
                    </button>
                  </div>
                </div>
              </div>
            )}
        </div>
      )}

      <div className="master-table-container glass-card">
        <div className="table-header-row">
          <h3 className="gradient-text">
            {filterStatus === 'All' ? 'Complete History' : `${filterStatus} Requests`}
          </h3>
          {filterStatus !== 'All' && <button className="btn-secondary btn-sm" onClick={() => setFilterStatus('All')}>Clear Filter</button>}
        </div>

        <table className="master-table">
          <thead>
            <tr>
              <th>Block</th>
              <th>Room</th>
              <th>Category</th>
              <th>Status</th>
              <th>Date</th>
              <th>Summary</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredComplaints.length > 0 ? (
              filteredComplaints.map((complaint) => (
                <tr key={complaint._id} onClick={() => viewComplaintDetails(complaint)} className="clickable-row">
                  <td>{complaint.blockName}</td>
                  <td>{complaint.roomNumber}</td>
                  <td><span className="role-badge">{complaint.complaintType}</span></td>
                  <td>
                    <span className={`status-pill ${complaint.status.toLowerCase()}`}>
                      {complaint.status}
                    </span>
                  </td>
                  <td>{new Date(complaint.createdAt).toLocaleDateString()}</td>
                  <td>{complaint.remarks?.substring(0, 25) || '-'}...</td>
                  <td>
                    <div className="actions-cell" onClick={(e) => e.stopPropagation()}>
                      {statusTarget.complaintId === complaint._id ? (
                        <div className="status-mini-form">
                          <select value={statusTarget.status} onChange={(e) => setStatusTarget({ ...statusTarget, status: e.target.value })}>
                            <option value="">Status</option>
                            <option value="Pending">Pending</option>
                            <option value="Assigned">Assigned</option>
                            <option value="In-Progress">In-Progress</option>
                            <option value="Onhold">Onhold</option>
                            <option value="Closed">Closed</option>
                          </select>
                          <button onClick={() => handleStatusSubmit(complaint._id, statusTarget.status)} className="btn-primary btn-sm">Save</button>
                          <button onClick={() => setStatusTarget({ complaintId: null, status: '' })} className="btn-secondary btn-sm">✕</button>
                        </div>
                      ) : (
                        <>
                          {complaint.status !== 'Closed' &&
                          (user?.role === 'SuperAdmin' ||
                            String(complaint.assignedTo?._id || complaint.assignedTo) === String(user?.id || user?._id) ||
                            String(complaint.createdBy?._id || complaint.createdBy) === String(user?.id || user?._id)) && (
                              <button className="btn-secondary btn-sm" onClick={() => setStatusTarget({ complaintId: complaint._id, status: complaint.status })}>
                                Update
                              </button>
                            )}
                          <button className="btn-icon btn-edit" onClick={() => viewComplaintDetails(complaint)}>👁️</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', opacity: 0.5 }}>
                  No matching complaints found in your records.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <style>{`
        .active-filter {
          box-shadow: 0 0 20px rgba(6, 182, 212, 0.3) !important;
          border-color: var(--primary) !important;
        }
        .detail-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          border-bottom: 1px solid var(--border-glass);
          padding-bottom: 1rem;
        }
        .detail-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1.25rem;
        }
        .detail-item label {
          display: block;
          font-size: 0.75rem;
          font-weight: 800;
          color: var(--text-muted);
          text-transform: uppercase;
          margin-bottom: 0.4rem;
          letter-spacing: 0.08em;
        }
        .detail-value {
          font-size: 1rem;
          color: var(--text-main);
          font-weight: 500;
        }
        .role-badge {
          background: rgba(255, 255, 255, 0.05);
          padding: 0.3rem 0.6rem;
          border-radius: 6px;
          font-size: 0.78rem;
          font-weight: 600;
          border: 1px solid var(--border-glass);
          display: inline-block;
        }
        .full-width {
          grid-column: 1 / -1;
        }
        .remarks-box {
          background: rgba(255, 255, 255, 0.02);
          padding: 1.25rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-glass);
          line-height: 1.5;
        }
        .attachment-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--primary);
          font-weight: 700;
          text-decoration: none;
          background: rgba(255, 255, 255, 0.05);
          padding: 0.75rem 1.25rem;
          border-radius: var(--radius-md);
          transition: var(--transit-main);
          font-size: 0.9rem;
        }
        .attachment-link:hover {
          background: var(--primary);
          color: white;
          transform: translateY(-2px);
        }
        .table-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.75rem;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid var(--border-glass);
        }
        .clickable-row {
          cursor: pointer;
          transition: var(--transit-main);
        }
        .clickable-row:hover {
          background: rgba(255, 255, 255, 0.02);
        }
        .status-pill {
          padding: 0.35rem 0.7rem;
          border-radius: 12px;
          font-size: 0.72rem;
          font-weight: 800;
          text-transform: uppercase;
          display: inline-block;
          letter-spacing: 0.05em;
        }
        .status-pill.pending { background: rgba(245, 158, 11, 0.12); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.25); }
        .status-pill.assigned { background: rgba(168, 85, 247, 0.12); color: #a855f7; border: 1px solid rgba(168, 85, 247, 0.25); }
        .status-pill.in-progress { background: rgba(56, 189, 248, 0.12); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.25); }
        .status-pill.closed { background: rgba(16, 185, 129, 0.12); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.25); }
        .status-pill.onhold { background: rgba(239, 68, 68, 0.12); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.25); }
        
        .detail-actions {
          margin-top: 1.5rem;
          border-top: 1px solid var(--border-glass);
          padding-top: 1.5rem;
        }
        .status-update-box label {
          display: block;
          font-size: 0.75rem;
          font-weight: 800;
          color: var(--text-muted);
          text-transform: uppercase;
          margin-bottom: 0.6rem;
        }
        .input-group {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        .input-group select {
          flex: 1;
          min-width: 180px;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid var(--border-glass);
          border-radius: var(--radius-md);
          color: var(--text-main);
          padding: 0.75rem 1rem;
        }
        
        .status-mini-form {
          display: flex;
          gap: 0.35rem;
          align-items: center;
          flex-wrap: wrap;
        }
        .status-mini-form select {
          background: rgba(15, 23, 42, 0.9);
          border: 1px solid var(--border-glass);
          border-radius: var(--radius-sm);
          color: var(--text-main);
          padding: 4px 6px;
          font-size: 0.78rem;
        }

        @media (max-width: 640px) {
          .input-group select,
          .input-group button {
            width: 100%;
          }
          .table-header-row {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default UserComplaintDashboardPage;
