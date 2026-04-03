import React, { useMemo, useState } from 'react';
import { useApp } from '@/app/context/AppContext';
import { Plus, Trash2, Mail, Phone, UserCog } from 'lucide-react';
import { Dialog } from '@/app/components/Dialog';
import { ConfirmDialog } from '@/app/components/ConfirmDialog';

type StaffRole = 'airline-staff' | 'gate-staff' | 'ground-staff';

export function ManageStaff() {
  const { staff, addStaff, removeStaff } = useApp();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [showCredentialsDialog, setShowCredentialsDialog] = useState(false);

  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [newCredentials, setNewCredentials] = useState<{ username: string; password: string }>({ username: '', password: '' });

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'airline-staff' as StaffRole,
    airline: 'AA',
  });

  const staffByRole = useMemo(() => {
    return {
      airline: staff.filter(s => s.role === 'airline-staff'),
      gate: staff.filter(s => s.role === 'gate-staff'),
      ground: staff.filter(s => s.role === 'ground-staff'),
    };
  }, [staff]);

  const resetForm = () => {
    setForm({ firstName: '', lastName: '', email: '', phone: '', role: 'airline-staff', airline: 'AA' });
  };

  const handleCreate = async () => {
    const creds = await addStaff({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      role: form.role,
      ...(form.role === 'ground-staff' ? {} : { airline: form.airline.trim() }),
    });

    if (creds.username) {
      setNewCredentials(creds);
      setShowAddDialog(false);
      resetForm();
      setShowCredentialsDialog(true);
    }
  };

  const handleRemove = () => {
    if (!selectedStaffId) return;
    removeStaff(selectedStaffId);
    setSelectedStaffId(null);
    setShowRemoveDialog(false);
  };

  const StaffTable = ({ title, list }: { title: string; list: typeof staff }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <UserCog className="w-5 h-5 text-gray-700" />
          {title}
        </h2>
        <span className="text-sm text-gray-500">{list.length} total</span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Role</th>
              <th className="py-2 pr-4">Airline</th>
              <th className="py-2 pr-4">Email</th>
              <th className="py-2 pr-4">Phone</th>
              <th className="py-2 pr-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map(s => (
              <tr key={s.id} className="border-b last:border-b-0 hover:bg-gray-50">
                <td className="py-3 pr-4 font-medium text-gray-900">{s.firstName} {s.lastName}</td>
                <td className="py-3 pr-4 capitalize text-gray-700">{s.role.replace('-', ' ')}</td>
                <td className="py-3 pr-4 text-gray-700">{s.airline || 'N/A'}</td>
                <td className="py-3 pr-4 text-gray-700">
                  <span className="inline-flex items-center gap-2"><Mail className="w-4 h-4 text-gray-500" />{s.email}</span>
                </td>
                <td className="py-3 pr-4 text-gray-700">
                  <span className="inline-flex items-center gap-2"><Phone className="w-4 h-4 text-gray-500" />{s.phone}</span>
                </td>
                <td className="py-3 pr-2 text-right">
                  <button
                    onClick={() => { setSelectedStaffId(s.id); setShowRemoveDialog(true); }}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-700"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove
                  </button>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500">No staff added yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="p-8">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Manage Staff</h1>
          <p className="text-gray-500 mt-1">Add, review, and remove staff operators for the airport luggage system</p>
        </div>
        <button
          onClick={() => setShowAddDialog(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800"
        >
          <Plus className="w-4 h-4" />
          Add Staff
        </button>
      </div>

      <StaffTable title="Airline Staff" list={staffByRole.airline} />
      <StaffTable title="Gate Staff" list={staffByRole.gate} />
      <StaffTable title="Ground Staff" list={staffByRole.ground} />

      <Dialog
        isOpen={showAddDialog}
        onClose={() => { setShowAddDialog(false); resetForm(); }}
        title="Add Staff Member"
        maxWidth="max-w-lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-600">First Name</label>
              <input
                value={form.firstName}
                onChange={e => setForm(prev => ({ ...prev, firstName: e.target.value }))}
                className="w-full mt-1 px-3 py-2 border rounded-lg"
                placeholder="First name"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600">Last Name</label>
              <input
                value={form.lastName}
                onChange={e => setForm(prev => ({ ...prev, lastName: e.target.value }))}
                className="w-full mt-1 px-3 py-2 border rounded-lg"
                placeholder="Last name"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-600">Email</label>
              <input
                value={form.email}
                onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                className="w-full mt-1 px-3 py-2 border rounded-lg"
                placeholder="name@company.com"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600">Phone</label>
              <input
                value={form.phone}
                onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full mt-1 px-3 py-2 border rounded-lg"
                placeholder="10 digits, no leading 0"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-600">Role</label>
              <select
                value={form.role}
                onChange={e => setForm(prev => ({ ...prev, role: e.target.value as StaffRole }))}
                className="w-full mt-1 px-3 py-2 border rounded-lg"
              >
                <option value="airline-staff">Airline staff</option>
                <option value="gate-staff">Gate staff</option>
                <option value="ground-staff">Ground staff</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-600">Airline Code</label>
              <input
                value={form.airline}
                onChange={e => setForm(prev => ({ ...prev, airline: e.target.value.toUpperCase() }))}
                className="w-full mt-1 px-3 py-2 border rounded-lg disabled:bg-gray-100"
                placeholder="AA"
                disabled={form.role === 'ground-staff'}
              />
              {form.role === 'ground-staff' && (
                <p className="text-xs text-gray-500 mt-1">Ground staff are not associated with an airline.</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => { setShowAddDialog(false); resetForm(); }}
              className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              className="px-4 py-2 rounded-xl bg-gray-900 text-white hover:bg-gray-800"
            >
              Create and Send Credentials
            </button>
          </div>

          <p className="text-xs text-gray-500">
            Username and password are auto-generated and emailed to the staff member (simulated for this class project).
          </p>
        </div>
      </Dialog>

      <Dialog
        isOpen={showCredentialsDialog}
        onClose={() => setShowCredentialsDialog(false)}
        title="Credentials Generated"
        maxWidth="max-w-md"
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-700">
            Credentials were generated and sent by email (simulated). For grading and demo purposes, they are shown once here.
          </p>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Username</span>
              <span className="font-mono text-gray-900">{newCredentials.username}</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-gray-600">Temporary password</span>
              <span className="font-mono text-gray-900">Sent by email (simulated)</span>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => setShowCredentialsDialog(false)}
              className="px-4 py-2 rounded-xl bg-gray-900 text-white hover:bg-gray-800"
            >
              Done
            </button>
          </div>
        </div>
      </Dialog>

      <ConfirmDialog
        isOpen={showRemoveDialog}
        onClose={() => setShowRemoveDialog(false)}
        onConfirm={handleRemove}
        title="Remove Staff Member"
        message="Are you sure you want to remove this staff member? This action cannot be undone."
      />
    </div>
  );
}
