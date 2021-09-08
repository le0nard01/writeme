import { Strings } from "lib/strings";
import React, { useEffect, useState, VFC } from "react";

const Tags = {
  H2: "ml-0",
  H3: "ml-4",
  H4: "ml-8",
  H5: "ml-16",
  H6: "ml-24",
};

type Tag = keyof typeof Tags;

type Heading = {
  text: string;
  id: string;
  tag: Tag;
};

type Props = {
  id?: string;
};

export const TableOfContent: VFC<Props> = ({ id = "document-root" }) => {
  const [titles, setTitles] = useState<Heading[]>([]);

  useEffect(() => {
    const root = document.getElementById(id);
    if (root === null) return;

    const createTableContent = () => {
      if (root === null) return;
      const headers: HTMLHeadingElement[] = Array.from(root.querySelectorAll("h2, h3, h4, h5, h6"));
      setTitles(
        headers.map((x) => {
          const textContent = x.textContent!;
          const text = x.dataset.text ?? textContent;
          const id = Strings.slug(textContent);
          x.id = id;
          return {
            text,
            id,
            tag: x.tagName as Tag,
          };
        })
      );
    };

    createTableContent();
    const observer = new MutationObserver(createTableContent);
    observer.observe(root, { subtree: true, childList: true });
    return () => {
      observer.disconnect();
    };
  }, [id]);

  return (
    <header className="mt-2 mb-4">
      <nav>
        <ul className="list-inside">
          {titles.map((x) => (
            <li key={x.id} className={`my-1 duration-500 list-none ${Tags[x.tag]}`}>
              <a className="w-fit hover:underline" href={`#${x.id}`}>
                {x.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
};
