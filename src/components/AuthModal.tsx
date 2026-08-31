import React, { useState } from 'react';
import { storageService } from '../services/storageService';
import type { UserAccount } from '../services/storageService';
import { X, User, Phone, Mail } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
  onUserUpdated: (user: UserAccount) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserUpdated
}) => {
  const [mode, setMode] = useState<'profile' | 'login' | 'register'>('profile');
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [phone, setPhone] = useState(currentUser.phone);
  const [city, setCity] = useState(currentUser.city);
  const [role, setRole] = useState<UserAccount['role']>(currentUser.role);
  const [loginEmail, setLoginEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserAccount = {
      ...currentUser,
      name,
      email,
      phone,
      city,
      role
    };
    storageService.updateUserProfile(updated);
    onUserUpdated(updated);
    onClose();
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const user = storageService.loginUser(loginEmail);
    if (user) {
      onUserUpdated(user);
      onClose();
    } else {
      setErrorMsg('No registered volunteer found with that email. Please register below.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone) {
      setErrorMsg('Please fill in name, email, and phone number.');
      return;
    }
    const user = storageService.registerUser(name, email, phone, role, city || 'Roseburg');
    onUserUpdated(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-emerald-100 animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="bg-emerald-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <User className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-lg">
              {mode === 'profile' && 'Volunteer Profile Details'}
              {mode === 'login' && 'Volunteer Log In'}
              {mode === 'register' && 'Register Volunteer Account'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-emerald-200 hover:text-white rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher inside modal */}
        <div className="flex border-b bg-emerald-50 text-xs font-semibold text-emerald-900">
          <button
            onClick={() => setMode('profile')}
            className={`flex-1 py-2 text-center border-b-2 ${mode === 'profile' ? 'border-amber-500 text-emerald-950 font-bold bg-white' : 'border-transparent text-emerald-700'}`}
          >
            My Profile
          </button>
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-2 text-center border-b-2 ${mode === 'login' ? 'border-amber-500 text-emerald-950 font-bold bg-white' : 'border-transparent text-emerald-700'}`}
          >
            Switch Account
          </button>
          <button
            onClick={() => setMode('register')}
            className={`flex-1 py-2 text-center border-b-2 ${mode === 'register' ? 'border-amber-500 text-emerald-950 font-bold bg-white' : 'border-transparent text-emerald-700'}`}
          >
            Register New
          </button>
        </div>

        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              {errorMsg}
            </div>
          )}

          {/* MODE: EDIT PROFILE */}
          {mode === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4 text-sm text-gray-800">
              <div>
                <label className="block font-medium text-gray-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Role / Capacity</label>
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value as UserAccount['role'])}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  >
                    <option value="Hotline Operator">Hotline Operator</option>
                    <option value="Rehabber">Rehabber</option>
                    <option value="Critter Carrier">Critter Carrier</option>
                    <option value="Volunteer Coordinator">Volunteer Coordinator</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-1">City / Region</label>
                  <input
                    type="text"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    placeholder="e.g. Roseburg"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border text-gray-600 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg font-medium shadow"
                >
                  Save Profile
                </button>
              </div>
            </form>
          )}

          {/* MODE: LOGIN */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4 text-sm text-gray-800">
              <div>
                <label className="block font-medium text-gray-700 mb-1">Volunteer Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="brandon@umpquawildlife.org"
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="submit"
                  className="w-full py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg font-medium shadow"
                >
                  Log In
                </button>
              </div>
            </form>
          )}

          {/* MODE: REGISTER */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4 text-sm text-gray-800">
              <div>
                <label className="block font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Jane Doe"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="jane@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="541-555-0199"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value as UserAccount['role'])}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  >
                    <option value="Hotline Operator">Hotline Operator</option>
                    <option value="Rehabber">Rehabber</option>
                    <option value="Critter Carrier">Critter Carrier</option>
                    <option value="Volunteer Coordinator">Volunteer Coordinator</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-1">City / Region</label>
                  <input
                    type="text"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    placeholder="e.g. Roseburg"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg font-medium shadow"
                >
                  Create Volunteer Account
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
