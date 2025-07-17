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

const GanttChart = ({ project }) => {
    if (!project || !project.tasks || project.tasks.length === 0) {
        return <div className="empty-state"><div className="empty-state-icon">📊</div><div>此项目没有任务，无法生成甘特图。</div></div>;
    }
    const tasks = project.tasks;
    // 获取所有任务的最早开始和最晚结束日期
    const allDates = tasks.flatMap(t => [formatDate(getDateField(t, 'start_time', 'startTime', 'start_date', 'startDate')), formatDate(getDateField(t, 'end_time', 'endTime', 'end_date', 'endDate'))]).filter(Boolean).map(d => new Date(d));
    if (allDates.length === 0) {
        return <div className="empty-state"><div className="empty-state-icon">📊</div><div>无有效日期，无法生成甘特图。</div></div>;
    }
    const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));

    // 生成日期数组
    let days = [];
    let d = new Date(minDate.getTime());
    while (d <= maxDate) {
        days.push(new Date(d.getTime()));
        d.setDate(d.getDate() + 1);
    }
    const totalDays = days.length;

    // 设置grid列数，每天45px宽度
    const gridColumns = `120px repeat(${totalDays}, 45px)`;
    // 头部
    let headerHtml = [<div key="header-task" className="gantt-task-name" style={{ background: '#F8F9FA', fontWeight: 'bold', textAlign: 'center' }}>任务</div>];
    days.forEach((day, i) => {
        const isWeekend = day.getDay() === 0 || day.getDay() === 6; // 0:周日, 6:周六
        headerHtml.push(
            <div
                key={"header-" + i}
                className={`gantt-day${isWeekend ? ' gantt-weekend' : ''}`}
                style={{ background: '#F8F9FA', fontWeight: 'bold', textAlign: 'center' }}
            >
                {`${String(day.getMonth() + 1).padStart(2, '0')}/${String(day.getDate()).padStart(2, '0')}`}
            </div>
        );
    });

    // 状态颜色映射
    const statusColorMap = {
        'Pending': '#17A2B8',
        'In Progress': '#FFC107',
        'Completed': '#28A745'
    };

    // 自动判断任务状态
    const getAutoStatus = (task) => {
        const now = new Date();
        const start = task.start_time ? new Date(task.start_time) : (task.start_date ? new Date(task.start_date) : null);
        const end = task.end_time ? new Date(task.end_time) : (task.end_date ? new Date(task.end_date) : null);
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

    // 任务行
    let rowsHtml = [];
    tasks.forEach((task, idx) => {
        const taskStartStr = formatDate(getDateField(task, 'start_time', 'startTime', 'start_date', 'startDate'));
        const taskEndStr = formatDate(getDateField(task, 'end_time', 'endTime', 'end_date', 'endDate'));
        let rowCells = [];
        if (!taskStartStr || !taskEndStr) {
            rowCells.push(<div key={"taskname-" + idx} className="gantt-task-name">{task.name}</div>);
            for (let i = 0; i < totalDays; i++) rowCells.push(<div key={"empty-" + idx + "-" + i}></div>);
        } else {
            const taskStart = new Date(taskStartStr);
            const taskEnd = new Date(taskEndStr);
            const startOffset = Math.max(0, Math.round((taskStart - minDate) / (1000 * 60 * 60 * 24)));
            const duration = Math.max(1, Math.round((taskEnd - taskStart) / (1000 * 60 * 60 * 24)) + 1);
            const status = getAutoStatus(task);
            let barColor = statusColorMap[status] || '#007BFF';
            rowCells.push(<div key={"taskname-" + idx} className="gantt-task-name">{task.name}</div>);
            for (let i = 0; i < totalDays; i++) {
                if (i === startOffset) {
                    const priority = priorityMap[task.priority] || priorityMap.P2;
                    rowCells.push(
                        <div key={"bar-" + idx + "-" + i} className="gantt-timeline" style={{ position: 'relative', gridColumn: `span ${duration}` }}>
                            <div className="gantt-bar" style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', height: '16px', width: '100%', background: barColor, borderRadius: '4px', display: 'flex', alignItems: 'center' }}>
                                <span style={{ color: priority.color, fontWeight: 'bold', marginRight: 6, fontSize: 13, display: 'flex', alignItems: 'center' }} title={`优先级：${priority.label}`}>
                                    <span style={{ marginRight: 2 }}>{priority.icon}</span>{priority.label}
                                </span>
                            </div>
                        </div>
                    );
                    i += duration - 1;
                } else {
                    rowCells.push(<div key={"empty-" + idx + "-" + i}></div>);
                }
            }
        }
        rowsHtml.push(
            <div
                key={"row-" + idx}
                className="gantt-task-row"
                style={{ display: 'grid', gridTemplateColumns: gridColumns, alignItems: 'stretch' }}
            >
                {rowCells}
            </div>
        );
    });

    return (
        <div style={{ width: '100%', overflowX: 'auto', paddingBottom: '24px' }}>
            <div className="gantt-header-row" style={{ display: 'grid', gridTemplateColumns: gridColumns, alignItems: 'stretch' }}>
                {headerHtml}
            </div>
            {rowsHtml}
        </div>
    );
};

export default GanttChart; 