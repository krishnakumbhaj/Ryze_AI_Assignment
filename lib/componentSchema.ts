// Defines the fixed set of allowed components and their prop schemas.
// The AI can ONLY use components listed here.

export interface PropSchema {
  type: "string" | "number" | "boolean" | "array" | "enum";
  required?: boolean;
  enumValues?: string[];
  description?: string;
  itemSchema?: Record<string, PropSchema>;
}

export interface ComponentSchema {
  name: string;
  description: string;
  props: Record<string, PropSchema>;
  acceptsChildren: boolean;
}

export const ALLOWED_COMPONENTS: Record<string, ComponentSchema> = {
  Container: {
    name: "Container",
    description: "Layout container for arranging child components",
    props: {
      direction: {
        type: "enum",
        enumValues: ["row", "column"],
        description: "Flex direction",
      },
      gap: {
        type: "enum",
        enumValues: ["none", "sm", "md", "lg"],
        description: "Gap between children",
      },
      padding: {
        type: "enum",
        enumValues: ["none", "sm", "md", "lg", "xl"],
        description: "Padding",
      },
      align: {
        type: "enum",
        enumValues: ["start", "center", "end", "stretch"],
        description: "Align items",
      },
      justify: {
        type: "enum",
        enumValues: ["start", "center", "end", "between", "around"],
        description: "Justify content",
      },
      wrap: { type: "boolean", description: "Flex wrap" },
    },
    acceptsChildren: true,
  },

  Text: {
    name: "Text",
    description: "Text element with predefined variants",
    props: {
      content: { type: "string", required: true, description: "Text content" },
      variant: {
        type: "enum",
        enumValues: ["h1", "h2", "h3", "p", "span", "label"],
        description: "Text variant",
      },
      weight: {
        type: "enum",
        enumValues: ["normal", "medium", "bold"],
        description: "Font weight",
      },
      color: {
        type: "enum",
        enumValues: ["default", "muted", "primary", "danger", "success"],
        description: "Text color",
      },
    },
    acceptsChildren: false,
  },

  Button: {
    name: "Button",
    description: "Clickable button",
    props: {
      text: { type: "string", required: true, description: "Button label" },
      variant: {
        type: "enum",
        enumValues: ["primary", "secondary", "danger", "ghost"],
        description: "Button style variant",
      },
      size: {
        type: "enum",
        enumValues: ["sm", "md", "lg"],
        description: "Button size",
      },
      disabled: { type: "boolean", description: "Disabled state" },
      fullWidth: { type: "boolean", description: "Full width button" },
    },
    acceptsChildren: false,
  },

  Input: {
    name: "Input",
    description: "Text input field",
    props: {
      label: { type: "string", description: "Input label" },
      placeholder: { type: "string", description: "Placeholder text" },
      type: {
        type: "enum",
        enumValues: ["text", "password", "email", "number", "search", "tel"],
        description: "Input type",
      },
      disabled: { type: "boolean", description: "Disabled state" },
      value: { type: "string", description: "Default value" },
      required: { type: "boolean", description: "Required field" },
    },
    acceptsChildren: false,
  },

  Card: {
    name: "Card",
    description: "Card container with optional title and subtitle",
    props: {
      title: { type: "string", description: "Card title" },
      subtitle: { type: "string", description: "Card subtitle" },
      padding: {
        type: "enum",
        enumValues: ["sm", "md", "lg"],
        description: "Card padding",
      },
    },
    acceptsChildren: true,
  },

  Modal: {
    name: "Modal",
    description: "Modal dialog overlay",
    props: {
      title: { type: "string", required: true, description: "Modal title" },
      isOpen: { type: "boolean", description: "Whether modal is visible" },
    },
    acceptsChildren: true,
  },

  Navbar: {
    name: "Navbar",
    description: "Top navigation bar",
    props: {
      title: { type: "string", required: true, description: "Brand/title" },
      links: {
        type: "array",
        description: "Navigation links",
        itemSchema: {
          text: { type: "string", required: true, description: "Link text" },
          href: { type: "string", description: "Link URL" },
        },
      },
    },
    acceptsChildren: false,
  },

  Sidebar: {
    name: "Sidebar",
    description: "Side navigation panel",
    props: {
      items: {
        type: "array",
        description: "Sidebar menu items",
        itemSchema: {
          text: { type: "string", required: true, description: "Item text" },
          active: { type: "boolean", description: "Active state" },
          icon: { type: "string", description: "Icon name" },
        },
      },
      title: { type: "string", description: "Sidebar title" },
    },
    acceptsChildren: false,
  },

  Table: {
    name: "Table",
    description: "Data table",
    props: {
      headers: {
        type: "array",
        description: "Column headers",
      },
      rows: {
        type: "array",
        description: "Table rows (array of arrays)",
      },
      striped: { type: "boolean", description: "Striped rows" },
    },
    acceptsChildren: false,
  },

  Chart: {
    name: "Chart",
    description: "Simple chart visualization (mock rendering)",
    props: {
      type: {
        type: "enum",
        enumValues: ["bar", "line", "pie"],
        description: "Chart type",
      },
      title: { type: "string", description: "Chart title" },
      data: {
        type: "array",
        description: "Chart data points",
        itemSchema: {
          label: { type: "string", required: true, description: "Data label" },
          value: { type: "number", required: true, description: "Data value" },
        },
      },
    },
    acceptsChildren: false,
  },
};

export const COMPONENT_NAMES = Object.keys(ALLOWED_COMPONENTS);

// Layout-only types that can be used for wrapping
export const LAYOUT_COMPONENTS = ["Container"];

// Generate a description of the component library for LLM prompts
export function getComponentLibraryDescription(): string {
  return Object.values(ALLOWED_COMPONENTS)
    .map((schema) => {
      const props = Object.entries(schema.props)
        .map(([name, prop]) => {
          let desc = `  - ${name}: ${prop.type}`;
          if (prop.enumValues) desc += ` (${prop.enumValues.join(" | ")})`;
          if (prop.required) desc += " [required]";
          if (prop.description) desc += ` — ${prop.description}`;
          return desc;
        })
        .join("\n");
      return `**${schema.name}**: ${schema.description}\n  Children: ${schema.acceptsChildren ? "yes" : "no"}\n  Props:\n${props}`;
    })
    .join("\n\n");
}
