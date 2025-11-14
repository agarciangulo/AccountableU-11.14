import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getActivities, addActivity, updateActivity, deleteActivity, getMockUserId, updateCategoryName, removeCategory } from '../services/firestoreService';
import { Activity } from '../types';
import ActivityForm from './ActivityForm';
import { PencilIcon, TrashIcon, PlusIcon } from './icons';

const CategoryFormModal: React.FC<{
  mode: 'add' | 'rename';
  categoryName?: string;
  onSave: (name: string, oldName?: string) => void;
  onClose: () => void;
  existingCategories: string[];
}> = ({ mode, categoryName, onSave, onClose, existingCategories }) => {
    const [name, setName] = useState(categoryName || '');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedName = name.trim();
        if (!trimmedName) {
            setError('Category name cannot be empty.');
            return;
        }
        if (existingCategories.some(c => c.toLowerCase() === trimmedName.toLowerCase() && c.toLowerCase() !== categoryName?.toLowerCase())) {
            setError('This category name already exists.');
            return;
        }
        onSave(trimmedName, categoryName);
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md m-4" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">{mode === 'rename' ? 'Rename Category' : 'Add New Category'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="category-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category Name</label>
                        <input
                            id="category-name"
                            type="text"
                            value={name}
                            onChange={e => {
                                setName(e.target.value);
                                setError('');
                            }}
                            required
                            autoFocus
                            className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                        />
                         {error && <p className="mt-2 text-sm text-red-600 dark:text-red-500">{error}</p>}
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white font-semibold rounded-lg shadow-md transition duration-300">Cancel</button>
                        <button type="submit" className="py-2 px-4 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg shadow-md transition duration-300">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

const DeleteCategoryModal: React.FC<{
    categoryName: string;
    activityCount: number;
    onConfirm: () => void;
    onClose: () => void;
}> = ({ categoryName, activityCount, onConfirm, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md m-4" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Delete Category</h2>
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                    You are about to delete the category "{categoryName}". This will remove the category from {activityCount} activit{activityCount === 1 ? 'y' : 'ies'}, but will not delete the activities themselves.
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Are you sure you want to proceed?</p>
                <div className="flex justify-end space-x-3 pt-6">
                    <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white font-semibold rounded-lg shadow-md transition duration-300">Cancel</button>
                    <button onClick={onConfirm} className="py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md transition duration-300">Delete</button>
                </div>
            </div>
        </div>
    );
}


const ManageActivitiesView: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [categoryModal, setCategoryModal] = useState<{ mode: 'add' | 'rename', name?: string } | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<string | null>(null);
  const [transientCategories, setTransientCategories] = useState<string[]>([]);


  const userId = getMockUserId();

  const fetchActivities = useCallback(() => {
    getActivities(userId)
      .then(setActivities)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => {
    setLoading(true);
    fetchActivities();
  }, [fetchActivities]);
  
  const allUniqueCategories = useMemo(() => {
    const fromActivities = activities.map(a => a.category).filter(Boolean);
    const combined = new Set([...fromActivities, ...transientCategories]);
    return [...combined].sort((a,b) => a.localeCompare(b));
  }, [activities, transientCategories]);

  const handleOpenActivityModal = (activity: Activity | null = null) => {
    setEditingActivity(activity);
    setIsActivityModalOpen(true);
  };

  const handleCloseActivityModal = () => {
    setIsActivityModalOpen(false);
    setEditingActivity(null);
  };

  const handleSaveActivity = async (data: Omit<Activity, 'id' | 'userId'>) => {
    setLoading(true);
    if (editingActivity) {
      await updateActivity(editingActivity.id, data);
    } else {
      await addActivity(userId, data);
    }
    // If a new category was used, it's no longer transient
    setTransientCategories(prev => prev.filter(c => c !== data.category));
    fetchActivities();
    handleCloseActivityModal();
  };

  const handleDeleteActivity = async (activityId: string) => {
    if (window.confirm('Are you sure you want to delete this activity? All associated logs will also be removed.')) {
      setLoading(true);
      await deleteActivity(activityId);
      fetchActivities();
    }
  };

  const handleSaveCategory = async (newName: string, oldName?: string) => {
    setLoading(true);
    if (categoryModal?.mode === 'rename' && oldName) {
        await updateCategoryName(userId, oldName, newName);
    } else {
        // Add to transient state. It becomes permanent when an activity uses it.
        setTransientCategories(prev => [...new Set([...prev, newName])]);
    }
    setCategoryModal(null);
    fetchActivities();
  }

  const handleDeleteCategory = async (categoryName: string) => {
    const activityCount = activities.filter(a => a.category === categoryName).length;
    if (activityCount > 0) {
        setDeletingCategory(categoryName);
    } else {
        // Category is not in use, just remove it from transient state if it exists
        setTransientCategories(prev => prev.filter(c => c !== categoryName));
    }
  }

  const confirmDeleteCategory = async () => {
    if (deletingCategory) {
        setLoading(true);
        await removeCategory(userId, deletingCategory);
        setDeletingCategory(null);
        fetchActivities();
    }
  }

  if (loading) {
    return <div className="text-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-12">
      {/* Manage Activities Section */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-sky-700 dark:text-sky-300">Manage Activities</h2>
          <button onClick={() => handleOpenActivityModal()} className="flex items-center bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-lg transition">
            <PlusIcon /> <span className="ml-2">Add Activity</span>
          </button>
        </div>
        <div className="bg-white/50 dark:bg-gray-800/50 shadow-lg rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Activity</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Category</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Monthly Goal</th>
                  <th scope="col" className="relative px-6 py-3"><span className="sr-only">Edit</span></th>
                </tr>
              </thead>
              <tbody className="bg-white/50 dark:bg-gray-800/50 divide-y divide-gray-200 dark:divide-gray-700">
                {activities.map(activity => (
                  <tr key={activity.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{activity.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{activity.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{activity.goal} {activity.unit}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end items-center space-x-4">
                        <button onClick={() => handleOpenActivityModal(activity)} className="text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 transition"><PencilIcon /></button>
                        <button onClick={() => handleDeleteActivity(activity.id)} className="text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400 transition"><TrashIcon /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {activities.length === 0 && <p className="text-center text-gray-500 dark:text-gray-400 py-8">No activities yet. Add one to get started!</p>}
          </div>
        </div>
      </div>
      
      {/* Manage Categories Section */}
      <div className="space-y-6">
         <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-sky-700 dark:text-sky-300">Manage Categories</h2>
            <button onClick={() => setCategoryModal({ mode: 'add' })} className="flex items-center bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition">
                <PlusIcon /> <span className="ml-2">Add Category</span>
            </button>
         </div>
         <p className="text-sm text-gray-500 dark:text-gray-400 -mt-4">Note: New categories are only saved permanently once assigned to an activity.</p>
         <div className="bg-white/50 dark:bg-gray-800/50 shadow-lg rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Category Name</th>
                  <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="bg-white/50 dark:bg-gray-800/50 divide-y divide-gray-200 dark:divide-gray-700">
                {allUniqueCategories.map(category => (
                    <tr key={category}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{category}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end items-center space-x-4">
                          <button onClick={() => setCategoryModal({ mode: 'rename', name: category })} className="text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 transition"><PencilIcon /></button>
                          <button onClick={() => handleDeleteCategory(category)} className="text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400 transition"><TrashIcon /></button>
                        </div>
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
            {allUniqueCategories.length === 0 && <p className="text-center text-gray-500 dark:text-gray-400 py-8">No categories found. Add one to get started!</p>}
          </div>
        </div>
      </div>

      {isActivityModalOpen && (
        <ActivityForm
          activity={editingActivity}
          onSave={handleSaveActivity}
          onClose={handleCloseActivityModal}
          existingCategories={allUniqueCategories}
        />
      )}

      {categoryModal && (
        <CategoryFormModal 
            mode={categoryModal.mode}
            categoryName={categoryModal.name}
            onSave={handleSaveCategory}
            onClose={() => setCategoryModal(null)}
            existingCategories={allUniqueCategories}
        />
      )}

      {deletingCategory && (
        <DeleteCategoryModal
            categoryName={deletingCategory}
            activityCount={activities.filter(a => a.category === deletingCategory).length}
            onConfirm={confirmDeleteCategory}
            onClose={() => setDeletingCategory(null)}
        />
      )}
    </div>
  );
};

export default ManageActivitiesView;