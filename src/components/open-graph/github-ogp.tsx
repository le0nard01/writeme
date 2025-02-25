import { Input, OpenGraph } from "src/components/index";
import { debounce } from "src/lib/debounce";
import { useEffect, useRef, useState } from "react";

export default function GithubOgp() {
  const [repo, setRepo] = useState("octocat/Hello-World");
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (input.current === null) return;

    const handler = debounce((e: Event) => {
      const el = e.target as HTMLInputElement | null;
      if (el === null) return;
      setRepo(el.value);
    }, 600);

    input.current.addEventListener("input", handler);
  }, []);

  useEffect(() => {});
  return (
    <section>
      <div className="block mb-1 mt-4">
        <Input placeholder="owner/repository" defaultValue={repo} ref={input} />
      </div>
      <OpenGraph url={`https://github.com/${repo}`} />
    </section>
  );
}
