import React, { useEffect, useState, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { complaintService } from '../services/api';
import './MasterScreen.css';

const HomePage = () => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    assigned: 0,
    inProgress: 0,
    onhold: 0,
    completed: 0
  });

  const loadData = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const res = await complaintService.getAll();
      const allComplaints = res.data?.data || res.data || [];
      
      let targetComplaints = allComplaints;
      
      // If not SuperAdmin, filter only complaints created by or assigned to the user
      if (user?.role !== 'SuperAdmin') {
        const userId = user?.id || user?._id;
        targetComplaints = allComplaints.filter((c) => {
          const createdById = c.createdBy?._id || c.createdBy;
          const assignedToId = c.assignedTo?._id || c.assignedTo;
          return (
            String(createdById) === String(userId) ||
            String(assignedToId) === String(userId)
          );
        });
      }

      setStats({
        total: targetComplaints.length,
        pending: targetComplaints.filter(c => c.status === 'Pending').length,
        assigned: targetComplaints.filter(c => c.status === 'Assigned').length,
        inProgress: targetComplaints.filter(c => c.status === 'In-Progress').length,
        onhold: targetComplaints.filter(c => c.status === 'Onhold').length,
        completed: targetComplaints.filter(c => c.status === 'Closed').length,
      });

    } catch (err) {
      console.error("Failed to load dashboard data", err);
    } finally {
      setLoading(false);
    }
  }, [user, isAuthenticated]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (!isAuthenticated) {
    return (
      <div className="home-container fade-in">
        <div className="home-content glass-card">
          <div className="home-logo-badge">🚀</div>
          <h1 className="gradient-text">Welcome to TMS</h1>
          <p className="subtitle">Enterprise Complaint & Facility Management</p>
          <div className="login-prompt">
            <p style={{ marginBottom: "1.75rem", color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: 1.6 }}>
              Seamlessly report issues, monitor real-time repair progress, and manage campus infrastructure from one unified portal.
            </p>
            <button className="btn-primary" onClick={() => navigate('/login')}>
              <span>🔑</span> Access System
            </button>
          </div>
        </div>
        <style>{`
          .home-container {
            padding: 2rem 1rem;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: calc(100vh - 120px);
            width: 100%;
          }
          .home-content {
            max-width: 600px;
            width: 100%;
            text-align: center;
            padding: clamp(2rem, 6vw, 3.5rem);
            box-shadow: 0 25px 60px -15px rgba(0,0,0,0.8), 0 0 50px rgba(6,182,212,0.18);
          }
          .home-logo-badge {
            width: 64px;
            height: 64px;
            border-radius: 50%;
            background: linear-gradient(135deg, rgba(6, 182, 212, 0.25) 0%, rgba(16, 185, 129, 0.25) 100%);
            border: 1px solid rgba(6, 182, 212, 0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            margin: 0 auto 1.5rem;
            box-shadow: 0 0 30px rgba(6, 182, 212, 0.35);
          }
          .home-content h1 {
            font-size: clamp(2.2rem, 6vw, 3.6rem);
            margin-bottom: 0.5rem;
            line-height: 1.1;
            letter-spacing: -0.03em;
          }
          .subtitle {
            font-size: clamp(0.85rem, 2vw, 1.05rem);
            color: var(--primary);
            text-transform: uppercase;
            letter-spacing: 2.5px;
            font-weight: 700;
            margin-bottom: 2rem;
          }
          .login-prompt button {
            width: min(100%, 300px);
            padding: 0.95rem;
            font-size: 1rem;
          }
        `}</style>
      </div>
    );
  }

  const CustomStatCard = ({ label, value, color, icon }) => (
    <div className="glass-stat-card" style={{ '--theme-color': color }}>
      <div className="stat-icon-wrapper">
        <span className="stat-icon">{icon}</span>
      </div>
      <div className="stat-content">
        <div className="stat-value-animated">{value}</div>
        <div className="stat-label-modern">{label}</div>
      </div>
      <div className="card-bg-glow"></div>
    </div>
  );

  return (
    <div className="master-screen fade-in dashboard-page">
      {loading ? (
        <div className="loading-container">
          <div className="custom-loader"></div>
          <p>Loading Dashboard...</p>
        </div>
      ) : (
        <div className="dashboard-content">
          
          {/* Greeting Banner */}
          <div className="greeting-banner fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="greeting-text">
              <h2>Welcome back, <span className="highlight-user">{user?.username}</span> 👋</h2>
              <p>Ready to manage your complaint tickets today?</p>
            </div>
            <div className="greeting-actions">
              <button 
                className="btn-primary glow-btn"
                onClick={() => navigate('/complaints/new')}
              >
                <span>➕</span> Raise Complaint
              </button>
            </div>
          </div>

          <div className="dashboard-header fade-in" style={{ animationDelay: '0.2s' }}>
            <h3>Overview</h3>
            <div className="date-badge">
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
          </div>

          <div className="custom-stats-grid fade-in" style={{ animationDelay: '0.3s' }}>
            <CustomStatCard label="Total Requests" value={stats.total} color="#f97316" icon="📋" />
            <CustomStatCard label="Pending Fix" value={stats.pending} color="#eab308" icon="⏳" />
            <CustomStatCard label="Assigned" value={stats.assigned} color="#a855f7" icon="👤" />
            <CustomStatCard label="In-Progress" value={stats.inProgress} color="#38bdf8" icon="⚙️" />
            <CustomStatCard label="On Hold" value={stats.onhold} color="#3b82f6" icon="⏸️" />
            <CustomStatCard label="Resolved" value={stats.completed} color="#10b981" icon="✅" />
          </div>

        </div>
      )}

      <style>{`
        .dashboard-page {
          padding: 0;
          width: 100%;
        }

        .dashboard-content {
          width: 100%;
        }

        .greeting-banner {
          background: linear-gradient(135deg, rgba(30,30,40,0.8) 0%, rgba(15,23,42,0.9) 100%);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: var(--radius-xl);
          padding: clamp(1.25rem, 3.5vw, 2.5rem);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1.25rem;
          margin-bottom: 2.5rem;
          position: relative;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0,0,0,0.3);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }


        .greeting-text {
          flex: 1;
          min-width: min(100%, 280px);
        }

        .greeting-text h2 {
          font-size: clamp(1.5rem, 3.5vw, 2.5rem);
          font-weight: 800;
          margin-bottom: 0.5rem;
          letter-spacing: -0.5px;
          color: #fff;
          line-height: 1.2;
        }

        .highlight-user {
          background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .greeting-text p {
          color: var(--text-muted);
          font-size: clamp(0.9rem, 2vw, 1.05rem);
          margin: 0;
        }

        .greeting-actions {
          display: flex;
          align-items: center;
        }

        .glow-btn {
          padding: 0.85rem 1.75rem;
          border-radius: var(--radius-md);
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-size: 0.95rem;
          box-shadow: 0 8px 20px rgba(6,182,212,0.3);
          border: none;
          background: linear-gradient(135deg, var(--primary-glow), var(--accent));
          color: white;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .glow-btn:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 12px 28px rgba(6,182,212,0.45);
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .dashboard-header h3 {
          font-size: clamp(1.2rem, 2.5vw, 1.5rem);
          font-weight: 700;
          color: #fff;
          margin: 0;
        }

        .date-badge {
          background: rgba(255,255,255,0.05);
          padding: 0.4rem 0.85rem;
          border-radius: 20px;
          font-size: 0.85rem;
          color: var(--text-muted);
          border: 1px solid rgba(255,255,255,0.1);
        }

        .custom-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.25rem;
          width: 100%;
        }

        .glass-stat-card {
          background: rgba(15,23,42,0.6);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: var(--radius-lg);
          padding: clamp(1rem, 2.5vw, 1.75rem);
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          gap: 1.25rem;
          backdrop-filter: blur(12px);
          transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: default;
        }

        .glass-stat-card:hover {
          transform: translateY(-4px);
          border-color: rgba(255,255,255,0.15);
          background: rgba(30,41,59,0.85);
          box-shadow: 0 16px 32px rgba(0,0,0,0.4);
        }

        .card-bg-glow {
          position: absolute;
          top: 0;
          right: 0;
          width: 120px;
          height: 120px;
          background: var(--theme-color);
          opacity: 0.06;
          filter: blur(35px);
          border-radius: 50%;
          transition: all 0.4s ease;
        }

        .glass-stat-card:hover .card-bg-glow {
          opacity: 0.18;
          transform: scale(1.3);
        }

        .stat-icon-wrapper {
          width: clamp(48px, 6vw, 60px);
          height: clamp(48px, 6vw, 60px);
          min-width: clamp(48px, 6vw, 60px);
          border-radius: var(--radius-md);
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: clamp(1.3rem, 2.5vw, 1.7rem);
          position: relative;
          z-index: 2;
          box-shadow: inset 0 0 15px rgba(0,0,0,0.2);
          transition: all 0.3s ease;
        }
        
        .glass-stat-card:hover .stat-icon-wrapper {
          transform: scale(1.08) rotate(4deg);
          border-color: rgba(255,255,255,0.2);
        }

        .stat-content {
          position: relative;
          z-index: 2;
          overflow: hidden;
        }

        .stat-value-animated {
          font-size: clamp(1.8rem, 4vw, 2.8rem);
          font-weight: 900;
          color: #fff;
          line-height: 1;
          margin-bottom: 0.35rem;
          font-family: 'Outfit', sans-serif;
        }

        .stat-label-modern {
          font-size: clamp(0.72rem, 1.5vw, 0.85rem);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 50vh;
          color: #fff;
          gap: 1.25rem;
        }

        .custom-loader {
          width: 44px;
          height: 44px;
          border: 3px solid rgba(255,255,255,0.1);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 1s infinite linear;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .greeting-banner {
            flex-direction: column;
            align-items: stretch;
            gap: 1.25rem;
            padding: 1.5rem;
          }
          .greeting-actions .glow-btn {
            width: 100%;
          }
          .custom-stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.85rem;
          }
        }

        @media (max-width: 480px) {
          .custom-stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.65rem;
          }
          .glass-stat-card {
            padding: 0.85rem;
            gap: 0.75rem;
          }
        }

        @media (max-width: 360px) {
          .custom-stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default HomePage;
