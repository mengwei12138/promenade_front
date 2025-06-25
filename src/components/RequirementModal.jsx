import React, { useState } from 'react';
import '../style.css';

console.log('RequirementModal loaded');

const RequirementModal = ({ visible, onClose, onSave }) => {
    console.log('RequirementModal visible:', visible);
    const [content, setContent] = useState('');
    const [proposer, setProposer] = useState('');
    const [error, setError] = useState('');

    if (!visible) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!content.trim() || !proposer.trim()) {
            setError('需求内容和提出人不能为空');
            return;
        }
        onSave({ content: content.trim(), proposer: proposer.trim() });
        setContent('');
        setProposer('');
        setError('');
    };

    const handleClose = () => {
        setContent('');
        setProposer('');
        setError('');
        onClose();
    };

    return (
        <div className="requirement-modal-overlay">
            <div className="requirement-modal">
                <h2>提交新需求</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>需求内容</label>
                        <textarea value={content} onChange={e => setContent(e.target.value)} rows={3} required />
                    </div>
                    <div className="form-group">
                        <label>提出人</label>
                        <input value={proposer} onChange={e => setProposer(e.target.value)} required />
                    </div>
                    {error && <div className="form-error">{error}</div>}
                    <div className="modal-actions">
                        <button type="submit" className="btn btn-primary">提交</button>
                        <button type="button" className="btn" onClick={handleClose}>取消</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RequirementModal; 