import React from "react";
import { GetStaticProps, InferGetStaticPropsType } from "next";
import { strategy } from "../src/strategies/main.strategy";
import { Categories } from "../src/strategies/strategy";
import Link from "next/link";
import { Links } from "../src/lib/links";
import { Img } from "../src/components/img";

export const getStaticProps: GetStaticProps<{ categories: Categories[] }> = async () => ({
  props: {
    categories: await strategy.getCategories(),
  },
});

type Props = InferGetStaticPropsType<typeof getStaticProps>;

export default function Home({ categories }: Props) {
  return (
    <main className="flex flex-col h-screen justify-between">
      <section className="my-12 w-full grid grid-cols-1 md:grid-cols-2 gap-12 px-6 mx-auto container">
        {categories.map((category) => (
          <Link key={category.id} passHref href={Links.toDoc(category.url)}>
            <a className="transition-colors duration-300 block shadow-sm rounded-lg p-8 max-w-5xl bg-white dark:bg-transparent backdrop-blur-md border border-slate-200 link:border-slate-300 dark:border-zinc-700 dark:link:border-zinc-500">
              {category.icon && (
                <Img
                  src={category.icon}
                  alt={`Image for ${category.title}`}
                  className="block w-32 aspect-square float-left mr-8 rounded"
                />
              )}
              <h2 className="text-3xl font-bold">{category.title}</h2>
              <p className="mt-2">{category.description}</p>
            </a>
          </Link>
        ))}
      </section>
    </main>
  );
}
