import React, { useState } from 'react';
import { Plus, Edit, Trash2, Target } from 'lucide-react';
import { useAppStore } from '../store';
import type { Project } from '../types';
import { format } from 'date-fns';

const Projects: React.FC = () => {
  const { projects, addProject, updateProject, deleteProject } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    type: 'custom' as Project['type'],
    targetAmount: 0,
    currentAmount: 0,
    targetDate: '',
    priority: 'medium' as Project['priority'],
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingProject) {
      updateProject(editingProject.id, formData);
    } else {
      const newProject: Project = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString(),
      };
      addProject(newProject);
    }

    setFormData({
      name: '',
      type: 'custom',
      targetAmount: 0,
      currentAmount: 0,
      targetDate: '',
      priority: 'medium',
    });
    setShowForm(false);
    setEditingProject(null);
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      type: project.type,
      targetAmount: project.targetAmount,
      currentAmount: project.currentAmount,
      targetDate: project.targetDate || '',
      priority: project.priority,
    });
    setShowForm(true);
  };

  const projectTypeLabels = {
    car_purchase: 'Car Purchase',
    land_buy: 'Land Purchase',
    farming: 'Farming',
    custom: 'Custom',
  };

  const priorityColors = {
    low: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Projects & Goals</h1>
          <p className="text-gray-600 dark:text-gray-400">Track your financial goals and projects</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Project
        </button>
      </div>

      {/* Project Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="card p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              {editingProject ? 'Edit Project' : 'Add New Project'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Project Name</label>
                <input
                  type="text"
                  className="input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Buy a Car"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Project Type</label>
                <select
                  className="input"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as Project['type'] })}
                >
                  {Object.entries(projectTypeLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Target Amount</label>
                <input
                  type="number"
                  className="input"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({ ...formData, targetAmount: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Current Amount</label>
                <input
                  type="number"
                  className="input"
                  value={formData.currentAmount}
                  onChange={(e) => setFormData({ ...formData, currentAmount: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Target Date</label>
                <input
                  type="date"
                  className="input"
                  value={formData.targetDate}
                  onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Priority</label>
                <select
                  className="input"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as Project['priority'] })}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  {editingProject ? 'Update' : 'Add'} Project
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingProject(null);
                    setFormData({
                      name: '',
                      type: 'custom',
                      targetAmount: 0,
                      currentAmount: 0,
                      targetDate: '',
                      priority: 'medium',
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

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => {
          const progress = (project.currentAmount / project.targetAmount) * 100;
          const daysLeft = project.targetDate ? Math.ceil((new Date(project.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;
          
          return (
            <div key={project.id} className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{project.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {projectTypeLabels[project.type]}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleEdit(project)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                  >
                    <Edit className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  </button>
                  <button
                    onClick={() => deleteProject(project.id)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Progress</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{progress.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Current</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(project.currentAmount)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Target</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(project.targetAmount)}</span>
                </div>

                {project.targetDate && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Target Date</span>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {format(new Date(project.targetDate), 'MMM dd, yyyy')}
                      </div>
                      {daysLeft !== null && (
                        <div className={`text-xs ${daysLeft > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {daysLeft > 0 ? `${daysLeft} days left` : `${Math.abs(daysLeft)} days overdue`}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Priority</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[project.priority]}`}>
                    {project.priority.charAt(0).toUpperCase() + project.priority.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-12">
          <Target className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-600 mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">No projects yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Create your first financial goal to start tracking progress
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Project
          </button>
        </div>
      )}
    </div>
  );
};

export default Projects;