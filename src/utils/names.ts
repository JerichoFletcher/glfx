export function getReadableName(shaderName: string): string{
  let name = shaderName;
  if(name.match(/^[avu]_/)){
    name = name.substring(2);
  }

  const words = name.match(/([a-z]+)|([A-Z][a-z]*)/g);
  if(!words)return name;

  return words.map((word, i) => word.replace(/^\w/, m => i === 0 ? m.toUpperCase() : m.toLowerCase())).join(" ");
}
