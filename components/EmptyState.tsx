// Props: the text to show. Passing it in makes this component reusable
// for people, locations and timeline (each with its own message).
interface EmptyStateProps {
  message: string;
}

// Presentational component: it only displays the message it receives.
// The parent decides WHEN to show it (when a list is empty).
export default function EmptyState({ message }: EmptyStateProps) {
  return <p className="empty-state">{message}</p>;
}
