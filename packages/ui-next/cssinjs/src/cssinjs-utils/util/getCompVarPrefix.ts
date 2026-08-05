function getCompVarPrefix(component: string, prefix?: string) {
  return [
    prefix,
    component
      .replaceAll(/([A-Z]+)([A-Z][a-z]+)/g, '$1-$2')
      .replaceAll(/([a-z])([A-Z])/g, '$1-$2'),
  ]
    .filter(Boolean)
    .join('-');
}

export default getCompVarPrefix;
