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
}: {
  id: string;
  children: React.ReactNode;
  onSelect: () => void;
  selected: boolean;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative rounded-[28px] border ${selected ? "border-[color:var(--primary)]" : "border-transparent"} group`}
      onClick={onSelect}
    >
      <div className="absolute right-3 top-3 z-10 flex gap-2 opacity-0 transition group-hover:opacity-100">
        <button
          className="rounded-full border border-slate-200 bg-white px-2 py-1 text-xs"
          onClick={(event) => {
            event.stopPropagation();
            onMoveUp();
          }}
        >
          Up
        </button>
        <button
          className="rounded-full border border-slate-200 bg-white px-2 py-1 text-xs"
          onClick={(event) => {
            event.stopPropagation();
            onMoveDown();
          }}
        >
          Down
        </button>
        <button
          className="rounded-full border border-slate-200 bg-white px-2 py-1 text-xs"
          onClick={(event) => {
            event.stopPropagation();
            onDuplicate();
          }}
        >
          Duplicate
        </button>
        <button
          className="rounded-full border border-slate-200 bg-white px-2 py-1 text-xs text-red-600"
          onClick={(event) => {
            event.stopPropagation();
            onDelete();
          }}
        >
          Delete
        </button>
      </div>
      <div
        className="absolute left-3 top-3 z-10 cursor-grab rounded-full border border-slate-200 bg-white px-2 py-1 text-xs"
        {...attributes}
        {...listeners}
      >
        Drag
      </div>
      <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
        {children}
      </div>
    </div>
  );
}
