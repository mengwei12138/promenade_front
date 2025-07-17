import React from 'react';
import '../style.css';

function formatDate(d) {
    if (!d) return '';
    try {
        const date = typeof d === 'string' ? new Date(d) : d;
        if (isNaN(date.getTime())) return '';
        const iso = date.toISOString().split('T')[0];
        if (iso === '0001-01-01') return '';
        return iso;
    } catch {
        return '';
    }
}
function getDateField(obj, ...fields) {
    for (const f of fields) {
        if (obj && obj[f]) return obj[f];
    }
    return null;
}

const getAutoStatus = (task) => {
    const now = new Date();
    const start = task.start_date ? new Date(task.start_date) : null;
    const end = task.end_date ? new Date(task.end_date) : null;
    if (start && now < start) return 'Pending';
    if (start && end && now >= start && now <= end) return 'In Progress';
    if (end && now > end) return 'Completed';
    return 'Pending';
};

const priorityMap = {
    P0: { color: 'red', icon: '⚡', label: 'P0' },
    P1: { color: 'orange', icon: '▲', label: 'P1' },
    P2: { color: 'gray', icon: '●', label: 'P2' },
};

const TaskList = ({ tasks, onDelete, onEdit }) => {
    if (!tasks || tasks.length === 0) {
        return (
            <div className="empty-state">
                <div className="empty-state-icon">📝</div>
                <div>此项目没有任务。<br />尝试点击上面的"添加任务"按钮，<br />或通过指令如"给项目名称添加任务 任务名"。</div>
            </div>
        );
    }
    return (
        <div id="task-list">
            {tasks.map(task => {
                const status = task.status || getAutoStatus(task);
                const statusClass = `status-${status.toLowerCase().replace(' ', '')}`;
                const priority = priorityMap[task.priority] || priorityMap.P2;
                return (
                    <div className="task-item" key={task.id} style={{ position: 'relative' }}>
                        <div className="task-title">{task.name}</div>
                        <div className="task-desc">{task.description}</div>
                        <div className="task-dates">
                            <span><b>日期:</b> {formatDate(getDateField(task, 'start_time', 'startTime', 'start_date', 'startDate'))} - {formatDate(getDateField(task, 'end_time', 'endTime', 'end_date', 'endDate'))}</span> |
                            <span><b>创建于:</b> {formatDate(getDateField(task, 'created_at', 'createdAt'))}</span>
                        </div>
                        <div className="task-status">
                            <span className={`status-badge ${statusClass}`}>{status}</span>
                        </div>
                        <button className="task-delete" title="删除" onClick={() => onDelete(task.id)}>❌</button>
                        <button className="btn btn-gray task-edit" title="编辑" onClick={() => onEdit(task.id)} style={{ marginRight: 8 }}>✏️</button>
                        {/* 优先级显示 */}
                        <span style={{
                            position: 'absolute',
                            right: 10,
                            bottom: 10,
                            color: priority.color,
                            background: '#fff',
                            borderRadius: 8,
                            // border: `2px solid ${priority.color}`, // 移除边框
                            padding: '4px 12px',
                            fontSize: 16,
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                            zIndex: 2
                        }} title={`优先级：${priority.label}`}>
                            <span style={{ marginRight: 6, fontSize: 22, fontWeight: 'bold', lineHeight: 1 }}>{priority.icon}</span>
                            <span style={{ letterSpacing: 1 }}>{priority.label}</span>
                        </span>
                    </div>
                );
            })}
        </div>
    );
};

export default TaskList; 