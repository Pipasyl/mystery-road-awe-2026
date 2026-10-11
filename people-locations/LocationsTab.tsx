import { getAllLocations } from "../state";
import LocationsList from "./LocationsList";

// FEATURE component: the content of the /team/locations route.
export default function LocationsTab() {
  return <LocationsList locations={getAllLocations()} />;
}
