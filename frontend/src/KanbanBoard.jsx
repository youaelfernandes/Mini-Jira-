import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  FolderKanban,
  Kanban,
  LogOut,
  Plus,
  Trash2,
} from 'lucide-react';
import api from './api';

const COLUMNS = [
  { key: 'TODO', title: 'To Do', badge: 'bg-slate-700 text-slate-200' },
  { key: 'IN_PROGRESS', title: 'In Progress', badge: 'bg-amber-500/20 text-amber-300' },
  { key: 'DONE', title: 'Done', badge: 'bg-emerald-500/20 text-emerald-300' },
];

export default function KanbanBoard({ user, onLogout }) {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [tasks, setTasks] = useState([]);

  // New project form state
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');

  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');

  // 1. Load user's projects on mount
  useEffect(() => {
    fetchProjects();
  }, []);

  // 2. Load tasks whenever selectedProject changes
  useEffect(() => {
    if (selectedProject) {
      fetchTasks(selectedProject.id);
    } else {
      setTasks([]);
    }
  }, [selectedProject]);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
      if (res.data.length > 0 && !selectedProject) {
        setSelectedProject(res.data[0]);
      }
    } catch (err) {
      console.error('Failed to fetch projects', err);
    }
  };

  const fetchTasks = async (projectId) => {
    try {
      const res = await api.get(`/projects/${projectId}/tasks`);
      setTasks(res.data);
    } catch (err) {
      console.error('Failed to fetch tasks', err);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    try {
      const res = await api.post('/projects', {
        name: newProjectName,
        description: newProjectDesc,
      });
      const updated = [...projects, res.data];
      setProjects(updated);
      setSelectedProject(res.data);
      setNewProjectName('');
      setNewProjectDesc('');
    } catch (err) {
      console.error('Failed to create project', err);
    }
  };

  const handleDeleteProject = async (projectId) => {
    try {
      await api.delete(`/projects/${projectId}`);
      const remaining = projects.filter((p) => p.id !== projectId);
      setProjects(remaining);
      setSelectedProject(remaining.length > 0 ? remaining[0] : null);
    } catch (err) {
      console.error('Failed to delete project', err);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!selectedProject || !newTaskTitle.trim()) return;
    try {
      const res = await api.post(`/projects/${selectedProject.id}/tasks`, {
        title: newTaskTitle,
        description: newTaskDesc,
      });
      setTasks([...tasks, res.data]);
      setNewTaskTitle('');
      setNewTaskDesc('');
    } catch (err) {
      console.error('Failed to create task', err);
    }
  };

  const handleMoveTask = async (taskId, newStatus) => {
    try {
      const res = await api.patch(`/tasks/${taskId}/status`, null, {
        params: { status: newStatus },
      });
      setTasks(tasks.map((t) => (t.id === taskId ? res.data : t)));
    } catch (err) {
      console.error('Failed to update task status', err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter((t) => t.id !== taskId));
    } catch (err) {
      console.error('Failed to delete task', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/70 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="bg-blue-600 p-2 rounded-xl">
            <Kanban className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">Mini Jira</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-400">
            Signed in as <strong className="text-slate-200">{user.name}</strong>
          </span>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm px-3 py-1.5 rounded-lg transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Left Sidebar: Projects */}
        <aside className="w-full md:w-72 border-b md:border-b-0 md:border-r border-slate-800 bg-slate-900/40 p-5 flex flex-col gap-6">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <FolderKanban className="w-4 h-4" /> Your Projects
            </h2>

            <div className="space-y-1.5">
              {projects.length === 0 && (
                <p className="text-xs text-slate-500">No projects yet. Create one below.</p>
              )}
              {projects.map((proj) => (
                <div
                  key={proj.id}
                  onClick={() => setSelectedProject(proj)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm cursor-pointer transition ${
                    selectedProject?.id === proj.id
                      ? 'bg-blue-600 text-white font-medium'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span className="truncate">{proj.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteProject(proj.id);
                    }}
                    className="opacity-60 hover:opacity-100 p-1 cursor-pointer"
                    title="Delete project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Create Project Form */}
          <form onSubmit={handleCreateProject} className="space-y-2.5 border-t border-slate-800 pt-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              New Project
            </h3>
            <input
              type="text"
              required
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Project name..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
            <input
              type="text"
              value={newProjectDesc}
              onChange={(e) => setNewProjectDesc(e.target.value)}
              placeholder="Short description (optional)"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium py-2 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Create Project
            </button>
          </form>
        </aside>

        {/* Right Area: Kanban Board */}
        <main className="flex-1 p-6 overflow-x-auto">
          {!selectedProject ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500">
              <FolderKanban className="w-12 h-12 mb-3 opacity-40" />
              <p className="text-lg font-medium text-slate-300">No Project Selected</p>
              <p className="text-sm">Create a project on the left to start your Kanban board.</p>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Project Title & Add Task Bar */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
                <div>
                  <h1 className="text-2xl font-bold">{selectedProject.name}</h1>
                  {selectedProject.description && (
                    <p className="text-sm text-slate-400 mt-0.5">{selectedProject.description}</p>
                  )}
                </div>

                {/* Add Task Inline Form */}
                <form onSubmit={handleCreateTask} className="flex flex-wrap sm:flex-nowrap gap-2">
                  <input
                    type="text"
                    required
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="New task title..."
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    value={newTaskDesc}
                    onChange={(e) => setNewTaskDesc(e.target.value)}
                    placeholder="Details (optional)"
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Add Task
                  </button>
                </form>
              </div>

              {/* 3-Column Kanban Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {COLUMNS.map((col, colIndex) => {
                  const colTasks = tasks.filter((t) => t.status === col.key);

                  return (
                    <div
                      key={col.key}
                      className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex flex-col min-h-[420px]"
                    >
                      {/* Column Header */}
                      <div className="flex items-center justify-between mb-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${col.badge}`}>
                          {col.title}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">{colTasks.length}</span>
                      </div>

                      {/* Task Cards */}
                      <div className="space-y-3 flex-1">
                        {colTasks.length === 0 && (
                          <div className="border border-dashed border-slate-800 rounded-xl p-6 text-center text-xs text-slate-500">
                            No tasks in {col.title}
                          </div>
                        )}

                        {colTasks.map((task) => (
                          <div
                            key={task.id}
                            className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl p-4 shadow-sm space-y-3 transition"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-medium text-sm text-slate-100">{task.title}</h4>
                              <button
                                onClick={() => handleDeleteTask(task.id)}
                                className="text-slate-500 hover:text-red-400 transition cursor-pointer"
                                title="Delete task"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            {task.description && (
                              <p className="text-xs text-slate-400 leading-relaxed">
                                {task.description}
                              </p>
                            )}

                            {/* Move Left / Right Controls */}
                            <div className="flex items-center justify-between pt-2 border-t border-slate-900">
                              {colIndex > 0 ? (
                                <button
                                  onClick={() => handleMoveTask(task.id, COLUMNS[colIndex - 1].key)}
                                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 bg-slate-900 px-2.5 py-1 rounded-md transition cursor-pointer"
                                >
                                  <ArrowLeft className="w-3.5 h-3.5" />
                                  {COLUMNS[colIndex - 1].title}
                                </button>
                              ) : (
                                <span />
                              )}

                              {colIndex < COLUMNS.length - 1 ? (
                                <button
                                  onClick={() => handleMoveTask(task.id, COLUMNS[colIndex + 1].key)}
                                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 bg-blue-500/10 px-2.5 py-1 rounded-md transition cursor-pointer"
                                >
                                  {COLUMNS[colIndex + 1].title}
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <span />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}