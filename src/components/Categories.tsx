import React, { useState } from 'react';
import { Plus, Edit, Trash2, Tag } from 'lucide-react';
import { useAppStore } from '../store';
import type { Category } from '../types';

const Categories: React.FC = () => {
  const { categories, addCategory, updateCategory, deleteCategory } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    type: 'expense' as Category['type'],
    group: 'need' as Category['group'],
    color: '#3b82f6',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCategory) {
      updateCategory(editingCategory.id, formData);
    } else {
      const newCategory: Category = {
        id: Date.now().toString(),
        ...formData,
      };
      addCategory(newCategory);
    }

    setFormData({
      name: '',
      type: 'expense',
      group: 'need',
      color: '#3b82f6',
    });
    setShowForm(false);
    setEditingCategory(null);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      type: category.type,
      group: category.group,
      color: category.color,
    });
    setShowForm(true);
  };

  const typeLabels = {
    income: 'Income',
    expense: 'Expense',
    savings: 'Savings',
    transfer: 'Transfer',
  };

  const groupLabels = {
    need: 'Need',
    want: 'Want',
    wealth: 'Wealth Building',
    obligation: 'Obligation',
  };

  const predefinedColors = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
    '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
    '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
    '#ec4899', '#f43f5e', '#6b7280', '#374151', '#1f2937'
  ];

  const groupedCategories = {
    income: categories.filter(cat => cat.type === 'income'),
    expense: categories.filter(cat => cat.type === 'expense'),
    savings: categories.filter(cat => cat.type === 'savings'),
    transfer: categories.filter(cat => cat.type === 'transfer'),
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Categories</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your transaction categories</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </button>
      </div>

      {/* Category Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="card p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Category Name</label>
                <input
                  type="text"
                  className="input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Internet, Bundles, Gym"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Type</label>
                <select
                  className="input"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as Category['type'] })}
                >
                  {Object.entries(typeLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Group</label>
                <select
                  className="input"
                  value={formData.group}
                  onChange={(e) => setFormData({ ...formData, group: e.target.value as Category['group'] })}
                >
                  {Object.entries(groupLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Color</label>
                <div className="grid grid-cols-10 gap-2 mb-3">
                  {predefinedColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 ${
                        formData.color === color ? 'border-gray-900 dark:border-white' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData({ ...formData, color })}
                    />
                  ))}
                </div>
                <input
                  type="color"
                  className="w-full h-10 rounded-md border border-gray-300 dark:border-gray-600"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  {editingCategory ? 'Update' : 'Add'} Category
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingCategory(null);
                    setFormData({
                      name: '',
                      type: 'expense',
                      group: 'need',
                      color: '#3b82f6',
                    });
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Categories by Type */}
      {Object.entries(groupedCategories).map(([type, categoryList]) => (
        <div key={type} className="card p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Tag className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {typeLabels[type as keyof typeof typeLabels]} Categories
            </h2>
            <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full text-sm">
              {categoryList.length}
            </span>
          </div>

          {categoryList.length === 0 ? (
            <div className="text-center py-8 text-gray-600 dark:text-gray-400">
              No {type} categories yet
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryList.map((category) => (
                <div key={category.id} className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">{category.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {groupLabels[category.group]}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleEdit(category)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                    >
                      <Edit className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </button>
                    <button
                      onClick={() => deleteCategory(category.id)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Categories;