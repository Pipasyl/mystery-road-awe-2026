import ViewSection from "../components/ViewSection";
import { getAllPeople, getAllLocations } from "../state";
import PeopleList from "./PeopleList";
import LocationsList from "./LocationsList";
// PRESENTATION (Demo 4): un-comment this import and the <KeyDemo /> line below
// import KeyDemo from "../components/KeyDemo";

// FEATURE component: the whole People & Locations page.
// It reads the data and hands it to the two lists.
export default function PeoplePage() {
  return (
    <ViewSection title="People & Locations">
      {/* Temporary: both lists on one page.
          In Demo 8 they become two routes (/team/people, /team/locations). */}
      <PeopleList people={getAllPeople()} />
      <LocationsList locations={getAllLocations()} />
      {/* PRESENTATION (Demo 4): un-comment to show the key demo <KeyDemo /> */}
    </ViewSection>
  );
}
