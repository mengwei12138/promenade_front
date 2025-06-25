import React, { useState, useEffect } from 'react';
import '../style.css';

const ProjectModal = ({ visible, onClose, onSave, editingProject }) => {
    const [name, setName] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (editingProject) {
            setName(editingProject.name || '');
            setDueDate(editingProject.due_date ? editingProject.due_date.split('T')[0] : '');
            setDescription(editingProject.description || '');
        } else {
            setName('');
            setDueDate('');
            setDescription('');
        }
    }, [editingProject, visible]);

    if (!visible) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        onSave({ name: name.trim(), due_date: dueDate, description });
    };

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h2>{editingProject ? '编辑项目' : '新建项目'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>项目名称</label>
                        <input value={name} onChange={e => setName(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>截止日期</label>
                        <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
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

export default ProjectModal; 