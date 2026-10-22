import { splitLinks } from "../../utils/linkify";

/*
 * Text with its links made clickable, opening in a new tab. Built from React
 * elements rather than HTML, so the text itself can never inject markup.
 *
 * Clicks and keys stop at the link: it often sits inside a clickable card,
 * which would otherwise navigate away as well.
 */
const LinkifiedText = ({ text }) => (
  <>
    {splitLinks(text || "").map((part, index) =>
      part.href ? (
        <a
          key={index}
          href={part.href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          className="break-all text-blue-600 underline hover:text-blue-800"
        >
          {part.text}
        </a>
      ) : (
        part.text
      ),
    )}
  </>
);

export default LinkifiedText;
