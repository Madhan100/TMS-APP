import React, { useEffect, useState, useContext, useCallback } from "react";
import { complaintService, userService } from "../services/api";
import { AuthContext } from "../context/AuthContext";
import "./MasterScreen.css";

const ComplaintsDashboardPage = () => {

const { user } = useContext(AuthContext);

const [complaints,setComplaints]=useState([]);
const [users,setUsers]=useState([]);

const [stats,setStats]=useState({
total:0,
pending:0,
assigned:0,
closed:0
});

const [listLoading,setListLoading]=useState(true);
const [error,setError]=useState("");

const [assignTarget,setAssignTarget]=useState({
complaintId:null,
assignee:""
});

const loadComplaints = useCallback(async () => {
  try {
    setListLoading(true);
    const res = await complaintService.getAll();
    const rawData = res.data?.data || res.data || [];
    const complaintsData = Array.isArray(rawData) ? rawData : [];
    setComplaints(complaintsData);

    try {
      const statRes = await complaintService.getStats();
      const s = statRes.data?.data || statRes.data;
      if (s) setStats(s);
    } catch {
      // Calculate local stats from complaints array if getStats endpoint is unavailable
      setStats({
        total: complaintsData.length,
        pending: complaintsData.filter(c => c.status === 'Pending').length,
        assigned: complaintsData.filter(c => c.status === 'Assigned').length,
        closed: complaintsData.filter(c => c.status === 'Closed').length
      });
    }
  } catch (err) {
    setError("Failed to load complaints");
  } finally {
    setListLoading(false);
  }
}, []);

useEffect(() => {
  loadComplaints();
}, [loadComplaints]);

useEffect(()=>{

if(user?.role==="SuperAdmin"){

userService.getAll().then((res)=>{

const rawUsers = res.data?.data || res.data || [];
const userData = Array.isArray(rawUsers) ? rawUsers : [];
setUsers(userData);

}).catch(()=>{});

}

},[user]);

const refresh=()=>loadComplaints();

const handleAssignClick=(id)=>{
setAssignTarget({complaintId:id,assignee:""});
};

const handleAssignSubmit=async()=>{

if(!assignTarget.assignee){
setError("Please select a staff");
return;
}

try{

await complaintService.assign(
assignTarget.complaintId,
assignTarget.assignee
);

alert("Complaint Assigned Successfully");

setAssignTarget({
complaintId:null,
assignee:""
});

refresh();

}catch(err){

const errData = err.response?.data;
console.log("ASSIGN ERROR:",err);
setError(errData?.message || "Assign failed");

}

};

return(

<div className="master-screen fade-in">

<div className="screen-header">
<h1 className="gradient-text">Complaints Dashboard</h1>
<div className="page-indicator">SuperAdmin • Manage All Complaints</div>
</div>

{error && <div className="error-message">{error}</div>}

{/* Assign Modal */}
{assignTarget.complaintId && (
<div className="modal-overlay" onClick={() => setAssignTarget({ complaintId: null, assignee: "" })}>
<div className="modal-content" onClick={(e) => e.stopPropagation()}>
<h3>Assign Complaint</h3>
<p style={{ opacity: 0.7, marginBottom: '1rem' }}>Select a staff member to assign this complaint to:</p>
<select
value={assignTarget.assignee}
onChange={(e) => setAssignTarget({ ...assignTarget, assignee: e.target.value })}
style={{ width: '100%', marginBottom: '1rem', padding: '0.6rem' }}
>
<option value="">-- Select Staff --</option>
{users.filter(u => u.role && u.role !== 'SuperAdmin' && u.role !== 'User').map((u) => (
<option key={u._id} value={u._id}>{u.username} ({u.role})</option>
))}
</select>
<div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
<button className="btn-secondary" onClick={() => setAssignTarget({ complaintId: null, assignee: "" })}>Cancel</button>
<button className="btn-primary" onClick={handleAssignSubmit} disabled={!assignTarget.assignee}>Assign</button>
</div>
</div>
</div>
)}

<div className="stats-grid">

<div className="stat-card">
<span className="stat-value">{stats.total}</span>
<span className="stat-label">Total</span>
</div>

<div className="stat-card">
<span className="stat-value">{stats.pending}</span>
<span className="stat-label">Pending</span>
</div>

<div className="stat-card">
<span className="stat-value">{stats.assigned}</span>
<span className="stat-label">Assigned</span>
</div>

<div className="stat-card">
<span className="stat-value">{stats.closed}</span>
<span className="stat-label">Closed</span>
</div>

</div>

{listLoading ? (

<div className="loading">Loading...</div>

) : (

<div className="master-table-container glass-card">

<table className="master-table">

<thead>
<tr>
<th>Date</th>
<th>Block & Room</th>
<th>Topic</th>
<th>Details</th>
<th>Status</th>
<th>Author</th>
{user?.role === 'SuperAdmin' && <th>Actions</th>}
</tr>
</thead>

<tbody>

{(Array.isArray(complaints) ? complaints : []).map((c)=>{

const isAssigned = c.assignedTo && (c.assignedTo._id || c.assignedTo);

return(

<tr key={c._id}>

<td>{new Date(c.createdAt).toLocaleDateString()}</td>

<td>
<div style={{fontWeight:700}}>
{c.blockName}
</div>
<div style={{fontSize:"0.8rem",opacity:0.7}}>
{c.roomNumber}
</div>
</td>

<td>{c.complaintType}</td>

<td>{c.remarks || "-"}</td>

<td>
  <span className={`status-pill ${c.status?.toLowerCase()}`}>
    {c.status}
  </span>
  {c.assignedTo && (
    <div style={{ fontSize: "12px", opacity: 0.75, marginTop: '4px' }}>
      Assigned: {c.assignedTo.username || "Staff"}
    </div>
  )}
</td>

<td>{c.createdBy?.username || "-"}</td>

{user?.role === 'SuperAdmin' && (
<td className="actions-td">
  <div className="actions-cell">
    {c.status === 'Closed' ? (
      <span className="status-pill closed" style={{ opacity: 0.65 }}>Closed</span>
    ) : isAssigned ? (
      <span className="status-pill assigned" style={{ opacity: 0.85 }}>Assigned</span>
    ) : (
      <button
        className="btn-primary btn-sm"
        onClick={() => handleAssignClick(c._id)}
      >
        Assign
      </button>
    )}
  </div>
</td>
)}

</tr>

);

})}

</tbody>

</table>

</div>

)}

</div>

);

};

export default ComplaintsDashboardPage;
