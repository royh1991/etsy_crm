import { useState, useRef, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent, DragOverEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TaskCard from './TaskCard';
import type { TaskCardProps } from './TaskCard';

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8 3V13M3 8H13" stroke="#959BA3" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const MenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="4" r="1.5" fill="#404656"/>
    <circle cx="10" cy="10" r="1.5" fill="#404656"/>
    <circle cx="10" cy="16" r="1.5" fill="#404656"/>
  </svg>
);

const DragHandleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="opacity-40">
    <circle cx="5" cy="4" r="1.5" fill="#959BA3"/>
    <circle cx="11" cy="4" r="1.5" fill="#959BA3"/>
    <circle cx="5" cy="8" r="1.5" fill="#959BA3"/>
    <circle cx="11" cy="8" r="1.5" fill="#959BA3"/>
    <circle cx="5" cy="12" r="1.5" fill="#959BA3"/>
    <circle cx="11" cy="12" r="1.5" fill="#959BA3"/>
  </svg>
);

interface Task extends TaskCardProps {
  id: string;
}

interface Column {
  id: string;
  emoji: string;
  title: string;
  tasks: Task[];
  showMenu?: boolean;
}

const initialColumns: Column[] = [
  {
    id: 'new',
    emoji: '🆕',
    title: 'New',
    showMenu: true,
    tasks: [
      {
        id: 'task-1',
        title: 'AST Builder',
        description: 'Create an Abstract Syntax Tree using tokens and TreeSitter',
        tags: [
          { label: 'Must', type: 'must' },
          { label: 'Medium', type: 'medium' }
        ],
        assignees: [{ color: '#ffb6b6' }]
      },
      {
        id: 'task-2',
        title: 'Change title',
        description: 'Change title website to InnoAST',
        tags: [{ label: 'Tiny', type: 'tiny' }],
        assignees: [{ color: '#ffb6b6' }]
      },
      {
        id: 'task-3',
        title: 'Change title',
        description: 'Change title website to InnoAST',
        tags: [{ label: 'Tiny', type: 'tiny' }],
        assignees: [{ color: '#b6edff' }]
      }
    ]
  },
  {
    id: 'in-progress',
    emoji: '🏗',
    title: 'In progress',
    showMenu: true,
    tasks: [
      {
        id: 'task-4',
        title: 'JavaScript lexer',
        description: 'Research JavaScript grammar and provide an overview on what to...',
        tags: [{ label: 'Huge', type: 'huge' }],
        assignees: [{ color: '#ffb6b6' }, { color: '#b6edff' }]
      }
    ]
  },
  {
    id: 'review',
    emoji: '👀',
    title: 'Review',
    showMenu: true,
    tasks: []
  },
  {
    id: 'done',
    emoji: '✅',
    title: 'Done',
    showMenu: false,
    tasks: [
      {
        id: 'task-5',
        title: 'Docker Image',
        description: 'Set up Docker Image and Docker Compose with K8s',
        tags: [{ label: 'Medium', type: 'medium' }],
        assignees: [{ color: '#cdffb6' }]
      },
      {
        id: 'task-6',
        title: 'UX/UI Testing',
        description: 'Create a usability tests in product developing team',
        tags: [{ label: 'Medium', type: 'medium' }],
        assignees: [{ color: '#b6edff' }]
      },
      {
        id: 'task-7',
        title: 'Clear Documentation',
        description: 'Update documentation on development workflow',
        tags: [
          { label: 'Must', type: 'must' },
          { label: 'Tiny', type: 'tiny' }
        ],
        assignees: [{ color: '#ffb6b6' }]
      }
    ]
  }
];

// Sortable Task Card
function SortableTaskCard({ task }: { task: Task }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard {...task} />
    </div>
  );
}

