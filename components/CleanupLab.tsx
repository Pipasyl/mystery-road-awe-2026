import { useEffect, useState } from "react";

// THEORY: React calls the cleanup before the effect runs again (dependency changed)
// and when the component is removed. If there is no cleanup, the old timer lives on.
function Ticker({ withCleanup, delay }: { withCleanup: boolean; delay: number }) {
  const [ticks, setTicks] = useState(0);

  useEffect(() => {
    console.log("EFFECT: start timer, every", delay, "ms");
    const id = setInterval(() => {
      console.log("tick from timer", id); // shows which timer is still alive
      setTicks((t) => t + 1);
    }, delay);

    // Without cleanup: we return nothing, so React has nothing to call.
    if (!withCleanup) return;

    return () => {
      console.log("CLEANUP: stop timer", id);
      clearInterval(id);
    };
  }, [delay, withCleanup]); // effect runs again when delay changes

  return <p>Ticks: {ticks}</p>;
}

export default function CleanupLab() {
  const [show, setShow] = useState(true);
  const [withCleanup, setWithCleanup] = useState(true);
  const [delay, setDelay] = useState(1000);

  return (
    <div>
      <button onClick={() => setShow(!show)}>{show ? "Hide" : "Show"}</button>
      <button onClick={() => setDelay(delay === 1000 ? 500 : 1000)}>Delay: {delay} ms</button>
      <label>
        <input
          type="checkbox"
          checked={withCleanup}
          onChange={(e) => setWithCleanup(e.target.checked)}
        />
        with cleanup
      </label>
      {show && <Ticker withCleanup={withCleanup} delay={delay} />}
    </div>
  );
}
