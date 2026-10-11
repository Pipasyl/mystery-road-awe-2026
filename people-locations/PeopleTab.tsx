import { getAllPeople } from "../state";
import PeopleList from "./PeopleList";

// FEATURE component: the content of the /team/people route.
// It reads the data and hands it to the list.
export default function PeopleTab() {
  return <PeopleList people={getAllPeople()} />;
}
