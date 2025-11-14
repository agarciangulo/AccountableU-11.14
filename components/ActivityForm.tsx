import React, { useState } from 'react';
import { Activity } from '../types';

interface ActivityFormProps {
  activity: Activity | null;
  onSave: (data: Omit<Activity, 'id' | 'userId'>) => void;
  onClose: () => void;
  existingCategories: string[];
}

const ActivityForm: React.FC<ActivityFormProps> = ({ activity, onSave, onClose, existingCategories }) => {
  const [name, setName] = useState(activity?.name || '');
  const [category, setCategory] = useState(activity?.category || '');
  const [goal, setGoal] = useState(activity?.goal || 0);
  const [unit, setUnit] = useState(activity?.unit || '');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, category, goal: Number(goal), unit });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md m-4" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">{activity ? 'Edit Activity' : 'Add New Activity'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Activity Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
            <input
              id="category"
              type="text"
              list="categories"
              value={category}
              onChange={e => setCategory(e.target.value)}
              required
              className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-sky-500 focus:border-sky-500"
            />
            <datalist id="categories">
              {existingCategories.map(cat => <option key={cat} value={cat} />)}
            </datalist>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="goal" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Monthly Goal</label>
              <input
                id="goal"
                type="number"
                value={goal}
                onChange={e => setGoal(Number(e.target.value))}
                required
                className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                min="0"
              />
            </div>
            <div>
              <label htmlFor="unit" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Unit</label>
              <input
                id="unit"
                type="text"
                value={unit}
                onChange={e => setUnit(e.target.value)}
                required
                placeholder="e.g. Hours, Pages"
                className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-sky-500 focus:border-sky-500"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white font-semibold rounded-lg shadow-md transition duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2 px-4 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg shadow-md transition duration-300"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ActivityForm;