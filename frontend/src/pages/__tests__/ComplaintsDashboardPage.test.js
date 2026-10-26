import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import ComplaintsDashboardPage from '../ComplaintsDashboardPage';
import { AuthContext } from '../../context/AuthContext';
import { complaintService, userService } from '../../services/api';

jest.mock('../../services/api', () => ({
  complaintService: {
    getAll: jest.fn(),
    getStats: jest.fn(),
    assign: jest.fn(),
    updateStatus: jest.fn(),
  },
  userService: {
    getAll: jest.fn(),
  },
}));

describe('ComplaintsDashboardPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows assignment controls so a superadmin can assign a complaint to a worker', async () => {
    complaintService.getAll.mockResolvedValue({
      data: [
        {
          _id: 'c1',
          blockName: 'Block A',
          roomNumber: '101',
          complaintType: 'Plumbing',
          remarks: 'Leak in sink',
          status: 'Pending',
          createdBy: { username: 'Alice' },
          assignedTo: null,
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      ],
    });

    complaintService.getStats.mockResolvedValue({
      data: { total: 1, pending: 1, assigned: 0, closed: 0 },
    });

    userService.getAll.mockResolvedValue({
      data: [{ _id: 'u2', username: 'Worker One', role: 'Plumber' }],
    });

    render(
      <AuthContext.Provider value={{ user: { role: 'SuperAdmin', id: 'super1' } }}>
        <ComplaintsDashboardPage />
      </AuthContext.Provider>
    );

    expect(await screen.findByText(/Assign to Worker/i)).toBeInTheDocument();
  });
});
