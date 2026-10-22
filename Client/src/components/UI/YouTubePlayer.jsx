import { youtubeEmbedUrl } from "../../utils/youtube";

/*
 * An embedded YouTube player. YouTube's own controls give fullscreen, and
 * its logo opens the video on YouTube.
 *
 * loading="lazy" keeps a grid of these cheap: only players near the screen
 * load. The referrer policy matters — YouTube refuses to play embeds that
 * arrive without a referrer (player error 153).
 */
const YouTubePlayer = ({ videoId, title, autoplay = false, className = "" }) => {
  if (!videoId) return null;

  return (
    <iframe
      src={youtubeEmbedUrl(videoId, { autoplay })}
      title={title || "YouTube video"}
      loading="lazy"
      allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
      allowFullScreen
      referrerPolicy="strict-origin-when-cross-origin"
      className={`aspect-video w-full rounded-lg bg-black ${className}`}
    />
  );
};

export default YouTubePlayer;
