import { Pill } from "../../components/UI/kit";
import { VIDEO_TRIMESTER_SHORT } from "../../constants/planVideo";

const TIER_TONES = { basic: "blue", pro: "purple", elite: "amber" };

/*
 * The plans a video is on. Names come live from the package, so a rename
 * shows here at once. A video left with no plan — its only package was
 * deleted — reaches nobody, which is worth saying out loud.
 */
export const PlanChips = ({ packages = [] }) => {
  if (!packages.length) {
    return <Pill tone="red">No plan · hidden from patients</Pill>;
  }

  return packages.map((pkg) => (
    <Pill
      key={pkg._id}
      tone={pkg.isActive === false ? "slate" : TIER_TONES[pkg.tier] || "slate"}
    >
      {pkg.name}
      {pkg.isActive === false ? " (inactive)" : ""}
    </Pill>
  ));
};

export const TrimesterChips = ({ trimesters = [] }) => {
  if (trimesters.length === 3) return <Pill tone="teal">All trimesters</Pill>;
  return trimesters.map((trimester) => (
    <Pill key={trimester} tone="teal">
      {VIDEO_TRIMESTER_SHORT[trimester] || trimester} Trimester
    </Pill>
  ));
};
