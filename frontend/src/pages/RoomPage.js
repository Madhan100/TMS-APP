import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { roomService, departmentService, programmeService, blockService } from '../services/api';
import './MasterScreen.css';

const RoomPage = () => {
  const { user } = useContext(AuthContext);
  const [rooms, setRooms] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    roomNumber: '', department: '', programme: '', block: '', floor: '', capacity: ''
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (user?.role === 'SuperAdmin') {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [roomRes, deptRes, progRes, blockRes] = await Promise.all([
        roomService.getAll(),
        departmentService.getAll(),
        programmeService.getAll(),
        blockService.getAll()
      ]);
      setRooms(roomRes.data);
      setDepartments(deptRes.data);
      setProgrammes(progRes.data);
      setBlocks(blockRes.data);
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
      if (editingId) {
        await roomService.update(editingId, formData);
      } else {
        await roomService.create(formData);
      }
      setFormData({ roomNumber: '', department: '', programme: '', block: '', floor: '', capacity: '' });
      setEditingId(null);
      setShowForm(false);
      fetchData();
    } catch (err) {
      setError('Failed to save room');
    }
  };

  const handleEdit = (room) => {
    setFormData({
      ...room,
      department: room.department?._id || room.department,
      programme: room.programme?._id || room.programme,
      block: room.block?._id || room.block
    });
    setEditingId(room._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await roomService.delete(id);
        fetchData();
      } catch (err) {
        setError('Failed to delete room');
      }
    }
  };

  if (loading) return <div className="master-screen"><p>Loading...</p></div>;

  return (
    <div className="master-screen">
      <div className="screen-header">
        <div className="screen-header-left">
          <h1>Facility Rooms</h1>
          <span className="page-indicator">ROOM DIRECTORY & BLOCK ALLOCATION</span>
        </div>
        {user?.role === 'SuperAdmin' && (
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            {showForm ? 'Cancel' : '+ REGISTER ROOM'}
          </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && user?.role === 'SuperAdmin' && (
        <form onSubmit={handleSubmit} className="master-form">
          <div className="form-group">
            <label>Room Number</label>
            <input
              type="text"
              value={formData.roomNumber}
              onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
              required
              placeholder="e.g., 101"
            />
          </div>
          <div className="form-group">
            <label>Block</label>
            <select
              value={formData.block}
              onChange={(e) => setFormData({ ...formData, block: e.target.value })}
              required
            >
              <option value="">Select Block</option>
              {blocks.map((block) => (
                <option key={block._id} value={block._id}>{block.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Department (Optional)</label>
            <select
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            >
              <option value="">Select Department (Auto-inherited if empty)</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept._id}>{dept.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Programme (Optional)</label>
            <select
              value={formData.programme}
              onChange={(e) => setFormData({ ...formData, programme: e.target.value })}
            >
              <option value="">Select Programme (Optional)</option>
              {programmes.map((prog) => (
                <option key={prog._id} value={prog._id}>{prog.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Floor</label>
            <input
              type="number"
              value={formData.floor}
              onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Capacity</label>
            <input
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
            />
          </div>
          <button type="submit" className="btn-primary">
            {editingId ? 'Update' : 'Create'}
          </button>
        </form>
      )}

      <div className="master-table-container glass-card fade-in">
        <div className="registry-header-bar">
          <span className="registry-title">Room Registry</span>
          <span className="registry-badge">{rooms.length} ROOMS ACTIVE</span>
        </div>
        <table className="master-table">
          <thead>
            <tr>
              <th>ROOM ID</th>
              <th>BLOCK LOCATION</th>
              <th>DEPARTMENT</th>
              {user?.role === 'SuperAdmin' && <th className="actions-th">MANAGEMENT</th>}
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <tr key={room._id}>
                <td style={{ fontWeight: 700, color: '#38bdf8' }}>{room.roomNumber}</td>
                <td style={{ fontWeight: 600 }}>{room.block?.name || '-'}</td>
                <td>{room.department?.name || '-'}</td>
                {user?.role === 'SuperAdmin' && (
                  <td className="actions-td">
                    <div className="actions-cell">
                      <button onClick={() => handleEdit(room)} className="btn-edit">
                        <span>✏️</span> EDIT
                      </button>
                      <button onClick={() => handleDelete(room._id)} className="btn-delete">
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

export default RoomPage;
