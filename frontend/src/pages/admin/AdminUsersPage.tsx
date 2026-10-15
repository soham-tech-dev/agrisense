import React, { useEffect, useState } from 'react';
import { Users, Search, ShieldCheck, UserCheck, RefreshCw, Filter } from 'lucide-react';
import axios from 'axios';

interface UserItem {
  id: string;
  phone: string;
  name: string;
  village: string;
  district: string;
  language: string;
  role: string;
  scans_count: number;
  chats_count: number;
  created_at: string;
}

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('agrisense_token');
      const res = await axios.get('/api/v1/admin/users', {
        params: { search: search || undefined },
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const handleRoleToggle = async (userId: string, currentRole: string) => {
    const newRole = currentRole.toUpperCase() === 'ADMIN' ? 'FARMER' : 'ADMIN';
    setUpdatingId(userId);
    try {
      const token = localStorage.getItem('agrisense_token');
      await axios.patch(
        `/api/v1/admin/users/${userId}/role`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      console.error('Role update failed:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-400" />
            <span>User Management (वापरकर्ते व्यवस्थापन)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Search users, view crop scan & chat activity, and manage administrative roles securely.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, phone, district..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs flex items-center justify-center">
            <RefreshCw className="w-4 h-4 animate-spin mr-2 text-emerald-400" />
            <span>Loading user accounts...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">No users found matching search query.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-4">User Info</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Language</th>
                  <th className="p-4 text-center">Activity</th>
                  <th className="p-4">Role</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-850/50 transition">
                    <td className="p-4">
                      <div className="font-bold text-white">{u.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{u.phone}</div>
                    </td>
                    <td className="p-4">
                      <div>{u.village}</div>
                      <div className="text-[11px] text-slate-400 font-semibold">{u.district}</div>
                    </td>
                    <td className="p-4 uppercase font-bold text-slate-400">{u.language}</td>
                    <td className="p-4 text-center">
                      <span className="inline-block px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold mr-1">
                        {u.scans_count} Scans
                      </span>
                      <span className="inline-block px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 text-[10px] font-bold">
                        {u.chats_count} Chats
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                          u.role?.toUpperCase() === 'ADMIN'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleRoleToggle(u.id, u.role)}
                        disabled={updatingId === u.id}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-[11px] font-bold text-slate-200 transition disabled:opacity-50"
                      >
                        {updatingId === u.id
                          ? 'Updating...'
                          : u.role?.toUpperCase() === 'ADMIN'
                          ? 'Demote to Farmer'
                          : 'Promote to Admin'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
