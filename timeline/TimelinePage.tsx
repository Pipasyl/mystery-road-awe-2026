import ViewSection from "../components/ViewSection";
import { getAllTimeline } from "../state";
import TimelineList from "./TimelineList";

// FEATURE component: the whole Timeline page.
// It reads the data (getAllTimeline) and hands it to TimelineList.
export default function TimelinePage() {
  return (
    <ViewSection title="Investigation Timeline">
      {/* react-main.tsx renders the app only after loading is done,
          so the list is already filled here. */}
      <TimelineList events={getAllTimeline()} />
    </ViewSection>
  );
}
