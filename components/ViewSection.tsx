import type { ReactNode } from "react";

interface ViewSectionProps {
  // Named prop: one short, known value.
  title: string;
  // children = whatever is written between <ViewSection> and </ViewSection>.
  // ReactNode means "anything React can display" (text, tags, lists, nothing).
  children: ReactNode;
}

// Wrapper: owns the box that every view shares (section + h2).
// It does not know what the content is, it only decides WHERE it goes.
export default function ViewSection({ title, children }: ViewSectionProps) {
  return (
    // Always "active": only one page is mounted at a time in React,
    // so we no longer need the old show/hide class logic.
    <section className="view active">
      <h2>{title}</h2>
      {/* The slot where the content from between the tags appears */}
      {children}
    </section>
  );
}