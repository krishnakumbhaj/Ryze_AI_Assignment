"use client";

import React from "react";
import { ComponentNode } from "@/lib/types";
import {
  Container,
  Text,
  Button,
  Input,
  Card,
  Modal,
  Navbar,
  Sidebar,
  Table,
  Chart,
} from "@/components/ui";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const COMPONENT_MAP: Record<string, React.ComponentType<any>> = {
  Container,
  Text,
  Button,
  Input,
  Card,
  Modal,
  Navbar,
  Sidebar,
  Table,
  Chart,
};

function renderNode(node: ComponentNode | string, key: number): React.ReactNode {
  if (typeof node === "string") {
    return node;
  }

  const Component = COMPONENT_MAP[node.type];
  if (!Component) {
    return (
      <div
        key={key}
        className="text-red-500 p-2 border border-red-300 rounded bg-red-50 text-sm"
      >
        Unknown component: {node.type}
      </div>
    );
  }

  const children = node.children?.map((child, i) => renderNode(child, i));

  return (
    <Component key={key} {...(node.props || {})}>
      {children}
    </Component>
  );
}

interface PreviewRendererProps {
  tree: ComponentNode | null;
}

export default function PreviewRenderer({ tree }: PreviewRendererProps) {
  if (!tree) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-20">
        <div className="text-5xl opacity-30">🎨</div>
        <p className="text-sm text-gray-400">
          Describe a UI in the chat to generate a preview
        </p>
      </div>
    );
  }

  return <div className="min-h-full">{renderNode(tree, 0)}</div>;
}
