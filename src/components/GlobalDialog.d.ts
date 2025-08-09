import type { QDialogProps } from 'quasar';
import type { VNode } from 'vue';

export interface DialogConfig {
  title?: string;
  showClose?: boolean;
  children?: VNode | (() => VNode);
  dialogSlots?: {
    header?: VNode | VNode[] | (() => VNode | VNode[]);
    footer?: VNode | VNode[] | (() => VNode | VNode[]);
  };
  dialogProps?: Omit<QDialogProps, 'class' | 'modelValue'> & {
    class?: string | string[] | { [key: string]: boolean };
  };
  onClose?: () => void;
}
