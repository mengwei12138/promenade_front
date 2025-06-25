import React, { useState, useEffect } from 'react';
import '../style.css';

const TaskModal = ({ visible, onClose, onSave, editingTask }) => {
    const [name, setName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (editingTask) {
            setName(editingTask.name || '');
            setStartDate(editingTask.start_date ? editingTask.start_date.split('T')[0] : '');
            setEndDate(editingTask.end_date ? editingTask.end_date.split('T')[0] : '');
            setDescription(editingTask.description || '');
        } else {
            setName('');
            setStartDate('');
            setEndDate('');
            setDescription('');
        }
    }, [editingTask, visible]);

    if (!visible) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        onSave({ name: name.trim(), start_date: startDate, end_date: endDate, description });
    };

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h2>{editingTask ? '编辑任务' : '新建任务'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>任务名称</label>
                        <input value={name} onChange={e => setName(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>起始日期</label>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label>截止日期</label>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label>描述</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} />
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn" onClick={onClose}>取消</button>
                        <button type="submit" className="btn btn-primary">保存</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TaskModal; 