import React, { useEffect, useState } from 'react';
import './style.css';
import ProjectList from './components/ProjectList';
import TaskList from './components/TaskList';
import GanttChart from './components/GanttChart';
import ProjectModal from './components/ProjectModal';
import TaskModal from './components/TaskModal';
import ChatBox from './components/ChatBox';
import ConfirmModal from './components/ConfirmModal';
import RequirementModal from './components/RequirementModal';

//开发环境使用本地api
// const API_BASE = 'http://localhost:8080/api';
//生产环境使用服务器api
const API_BASE = '/api';


function App() {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [projectModalVisible, setProjectModalVisible] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({});
  const [isManager, setIsManager] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [keyError, setKeyError] = useState('');
  const [requirementModalVisible, setRequirementModalVisible] = useState(false);
  const [requirements, setRequirements] = useState([]);
  const [currentProjectIdForReq, setCurrentProjectIdForReq] = useState(null);
  const [requirementTab, setRequirementTab] = useState('Pending');
  const [requirementPage, setRequirementPage] = useState(1);
  const REQUIREMENTS_PER_PAGE = 3;
  const [taskPage, setTaskPage] = useState(1);
  const TASKS_PER_PAGE = 4;

  const MANAGER_KEY = 'song';

  // 拉取项目数据
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const res = await fetch(`${API_BASE}/projects`);
    const data = await res.json();
    setProjects((data.data || []).map(p => ({ ...p, tasks: p.tasks || [] })));
    // 默认选中第一个项目
    if ((data.data || []).length > 0 && !selectedProjectId) {
      setSelectedProjectId(data.data[0].id);
    }
  };

  const handleSelectProject = (id) => {
    setSelectedProjectId(id);
  };

  // 获取当前选中项目
  const selectedProject = projects.find(p => p.id === selectedProjectId);

  // 密钥校验逻辑
  const requireManager = (action) => {
    if (isManager) {
      action();
    } else {
      setPendingAction(() => action);
      setShowKeyModal(true);
      setKeyError('');
    }
  };
  const handleKeyConfirm = async (inputValue) => {
    // 调用后端接口校验密钥
    try {
      const res = await fetch(`${API_BASE}/check-manager-key`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: inputValue })
      });
      const data = await res.json();
      if (data.success) {
        setIsManager(true);
        setShowKeyModal(false);
        setKeyError('');
        if (pendingAction) pendingAction();
      } else {
        setKeyError(data.error || '密钥错误，请重试');
      }
    } catch {
      setKeyError('网络错误，请重试');
    }
  };
  const handleKeyCancel = () => {
    setShowKeyModal(false);
    setKeyError('');
  };

  // 包装所有增删改操作
  const handleCreateProject = () => requireManager(() => {
    setEditingProject(null);
    setProjectModalVisible(true);
  });
  const handleEditProject = () => requireManager(() => {
    const project = projects.find(p => p.id === selectedProjectId);
    if (project) {
      setEditingProject(project);
      setProjectModalVisible(true);
    }
  });
  const handleSaveProject = async (projectData) => requireManager(async () => {
    if (editingProject) {
      await fetch(`${API_BASE}/projects/${editingProject.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
      });
    } else {
      await fetch(`${API_BASE}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
      });
    }
    setProjectModalVisible(false);
    setEditingProject(null);
    fetchProjects();
  });
  const handleDeleteProject = (projectId) => requireManager(() => {
    showConfirm({
      title: '删除项目',
      content: '确定要删除该项目吗？此操作不可恢复。',
      onConfirm: async () => {
        await fetch(`${API_BASE}/projects/${projectId}`, { method: 'DELETE' });
        if (selectedProjectId === projectId) {
          setSelectedProjectId(null);
        }
        fetchProjects();
      }
    });
  });
  const handleCreateTask = () => requireManager(() => {
    setEditingTask(null);
    setTaskModalVisible(true);
  });
  const handleEditTask = (taskId) => requireManager(() => {
    if (!selectedProject) return;
    const task = selectedProject.tasks.find(t => t.id === taskId);
    if (task) {
      setEditingTask(task);
      setTaskModalVisible(true);
    }
  });
  const handleSaveTask = async (taskData) => requireManager(async () => {
    if (!selectedProject) return;
    if (editingTask) {
      await fetch(`${API_BASE}/projects/${selectedProject.id}/tasks/${editingTask.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      });
    } else {
      await fetch(`${API_BASE}/projects/${selectedProject.id}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      });
    }
    setTaskModalVisible(false);
    setEditingTask(null);
    fetchProjects();
  });
  const handleDeleteTask = (taskId) => requireManager(() => {
    showConfirm({
      title: '删除任务',
      content: '确定要删除该任务吗？此操作不可恢复。',
      onConfirm: async () => {
        if (!selectedProject) return;
        await fetch(`${API_BASE}/projects/${selectedProject.id}/tasks/${taskId}`, { method: 'DELETE' });
        fetchProjects();
      }
    });
  });

  // 预设问题
  const presetQuestions = [
    "本周完成了哪些工作？",
    selectedProject ? `本周${selectedProject.name}完成了哪些工作？` : "本周XX完成了哪些工作？",
    "下周的工作任务安排是什么？"
  ];

  // AI指令区
  const handleChatSend = async (input) => {
    setChatHistory(h => [...h, { sender: 'user', text: input }]);
    setChatHistory(h => [...h, { sender: 'assistant', text: 'AI助手正在思考...' }]);
    // 构造context
    const context = {
      projects: projects.map(p => ({
        name: p.name,
        description: p.description,
        tasks: (p.tasks || []).map(t => ({
          name: t.name,
          description: t.description,
          start_date: t.start_date,
          end_date: t.end_date
        })),
        requirements: (p.id === selectedProjectId ? requirements : undefined) // 只加当前项目的需求
          ?.map(r => ({
            content: r.content,
            proposer: r.proposer,
            status: r.status,
            created_at: r.created_at
          })) || []
      }))
    };
    try {
      const res = await fetch(`${API_BASE}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, context })
      });
      const data = await res.json();
      setChatHistory(h => [
        ...h.slice(0, h.length - 1),
        { sender: 'assistant', text: data.reply || 'AI助手暂时无法回答，请稍后再试。' }
      ]);
    } catch (e) {
      setChatHistory(h => [
        ...h.slice(0, h.length - 1),
        { sender: 'assistant', text: 'AI助手暂时无法回答，请稍后再试。' }
      ]);
    }
  };

  // 删除确认弹窗逻辑
  const showConfirm = ({ title, content, onConfirm }) => {
    setConfirmConfig({ title, content, onConfirm });
    setConfirmVisible(true);
  };
  const handleConfirm = () => {
    if (confirmConfig.onConfirm) confirmConfig.onConfirm();
    setConfirmVisible(false);
  };
  const handleCancelConfirm = () => {
    setConfirmVisible(false);
  };

  // 拖拽排序后同步到后端
  const handleSortProjects = async (newOrder) => {
    await fetch(`${API_BASE}/projects/sort`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: newOrder })
    });
    fetchProjects();
  };

  const handleClearChatHistory = () => {
    setChatHistory([]);
  };

  // 拉取需求数据
  const fetchRequirements = async (projectId) => {
    if (!projectId) return setRequirements([]);
    const res = await fetch(`${API_BASE}/projects/${projectId}/requirements`);
    const data = await res.json();
    setRequirements(data.data || []);
  };

  // 选中项目时拉取需求
  useEffect(() => {
    if (selectedProjectId) fetchRequirements(selectedProjectId);
  }, [selectedProjectId]);

  // 打开需求弹窗
  const handleRequestRequirement = (projectId) => {
    console.log('打开需求弹窗', projectId);
    setCurrentProjectIdForReq(projectId);
    setRequirementModalVisible(true);
    setTimeout(() => {
      console.log('requirementModalVisible:', true);
    }, 100);
  };

  // 提交新需求
  const handleSaveRequirement = async (reqData) => {
    if (!currentProjectIdForReq) return;
    await fetch(`${API_BASE}/projects/${currentProjectIdForReq}/requirements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reqData)
    });
    setRequirementModalVisible(false);
    fetchRequirements(currentProjectIdForReq);
  };

  // 处理需求
  const handleResolveRequirement = async (rid) => {
    await fetch(`${API_BASE}/projects/${selectedProjectId}/requirements/${rid}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Resolved' })
    });
    fetchRequirements(selectedProjectId);
  };

  // 需求分页与筛选
  const filteredRequirements = requirements.filter(r => r.status === requirementTab);
  const totalRequirementPages = Math.ceil(filteredRequirements.length / REQUIREMENTS_PER_PAGE) || 1;
  const pagedRequirements = filteredRequirements.slice((requirementPage - 1) * REQUIREMENTS_PER_PAGE, requirementPage * REQUIREMENTS_PER_PAGE);
  // 切换Tab时重置页码
  useEffect(() => { setRequirementPage(1); }, [requirementTab, requirements]);

  // 任务分页
  const totalTaskPages = selectedProject ? Math.ceil((selectedProject.tasks.length || 0) / TASKS_PER_PAGE) || 1 : 1;
  const pagedTasks = selectedProject ? selectedProject.tasks.slice((taskPage - 1) * TASKS_PER_PAGE, taskPage * TASKS_PER_PAGE) : [];
  useEffect(() => { setTaskPage(1); }, [selectedProjectId, projects]);

  return (
    <div>
      <header>Ξ 智驿未来项目管理</header>
      <div className="container">
        <aside>
          <div className="sidebar-header">
            <h3>项目列表</h3>
            <button className="btn btn-primary" onClick={handleCreateProject}>+ 创建项目</button>
          </div>
          <ProjectList
            projects={projects}
            selectedId={selectedProjectId}
            onSelect={handleSelectProject}
            onCreate={handleCreateProject}
            onDelete={handleDeleteProject}
            isManager={isManager}
            onSortProjects={handleSortProjects}
            onRequestRequirement={handleRequestRequirement}
          />
        </aside>
        <main id="main-content">
          {/* 主内容区：项目详情、任务、甘特图、需求 */}
          {selectedProject && (
            <>
              <div className="project-header">
                <div>
                  <h2>{selectedProject.name}</h2>
                  <p>项目截止日期: {selectedProject.due_date ? selectedProject.due_date.split('T')[0] : ''}</p>
                  {selectedProject.description && (
                    <div className="project-desc">{selectedProject.description}</div>
                  )}
                </div>
                <button
                  className="btn btn-primary"
                  onClick={handleEditProject}
                  disabled={!selectedProject}
                  title={!selectedProject ? '请先选择一个项目' : '编辑当前项目'}
                >
                  编辑项目
                </button>
              </div>
              {/* 需求区 */}
              <div className="requirements-section">
                <div className="section-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ display: 'inline-block', marginRight: 16 }}>项目需求</h3>
                    <button
                      className={`tab-btn${requirementTab === 'Pending' ? ' active' : ''}`}
                      onClick={() => setRequirementTab('Pending')}
                    >待办</button>
                    <button
                      className={`tab-btn${requirementTab === 'Resolved' ? ' active' : ''}`}
                      onClick={() => setRequirementTab('Resolved')}
                      style={{ marginLeft: 8 }}
                    >已处理</button>
                  </div>
                  <div style={{ fontSize: 14, color: '#888' }}>
                    共{filteredRequirements.length}条，{totalRequirementPages > 1 && `第${requirementPage}/${totalRequirementPages}页`}
                  </div>
                </div>
                <ul className="requirement-list">
                  {pagedRequirements.map(req => (
                    <li key={req.id} className="requirement-item">
                      <div className="requirement-main">
                        <b>{req.content}</b>
                        <div style={{ fontSize: 13, color: '#888' }}>提出人: {req.proposer} | {new Date(req.created_at).toLocaleString()} | 状态: {req.status === 'Resolved' ? '已处理' : '代办'}</div>
                      </div>
                      {isManager && req.status !== 'Resolved' && requirementTab === 'Pending' && (
                        <button
                          className="btn btn-icon btn-green requirement-resolve-btn"
                          style={{ marginLeft: 12 }}
                          title="标记为已处理"
                          onClick={() => handleResolveRequirement(req.id)}
                        >
                          <span role="img" aria-label="处理">✔️</span>
                        </button>
                      )}
                    </li>
                  ))}
                  {pagedRequirements.length === 0 && <li style={{ color: '#888', padding: 8 }}>暂无需求</li>}
                </ul>
                {/* 需求分页按钮 */}
                {totalRequirementPages > 1 && (
                  <div className="pagination-bar">
                    <button className="btn" disabled={requirementPage === 1} onClick={() => setRequirementPage(requirementPage - 1)}>上一页</button>
                    <button className="btn" disabled={requirementPage === totalRequirementPages} onClick={() => setRequirementPage(requirementPage + 1)}>下一页</button>
                  </div>
                )}
              </div>
              <div className="tasks-section">
                <div className="section-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3>任务</h3>
                  <div>
                    <button className="btn btn-green" onClick={handleCreateTask}>+ 添加任务</button>
                  </div>
                </div>
                <TaskList
                  tasks={pagedTasks}
                  onDelete={handleDeleteTask}
                  onEdit={handleEditTask}
                />
                {/* 任务分页按钮 */}
                {totalTaskPages > 1 && (
                  <div className="pagination-bar">
                    <button className="btn" disabled={taskPage === 1} onClick={() => setTaskPage(taskPage - 1)}>上一页</button>
                    <button className="btn" disabled={taskPage === totalTaskPages} onClick={() => setTaskPage(taskPage + 1)}>下一页</button>
                  </div>
                )}
              </div>
              <div className="gantt-section">
                <div className="section-header">
                  <h3>项目甘特图: {selectedProject.name}</h3>
                </div>
                <GanttChart project={selectedProject} />
              </div>
            </>
          )}
        </main>
      </div>
      <ProjectModal
        visible={projectModalVisible}
        onClose={() => { setProjectModalVisible(false); setEditingProject(null); }}
        onSave={handleSaveProject}
        editingProject={editingProject}
      />
      <TaskModal
        visible={taskModalVisible}
        onClose={() => { setTaskModalVisible(false); setEditingTask(null); }}
        onSave={handleSaveTask}
        editingTask={editingTask}
      />
      <footer>
        <ChatBox history={chatHistory} onSend={handleChatSend} presetQuestions={presetQuestions} onClearHistory={handleClearChatHistory} />
      </footer>
      <ConfirmModal
        visible={confirmVisible}
        title={confirmConfig.title}
        content={confirmConfig.content}
        onConfirm={handleConfirm}
        onCancel={handleCancelConfirm}
      />
      <ConfirmModal
        visible={showKeyModal}
        title="操作密钥验证"
        content={keyError || '请输入操作密钥以进行管理操作'}
        inputMode={true}
        inputLabel="操作密钥"
        onConfirm={handleKeyConfirm}
        onCancel={handleKeyCancel}
      />
      <RequirementModal
        visible={requirementModalVisible}
        onClose={() => setRequirementModalVisible(false)}
        onSave={handleSaveRequirement}
      />
    </div>
  );
}

export default App;
