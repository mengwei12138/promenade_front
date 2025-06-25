import React, { useState } from 'react';
import '../style.css';

const ConfirmModal = ({ visible, title = '确认操作', content = '', onConfirm, onCancel, confirmText = '确定', cancelText = '取消', inputMode = false, inputLabel = '', onInputChange }) => {
    const [inputValue, setInputValue] = useState('');

    if (!visible) return null;

    const handleConfirm = () => {
        if (inputMode) {
            onConfirm(inputValue);
            setInputValue('');
        } else {
            onConfirm();
        }
    };

    const handleCancel = () => {
        setInputValue('');
        onCancel();
    };

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h2>{title}</h2>
                <div style={{ margin: '16px 0' }}>{content}</div>
                {inputMode && (
                    <div className="form-group">
                        <label>{inputLabel || '输入'}</label>
                        <input
                            value={inputValue}
                            onChange={e => {
                                setInputValue(e.target.value);
                                if (onInputChange) onInputChange(e.target.value);
                            }}
                        />
                    </div>
                )}
                <div className="modal-actions">
                    <button className="btn" onClick={handleCancel}>取消</button>
                    <button className="btn btn-primary" onClick={handleConfirm}>确定</button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal; 