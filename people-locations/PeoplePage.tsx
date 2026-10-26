import { Outlet } from "react-router";
import ViewSection from "../components/ViewSection";
import PeopleLocationsTabs from "./PeopleLocationsTabs";
// PRESENTATION (Demo 4): un-comment this import and the <KeyDemo /> line below
//import KeyDemo from "../components/KeyDemo";

// Layout component: the frame shared by /team/people and /team/locations.
// The title and the tabs stay on screen, only the content below them changes.
export default function PeoplePage() {
  return (
    <ViewSection title="People & Locations">
      <PeopleLocationsTabs />

      {/* UNCOMMENT SO IT RENDERS ON SCREEN 
      <KeyDemo />*/}

      {/* Outlet = the hole where the router puts the matching child route
          (PeopleTab or LocationsTab). */}
      <Outlet />
    </ViewSection>
  );
}
