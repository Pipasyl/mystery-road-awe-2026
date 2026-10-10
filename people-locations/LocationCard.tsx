import type { CaseLocation } from "../types";

// The type is called CaseLocation in types.ts (not "Location").
interface LocationCardProps {
  location: CaseLocation;
}

// Presentational component: shows one location, calculates nothing.
export default function LocationCard({ location }: LocationCardProps) {
  return (
    <div className="location-card">
      {/* id and name are shown together, like in the old vanilla heading */}
      <h3>
        {location.id} &mdash; {location.name}
      </h3>
      <p>{location.description}</p>
      <p>
        <strong>Contains:</strong>
      </p>
      <ul>
        {/* One <li> per entry in "contains". The text itself is the key,
            which works as long as the entries in one location are unique. */}
        {location.contains.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
