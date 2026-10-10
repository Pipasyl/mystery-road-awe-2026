import type { CaseLocation } from "../types";

interface LocationCardProps {
  location: CaseLocation;
}

export default function LocationCard({ location }: LocationCardProps) {
  return (
    <div className="location-card">
      <h3>
        {location.id} &mdash; {location.name}
      </h3>
      <p>{location.description}</p>
      <p>
        <strong>Contains:</strong>
      </p>
      <ul>
        {location.contains.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}