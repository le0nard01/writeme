import { DocumentStats } from "src/components";
import FsSync from "fs";
import matter from "gray-matter";
import { remarkTabs } from "src/lib/remark-tabs";
import { remarkVariables } from "src/lib/remark-variables";
import { Strings } from "src/lib/strings";
import { NextApiRequest, NextApiResponse } from "next";
import { MDXRemoteSerializeResult } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";
import Path from "path";
import remarkDef from "remark-deflist";
import remarkFootnotes from "remark-footnotes";
import remarkGemoji from "remark-gemoji";
import remarkGfm from "remark-gfm";
import remarkGithub from "remark-github";
import { Http } from "./http";
import { Is } from "./is";
import { Strategy } from "./strategy";

export namespace Writeme {
  type RecursiveDict = {
    [k: string]: string | RecursiveDict;
  };

  type ConfigValues = string | number | null | ConfigValues[];

  export type WritemeRcProps = {
    title: string;
    baseUrl?: string;
    strategy?: string;
    defaultRepository?: string;
    requestVariables?: Partial<Record<string, ConfigValues>>;
    tokens?: Partial<{
      colors: RecursiveDict;
    }>;
  };

  export const rcConfig = (): WritemeRcProps => {
    const path = Path.join(process.cwd(), "writeme.json");
    const exists = FsSync.existsSync(path);
    if (!exists)
      return {
        title: "Writeme",
      };
    return JSON.parse(FsSync.readFileSync(path, "utf-8"));
  };

  export const config = rcConfig();

  export type Config = typeof config;

  const markdownConfig = async (content: string, scope: any) => {
    const writemeRc = Writeme.rcConfig();
    const source = await serialize(content, {
      scope,
      mdxOptions: {
        remarkPlugins: [
          remarkGfm,
          remarkVariables(scope),
          remarkTabs,
          remarkGemoji,
          remarkDef,
          remarkFootnotes,
          [remarkGithub, { repository: scope.repository || writemeRc?.defaultRepository || "" }],
        ],
      },
    });
    return source;
  };

  type StaticProps = {
    source: MDXRemoteSerializeResult<Record<string, unknown>>;
    docs: Strategy.DocumentItem[];
    data: {
      next: DocumentStats | null;
      prev: DocumentStats | null;
      updatedAt: string;
      createdAt: string;
      readingTime: number;
    };
  };

  export const getStaticProps = async (
    queryPath: string[] | string | undefined,
    strategy: Strategy.Document
  ): Promise<StaticProps> => {
    const path = Array.isArray(queryPath) ? Strings.concatUrl(queryPath.join("/")) : queryPath!;
    const writemeConfig = Writeme.rcConfig();

    try {
      const file = await strategy.fileInfo(path);
      const { content, data } = matter(file.content);
      const scope = {
        ...data,
        ...writemeConfig?.requestVariables,
        ...writemeConfig,
        repository: data.repository ?? "",
      };
      const source = await markdownConfig(content, scope);
      const docs = await strategy.groups();
      const currentGroup = docs.find((x) => x.sidebar === data.sidebar) ?? null;
      const order = data.order - 1;
      const next = currentGroup?.items[order + 1] ?? null;
      const prev = currentGroup?.items[order - 1] ?? null;

      return {
        source,
        docs,
        data: {
          ...data,
          next,
          prev,
          updatedAt: file.updatedAt.toISOString(),
          createdAt: file.createdAt.toISOString(),
          readingTime: Math.ceil(content.split(" ").length / 250),
        },
      };
    } catch (error) {
      throw error;
    }
  };

  type Actions = Partial<Record<Http.Method, (req: NextApiRequest, res: NextApiResponse) => any>>;

  export const apiHandler = (actions: Actions) => (req: NextApiRequest, res: NextApiResponse) => {
    const method = (req.method ?? Http.Method.get)?.toLowerCase() as Http.Method;

    if (Is.Keyof(actions, method)) {
      const fn = actions[method];
      if (fn) {
        return fn(req, res);
      }
    }
    return res.status(Http.StatusCode.MethodNotAllowed);
  };
}
