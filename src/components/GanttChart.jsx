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
    const allDates = tasks.flatMap(t => [formatDate(getDateField(t, 'start_date', 'startDate')), formatDate(getDateField(t, 'end_date', 'endDate'))]).filter(Boolean).map(d => new Date(d));
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
    const gridStyle = {
        display: 'grid',
        gridTemplateColumns: `100px repeat(${totalDays}, 45px)`
    };

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
        const start = task.start_date ? new Date(task.start_date) : null;
        const end = task.end_date ? new Date(task.end_date) : null;
        if (start && now < start) return 'Pending';
        if (start && end && now >= start && now <= end) return 'In Progress';
        if (end && now > end) return 'Completed';
        return 'Pending';
    };

    // 任务行
    let rowsHtml = [];
    tasks.forEach((task, idx) => {
        const taskStartStr = formatDate(getDateField(task, 'start_date', 'startDate'));
        const taskEndStr = formatDate(getDateField(task, 'end_date', 'endDate'));
        if (!taskStartStr || !taskEndStr) {
            rowsHtml.push(<div key={"taskname-" + idx} className="gantt-task-name">{task.name}</div>);
            for (let i = 0; i < totalDays; i++) rowsHtml.push(<div key={"empty-" + idx + "-" + i}></div>);
            return;
        }
        const taskStart = new Date(taskStartStr);
        const taskEnd = new Date(taskEndStr);
        // 计算任务条的起止
        const startOffset = Math.max(0, Math.round((taskStart - minDate) / (1000 * 60 * 60 * 24)));
        const duration = Math.max(1, Math.round((taskEnd - taskStart) / (1000 * 60 * 60 * 24)) + 1);
        // 状态颜色
        const status = getAutoStatus(task);
        let barColor = statusColorMap[status] || '#007BFF';
        // 任务名单元格
        rowsHtml.push(<div key={"taskname-" + idx} className="gantt-task-name">{task.name}</div>);
        // 日期单元格
        for (let i = 0; i < totalDays; i++) {
            if (i === startOffset) {
                rowsHtml.push(
                    <div key={"bar-" + idx + "-" + i} className="gantt-timeline" style={{ position: 'relative', gridColumn: `span ${duration}`, height: '24px' }}>
                        <div className="gantt-bar" style={{ position: 'absolute', left: 0, top: 4, height: '16px', width: '100%', background: barColor, borderRadius: '4px' }}></div>
                    </div>
                );
                i += duration - 1;
            } else {
                rowsHtml.push(<div key={"empty-" + idx + "-" + i}></div>);
            }
        }
    });

    return (
        <div style={{ width: '100%', overflowX: 'auto' }}>
            <div className="gantt-chart" style={gridStyle}>
                {headerHtml}
                {rowsHtml}
            </div>
        </div>
    );
};

export default GanttChart; 