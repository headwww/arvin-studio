export interface AbstractNode {
  // 属性: viewBox, d, fill 等
  attrs: {
    [key: string]: string;
  };
  // 子节点
  children?: AbstractNode[];
  // svg 标签名: 'svg', 'path', 'g' 等
  tag: string;
}

export interface IconDefinition {
  icon:
    | ((primaryColor: string, secondaryColor: string) => AbstractNode)
    | AbstractNode;
  name: string; // 图标名称 (kebab-case)
  theme: ThemeType;
}

export type ThemeType = 'filled' | 'outlined';
export type ThemeTypeUpperCase = 'Filled' | 'Outlined';
