import template from 'lodash.template';

import { createTransformStream } from '../creator';

export interface UseTemplatePluginOptions {
  mapToInterpolate: MapToInterpolate;
  template: string;
}

export interface MapToInterpolate {
  (meta: { content: string; name: string; path: string }): object;
}

export const useTemplate = ({
  template: tplContent,
  mapToInterpolate,
}: UseTemplatePluginOptions) => {
  const executor = template(tplContent);
  return createTransformStream((content, { stem: name, path }) =>
    executor(mapToInterpolate({ name, content, path })),
  );
};
