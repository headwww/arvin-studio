// 1. 核心变更：4.x 版本使用命名导出 parseXml，原 Element 更名为 XmlElement
import { parseXml, XmlElement, XmlNode } from '@rgrove/parse-xml';
import {
  __,
  applyTo,
  assoc,
  both,
  clone,
  defaultTo,
  dissoc as deleteProperty,
  filter,
  path as get,
  gt as greaterThan,
  length,
  map,
  objOf,
  pipe,
  reduce,
  unless,
  where,
} from 'ramda';

import { AbstractNode, ThemeType } from '../../templates/types';
import { createTransformStream } from '../creator';

export interface AbstractNodeDefinition {
  icon: AbstractNode;
  name: string;
  theme: ThemeType;
}

export interface StringifyFn {
  (icon: AbstractNodeDefinition): string;
}

export interface SVG2DefinitionOptions {
  extraNodeTransformFactories: TransformFactory[];
  stringify?: StringifyFn;
  theme: ThemeType;
}

export interface XML2AbstractNodeOptions extends SVG2DefinitionOptions {
  name: string;
}

export type TransformOptions = Pick<XML2AbstractNodeOptions, 'name' | 'theme'>;

export interface TransformFactory {
  (options: TransformOptions): (asn: AbstractNode) => AbstractNode;
}

// SVG 字符串转换至图标定义的流处理器
export const svg2Definition = ({
  theme,
  extraNodeTransformFactories,
  stringify,
}: SVG2DefinitionOptions) =>
  createTransformStream((SVGString, { stem: name }) =>
    applyTo(SVGString)(
      pipe(
        // 0. 解析 XML 字符串
        // 修正：4.x 不再支持默认导出，需明确调用 parseXml 函数
        (xml: string) => parseXml(xml),

        // 1. 获取 XML 的根节点 (通常是 <svg>)
        pipe(
          // 因为 parseXml 返回的 XmlDocument 的 children 成员是 XmlNode 数组
          get<XmlNode>(['children', 0]),

          // 使用类型断言告诉 TS，如果前面是 undefined，这里返回的空对象也是一个 XmlElement
          (node) => (node || {}) as XmlElement,
        ),

        // 2. 将 XML 元素转换为抽象节点 (AbstractNode)
        element2AbstractNode({
          name,
          theme,
          extraNodeTransformFactories,
        }),

        // 3. 构建最终的对象结构
        pipe(objOf('icon'), assoc('name', name), assoc('theme', theme)),

        // 序列化输出
        defaultTo(JSON.stringify)(stringify),
      ),
    ),
  );

/**
 * 递归将 XmlElement 转换为 AbstractNode
 */
function element2AbstractNode({
  name,
  theme,
  extraNodeTransformFactories,
}: XML2AbstractNodeOptions) {
  return ({ name: tag, attributes, children }: XmlElement): AbstractNode =>
    applyTo(extraNodeTransformFactories)(
      pipe(
        // 准备所有的转换工厂函数
        map((factory: TransformFactory) => factory({ name, theme })),

        // 逐一应用转换函数
        reduce(
          (transformedNode, extraTransformFunction) =>
            extraTransformFunction(transformedNode),
          applyTo({
            tag,
            attrs: clone(attributes),
            // 修正：处理子节点过滤
            children: applyTo(children as XmlNode[])(
              pipe(
                // 显式使用 TypeScript 的类型谓词判断是否为 element 类型
                filter(
                  (node: XmlNode): node is XmlElement =>
                    node.type === 'element',
                ),

                // 递归处理子元素
                map(
                  element2AbstractNode({
                    name,
                    theme,
                    extraNodeTransformFactories,
                  }),
                ),
              ),
            ),
          })(
            // 如果没有子节点，则删除 children 属性，保持 AST 干净
            unless<AbstractNode, AbstractNode>(
              where({
                children: both(Array.isArray, pipe(length, greaterThan(__, 0))),
              }),
              deleteProperty('children'),
            ),
          ),
        ),
      ),
    );
}
