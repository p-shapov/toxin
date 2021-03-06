declare module '*.njk' {
  import {Template} from 'nunjucks';
  const content: Template['render'];
  export default content;
}

type ArrayElement<ArrayType extends readonly unknown[]> = ArrayType extends readonly (infer ElementType)[] ? ElementType : never;