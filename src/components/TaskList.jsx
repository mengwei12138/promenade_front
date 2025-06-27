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
                const status = getAutoStatus(task);
                const statusClass = `status-${status.toLowerCase().replace(' ', '')}`;
                return (
                    <div className="task-item" key={task.id}>
                        <div className="task-title">{task.name}</div>
                        <div className="task-desc">{task.description}</div>
                        <div className="task-dates">
                            <span><b>日期:</b> {formatDate(getDateField(task, 'start_date', 'startDate'))} - {formatDate(getDateField(task, 'end_date', 'endDate'))}</span> |
                            <span><b>创建于:</b> {formatDate(getDateField(task, 'created_at', 'createdAt'))}</span>
                        </div>
                        <div className="task-status">
                            <span className={`status-badge ${statusClass}`}>{status}</span>
                        </div>
                        <button className="task-delete" title="删除" onClick={() => onDelete(task.id)}>❌</button>
                        <button className="btn btn-gray task-edit" title="编辑" onClick={() => onEdit(task.id)} style={{ marginRight: 8 }}>✏️</button>
                    </div>
                );
            })}
        </div>
    );
};

export default TaskList; 