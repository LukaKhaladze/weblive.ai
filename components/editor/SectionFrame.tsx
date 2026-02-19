"use client";

import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";

export default function SectionFrame({
  id,
  children,
  onSelect,
  selected,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  toolbar,
  disableControls = false,
}: {
  id: string;
  children: React.ReactNode;
  onSelect: () => void;
  selected: boolean;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  toolbar?: React.ReactNode;
  disableControls?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const iconBtn =
    "rounded-full border border-border bg-primary p-2 text-muted hover:bg-border hover:text-[#F8FAFC]";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative rounded-[28px] border ${selected ? "border-[color:var(--primary)]" : "border-transparent"} group`}
      onClick={onSelect}
    >
      {!disableControls && (
      <div className="absolute right-3 top-3 z-10 flex gap-2 opacity-0 transition group-hover:opacity-100">
        <button
          className={iconBtn}
          onClick={(event) => {
            event.stopPropagation();
            onMoveUp();
          }}
          aria-label="Move up"
          title="Move up"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 6l-6 6m6-6l6 6" />
          </svg>
        </button>
        <button
          className={iconBtn}
          onClick={(event) => {
            event.stopPropagation();
            onMoveDown();
          }}
          aria-label="Move down"
          title="Move down"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 18l6-6m-6 6l-6-6" />
          </svg>
        </button>
        <button
          className={iconBtn}
          onClick={(event) => {
            event.stopPropagation();
            onDuplicate();
          }}
          aria-label="Duplicate"
          title="Duplicate"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="8" y="8" width="10" height="10" rx="2" />
            <path d="M6 16H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        </button>
        <button
          className={`${iconBtn} text-[#F8FAFC]`}
          onClick={(event) => {
            event.stopPropagation();
            onDelete();
          }}
          aria-label="Delete"
          title="Delete"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18" />
            <path d="M8 6V4h8v2" />
            <path d="M6 6l1 14h10l1-14" />
            <path d="M10 11v6M14 11v6" />
          </svg>
        </button>
      </div>
      )}
      {!disableControls && (
        <div
          className="absolute left-3 top-3 z-10 cursor-grab rounded-full border border-border bg-primary p-2 text-muted"
          {...attributes}
          {...listeners}
          aria-label="Drag"
          title="Drag"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 9h14M5 15h14" />
          </svg>
        </div>
      )}
      <div className="overflow-hidden rounded-[24px] border border-border bg-primary">
        {toolbar}
        {children}
      </div>
    </div>
  );
}
