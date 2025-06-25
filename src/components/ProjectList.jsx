import React from 'react';
import '../style.css';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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

function DragHandle() {
    return <span className="drag-handle" title="拖动排序" style={{ cursor: 'grab', marginRight: 8 }}>☰</span>;
}

function SortableProjectItem(props) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: props.project.id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        background: isDragging ? '#e0e7ef' : undefined
    };
    return (
        <li
            ref={setNodeRef}
            style={style}
            className={`project-item ${props.project.id === props.selectedId ? 'selected' : ''}`}
            onClick={() => props.onSelect(props.project.id)}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    {props.isManager && <span {...attributes} {...listeners}><DragHandle /></span>}
                    <div>
                        <div className="project-title">{props.project.name}</div>
                        <div className="project-details">
                            任务数: {props.project.tasks ? props.project.tasks.length : 0} <br />
                            截止: {formatDate(getDateField(props.project, 'due_date', 'dueDate'))}
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <button
                        className="btn btn-blue"
                        style={{ marginBottom: 4 }}
                        onClick={e => { e.stopPropagation(); props.onRequestRequirement(props.project.id); }}
                    >提需求</button>
                    <button
                        className="task-delete"
                        title="删除项目"
                        style={{ marginLeft: 8 }}
                        onClick={e => { e.stopPropagation(); props.onDelete(props.project.id); }}
                    >🗑️</button>
                </div>
            </div>
        </li>
    );
}

const ProjectList = ({ projects, selectedId, onSelect, onCreate, onDelete, isManager = false, onSortProjects, onRequestRequirement }) => {
    const [items, setItems] = React.useState(projects.map(p => p.id));
    React.useEffect(() => {
        setItems(projects.map(p => p.id));
    }, [projects]);

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            const oldIndex = items.indexOf(active.id);
            const newIndex = items.indexOf(over.id);
            const newItems = arrayMove(items, oldIndex, newIndex);
            setItems(newItems);
            if (onSortProjects) {
                onSortProjects(newItems);
            }
        }
    };

    if (projects.length === 0) {
        return (
            <div className="empty-state empty-state-center">
                <div className="empty-state-icon" style={{ fontSize: 80, marginBottom: 24 }}>📁</div>
                <div style={{ color: '#666', fontSize: 17, marginBottom: 18 }}>
                    还没有项目，试试点击下方按钮创建一个新项目，<br />
                    或输入"新建项目 项目名"。
                </div>
                <button className="btn btn-primary" style={{ fontSize: 16, padding: '10px 32px' }} onClick={onCreate}>立即创建项目</button>
            </div>
        );
    }

    const idToProject = Object.fromEntries(projects.map(p => [p.id, p]));

    const list = (
        <ul id="project-list">
            {items.map(id => (
                <SortableProjectItem
                    key={id}
                    project={idToProject[id]}
                    selectedId={selectedId}
                    onSelect={onSelect}
                    onDelete={onDelete}
                    isManager={isManager}
                    onRequestRequirement={onRequestRequirement}
                />
            ))}
        </ul>
    );

    if (!isManager) return list;
    return (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items} strategy={verticalListSortingStrategy}>
                {list}
            </SortableContext>
        </DndContext>
    );
};

export default ProjectList; 