import { defineComponent } from 'vue';

export interface DropIndicatorProps {
  dropLevelOffset: number;
  dropPosition: -1 | 0 | 1;
  indent: number;
}

const DropIndicator = defineComponent<DropIndicatorProps>(
  (props) => {
    return () => {
      const style: any = {
        pointerEvents: 'none',
        position: 'absolute',
        right: 0,
        backgroundColor: 'red',
        height: `2px`,
      };

      switch (props.dropPosition) {
        case -1: {
          style.top = 0;
          style.left = `${-props.dropLevelOffset * props.indent}px`;
          break;
        }
        case 1: {
          style.bottom = 0;
          style.left = `${-props.dropLevelOffset * props.indent}px`;
          break;
        }

        default: {
          style.bottom = 0;
          style.left = `${props.indent}px`;
          break;
        }
      }

      return <div style={style} />;
    };
  },
  {
    name: 'DropIndicator',
    inheritAttrs: false,
  },
);

export default DropIndicator;
