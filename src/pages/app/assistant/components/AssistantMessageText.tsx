import type { ReactNode } from "react";

/** Met en gras les passages **entre doubles astérisques** (sans HTML injecté). */
function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
    part.startsWith("**") && part.endsWith("**") && part.length > 4 ? (
      <strong key={index} className="font-semibold text-foreground-950">
        {part.slice(2, -2)}
      </strong>
    ) : (
      part.replace(/^#{1,6}\s+/, "")
    ),
  );
}

type Block = { type: "p"; text: string } | { type: "ul" | "ol"; items: string[] };

function parse(text: string): Block[] {
  const blocks: Block[] = [];
  text.split(/\r?\n/).forEach((rawLine) => {
    const line = rawLine.trim();
    if (!line) {
      blocks.push({ type: "p", text: "" });
      return;
    }
    const bullet = line.match(/^[-*•]\s+(.*)$/);
    const numbered = line.match(/^\d+[.)]\s+(.*)$/);
    const kind = bullet ? "ul" : numbered ? "ol" : null;
    if (kind) {
      const content = (bullet ?? numbered)![1];
      const last = blocks[blocks.length - 1];
      if (last && last.type === kind) last.items.push(content);
      else blocks.push({ type: kind, items: [content] });
      return;
    }
    const last = blocks[blocks.length - 1];
    if (last && last.type === "p" && last.text) last.text += ` ${line}`;
    else blocks.push({ type: "p", text: line });
  });
  return blocks.filter((block) => block.type !== "p" || block.text);
}

/** Affichage lisible des réponses de l'assistant (paragraphes, listes, gras). */
export default function AssistantMessageText({ text }: { text: string }) {
  return (
    <div className="space-y-2 text-xs leading-relaxed text-foreground-800">
      {parse(text).map((block, index) => {
        if (block.type === "p") return <p key={index}>{inline(block.text)}</p>;
        const ListTag = block.type;
        return (
          <ListTag
            key={index}
            className={`space-y-1 pl-4 ${block.type === "ul" ? "list-disc" : "list-decimal"}`}
          >
            {block.items.map((item, itemIndex) => (
              <li key={itemIndex}>{inline(item)}</li>
            ))}
          </ListTag>
        );
      })}
    </div>
  );
}
