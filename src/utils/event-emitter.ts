import EventEmitter from 'src/libs/event-emitter';

import type { DialogConfig } from 'src/components/GlobalDialog';
import type * as enums from 'src/enums';

export const eventEmitter = new EventEmitter<{
  [enums.emitter.CommonEvent.OPEN_DIALOG]: [DialogConfig];
  [enums.emitter.CommonEvent.CLOSE_DIALOG]: [];
  [enums.emitter.CommonEvent.TOGGLE_SIDEBAR]: [open: boolean];
}>();
