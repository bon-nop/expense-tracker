import React, { useState, useEffect } from 'react';
import { PlusIcon, UserGroupIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import api from '../utils/api';

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    inviteCode: ''
  });

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await api.get('/groups');
      setGroups(response.data.groups);
    } catch (error) {
      console.error('Failed to fetch groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/groups', { name: formData.name });
      setGroups([response.data.group, ...groups]);
      setShowCreateModal(false);
      setFormData({ name: '', inviteCode: '' });
    } catch (error) {
      console.error('Failed to create group:', error);
    }
  };

  const handleJoinGroup = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/groups/join', { inviteCode: formData.inviteCode });
      setGroups([response.data.group, ...groups]);
      setShowJoinModal(false);
      setFormData({ name: '', inviteCode: '' });
    } catch (error) {
      console.error('Failed to join group:', error);
      alert(error.response?.data?.message || 'Failed to join group');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Groups</h1>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowJoinModal(true)}
            className="btn-secondary"
          >
            <ClipboardDocumentIcon className="h-5 w-5 inline mr-2" />
            Join Group
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            <PlusIcon className="h-5 w-5 inline mr-2" />
            Create Group
          </button>
        </div>
      </div>

      {/* Groups Grid */}
      {groups.length === 0 ? (
        <div className="card text-center py-12">
          <UserGroupIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No groups yet</h3>
          <p className="text-gray-500 mb-6">Create your first group or join an existing one to start tracking shared expenses</p>
          <div className="flex justify-center space-x-3">
            <button
              onClick={() => setShowJoinModal(true)}
              className="btn-secondary"
            >
              Join Group
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              Create Group
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <div key={group._id} className="card hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                    <UserGroupIcon className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{group.name}</h3>
                    <p className="text-sm text-gray-500">Code: {group.inviteCode}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                  {group.members.slice(0, 4).map((member, index) => (
                    <div
                      key={index}
                      className="w-8 h-8 bg-gray-300 rounded-full border-2 border-white flex items-center justify-center"
                    >
                      <span className="text-xs font-medium text-gray-600">
                        {member.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  ))}
                  {group.members.length > 4 && (
                    <div className="w-8 h-8 bg-gray-200 rounded-full border-2 border-white flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-600">
                        +{group.members.length - 4}
                      </span>
                    </div>
                  )}
                </div>
                <span className="text-sm text-gray-500">
                  {group.members.length} {group.members.length === 1 ? 'member' : 'members'}
                </span>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <button className="w-full text-primary-600 hover:text-primary-700 font-medium text-sm">
                  View Group →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Group</h2>
            
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  placeholder="Enter group name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                >
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join Group Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Join Group</h2>
            
            <form onSubmit={handleJoinGroup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Invite Code</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  placeholder="Enter 6-character code"
                  value={formData.inviteCode}
                  onChange={(e) => setFormData({...formData, inviteCode: e.target.value.toUpperCase()})}
                  maxLength={6}
                />
                <p className="text-xs text-gray-500 mt-1">Ask the group owner for the invite code</p>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                >
                  Join Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Groups;