// Editable Column Title
function EditableColumnTitle({
  title,
  onTitleChange
}: {
  title: string;
  onTitleChange: (newTitle: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    setIsEditing(true);
    setEditValue(title);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (editValue.trim() && editValue !== title) {
      onTitleChange(editValue.trim());
    } else {
      setEditValue(title);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    } else if (e.key === 'Escape') {
      setEditValue(title);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="text-[13px] md:text-[14px] font-medium text-black leading-[20px] tracking-[-0.14px] bg-white border border-[#6e6af0] rounded px-2 py-0.5 outline-none w-full max-w-[120px]"
      />
    );
  }

  return (
    <span
      className="text-[13px] md:text-[14px] font-medium text-black leading-[20px] tracking-[-0.14px] cursor-text hover:text-[#6e6af0] transition-colors"
      onDoubleClick={handleDoubleClick}
      title="Double-click to rename"
    >
      {title}
    </span>
  );
}

// Sortable Column
function SortableColumn({
  column,
  onTitleChange
}: {
  column: Column;
  onTitleChange: (columnId: string, newTitle: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex flex-col gap-[16px] flex-1 min-w-[220px] max-w-[400px]"
    >
      {/* Column Header */}
      <div className="flex items-center justify-between py-[10px] sticky top-0 bg-[#f7f7f7] z-10">
        <div className="flex items-center gap-[10px] md:gap-[14px]">
          {/* Drag handle */}
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-white rounded transition-colors"
          >
            <DragHandleIcon />
          </div>
          <div className="flex items-center gap-[6px] md:gap-[8px]">
            <span className="text-[14px]">{column.emoji}</span>
            <EditableColumnTitle
              title={column.title}
              onTitleChange={(newTitle) => onTitleChange(column.id, newTitle)}
            />
          </div>
          <div className="bg-white rounded-[10px] px-[10px] md:px-[13px] flex items-center justify-center shadow-sm">
            <span className="text-[10px] font-medium text-black leading-[20px] tracking-[-0.1px]">
              {column.tasks.length}
            </span>
          </div>
        </div>
        {column.showMenu && (
          <button className="p-[4px] hover:bg-white rounded transition-colors">
            <MenuIcon />
          </button>
        )}
      </div>

      {/* Tasks Container */}
      <SortableContext
        items={column.tasks.map(t => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-[8px] flex-1 overflow-y-auto pb-[8px] min-h-[100px]">
          {column.tasks.map((task) => (
            <SortableTaskCard key={task.id} task={task} />
          ))}
        </div>
      </SortableContext>

      {/* Add Task Button */}
      <button className="flex items-center justify-center gap-[6px] bg-white border border-[#959ba3] rounded-[6px] px-[14px] py-[6px] hover:bg-[#f7f7f7] hover:border-[#6e6af0] transition-all duration-200 w-full flex-shrink-0">
        <PlusIcon />
        <span className="text-[12px] font-medium text-[#959ba3] leading-[20px] tracking-[-0.12px]">
          Add Task
        </span>
      </button>
    </div>
  );
}

export default function KanbanBoard() {
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<'task' | 'column' | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const findColumnByTaskId = (taskId: string) => {
    return columns.find(col => col.tasks.some(task => task.id === taskId));
  };

  const findTaskById = (taskId: string) => {
    for (const col of columns) {
      const task = col.tasks.find(t => t.id === taskId);
      if (task) return task;
    }
    return null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeIdStr = active.id as string;

    // Check if it's a column or a task
    const isColumn = columns.some(col => col.id === activeIdStr);
    setActiveId(activeIdStr);
    setActiveType(isColumn ? 'column' : 'task');
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeIdStr = active.id as string;
    const overIdStr = over.id as string;

    // Only handle task movement
    if (activeType !== 'task') return;

    const activeColumn = findColumnByTaskId(activeIdStr);
    const overColumn = findColumnByTaskId(overIdStr) || columns.find(col => col.id === overIdStr);

    if (!activeColumn || !overColumn || activeColumn.id === overColumn.id) return;

    setColumns(cols => {
      const activeTask = activeColumn.tasks.find(t => t.id === activeIdStr);
      if (!activeTask) return cols;

      return cols.map(col => {
        if (col.id === activeColumn.id) {
          return {
            ...col,
            tasks: col.tasks.filter(t => t.id !== activeIdStr)
          };
        }
        if (col.id === overColumn.id) {
          const overTaskIndex = col.tasks.findIndex(t => t.id === overIdStr);
          const newTasks = [...col.tasks];
          if (overTaskIndex >= 0) {
            newTasks.splice(overTaskIndex, 0, activeTask);
          } else {
            newTasks.push(activeTask);
          }
          return {
            ...col,
            tasks: newTasks
          };
        }
        return col;
      });
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      setActiveType(null);
      return;
    }

    const activeIdStr = active.id as string;
    const overIdStr = over.id as string;

    if (activeType === 'column') {
      // Reorder columns
      const oldIndex = columns.findIndex(col => col.id === activeIdStr);
      const newIndex = columns.findIndex(col => col.id === overIdStr);

      if (oldIndex !== newIndex) {
        setColumns(cols => arrayMove(cols, oldIndex, newIndex));
      }
    } else if (activeType === 'task') {
      // Reorder tasks within the same column
      const activeColumn = findColumnByTaskId(activeIdStr);
      const overColumn = findColumnByTaskId(overIdStr);

      if (activeColumn && overColumn && activeColumn.id === overColumn.id) {
        const oldIndex = activeColumn.tasks.findIndex(t => t.id === activeIdStr);
        const newIndex = activeColumn.tasks.findIndex(t => t.id === overIdStr);

        if (oldIndex !== newIndex) {
          setColumns(cols => cols.map(col => {
            if (col.id === activeColumn.id) {
              return {
                ...col,
                tasks: arrayMove(col.tasks, oldIndex, newIndex)
              };
            }
            return col;
          }));
        }
      }
    }

    setActiveId(null);
    setActiveType(null);
  };

  const handleTitleChange = (columnId: string, newTitle: string) => {
    setColumns(cols => cols.map(col =>
      col.id === columnId ? { ...col, title: newTitle } : col
    ));
  };

  const activeTask = activeId && activeType === 'task' ? findTaskById(activeId) : null;
  const activeColumn = activeId && activeType === 'column' ? columns.find(c => c.id === activeId) : null;

  return (
    <div className="flex-1 bg-[#f7f7f7] overflow-hidden flex flex-col min-h-0">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 overflow-x-auto overflow-y-auto p-[12px] md:p-[18px]">
          <SortableContext
            items={columns.map(c => c.id)}
            strategy={horizontalListSortingStrategy}
          >
            <div className="flex gap-[16px] md:gap-[24px] h-full">
              {columns.map(column => (
                <SortableColumn
                  key={column.id}
                  column={column}
                  onTitleChange={handleTitleChange}
                />
              ))}
            </div>
          </SortableContext>
        </div>

        <DragOverlay>
          {activeTask && (
            <div className="rotate-3 shadow-lg">
              <TaskCard {...activeTask} />
            </div>
          )}
          {activeColumn && (
            <div className="opacity-80 bg-[#f7f7f7] p-4 rounded-lg shadow-lg min-w-[220px]">
              <div className="flex items-center gap-2">
                <span>{activeColumn.emoji}</span>
                <span className="font-medium">{activeColumn.title}</span>
              </div>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
