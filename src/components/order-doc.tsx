import Link from "next/link";
import React from "react";
import { BsChevronDoubleLeft, BsChevronDoubleRight } from "react-icons/bs";

export type DocumentStats = {
  title: string;
  description: string;
  section: string;
  repository: string;
  order: number;
  sidebar: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  readingTime: string;
  link: string;
  next: DocumentStats | null;
  prev: DocumentStats | null;
};

export type Metadata = DocumentStats;

type Extra = {
  direction: "next" | "prev";
};

export const OrderDoc = (props: DocumentStats & Extra) => (
  <aside className="order-doc previous-doc w-full max-w-sm break-words whitespace-pre-wrap justify-between items-end gap-x-4 gap-y-4">
    <Link href={props.link} passHref>
      <a href="src/components/order-doc">
        <div className={`w-full block mb-2 ${props.direction === "next" ? "text-right" : ""}`}>
          <h3 className="font-extrabold">{props.title}</h3>
        </div>
        {props.direction === "prev" && (
          <p className="w-full text-left font-extrabold text-main-normal">
            <BsChevronDoubleLeft className="inline-block text mb-1 mr-1" />
            Previous
          </p>
        )}
        {props.direction === "next" && (
          <p className="w-full text-right font-extrabold text-main-normal">
            Next
            <BsChevronDoubleRight className="inline-block mb-1 ml-1" />
          </p>
        )}
      </a>
    </Link>
  </aside>
);
