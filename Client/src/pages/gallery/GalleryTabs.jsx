import { Image, Youtube } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import { Tabs } from "../../components/UI/kit";

const TABS = [
  { key: "/gallery", label: "Gallery", icon: Image },
  { key: "/gallery/videos", label: "YouTube", icon: Youtube },
];

// The two sections under Gallery in the sidebar.
const GalleryTabs = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const active = pathname.startsWith("/gallery/videos")
    ? "/gallery/videos"
    : "/gallery";

  return (
    <Tabs
      tabs={TABS}
      active={active}
      onChange={(path) => navigate(path)}
      className="mb-4 sm:max-w-sm"
    />
  );
};

export default GalleryTabs;
