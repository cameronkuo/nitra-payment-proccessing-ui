# `GlobalDialog` Component

## Overview

The `GlobalDialog` is a centralized dialog component for the application. It is controlled via a global event emitter, allowing you to trigger dialogs from anywhere in your code without having to manage their state within individual components.

## Usage

To use the `GlobalDialog`, you need to import the `eventEmitter` and the `CommonEvent` enum.

```typescript
import { eventEmitter } from 'src/utils/event-emitter';
import { CommonEvent } from 'src/enums/emitter';
import type { DialogConfig } from 'src/components/GlobalDialog';
```

### Opening a Dialog

To open a dialog, you emit the `OPEN_DIALOG` event with a `DialogConfig` object:

```typescript
const config: DialogConfig = { /* ... your configuration ... */ };
eventEmitter.emit(CommonEvent.OPEN_DIALOG, config);
```

### Closing a Dialog

To close the currently open dialog, you emit the `CLOSE_DIALOG` event:

```typescript
eventEmitter.emit(CommonEvent.CLOSE_DIALOG);
```

## `DialogConfig` Interface

The `DialogConfig` object allows you to customize the dialog's appearance and behavior.

| Property      | Type                               | Description                                                                                                                              |
|---------------|------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------|
| `title`       | `string`                           | The title displayed in the dialog's header.                                                                                              |
| `showClose`   | `boolean`                          | Whether to show the close button in the header. Defaults to `true`.                                                                      |
| `children`    | `VNode \| (() => VNode)`           | The main content of the dialog. You can provide a VNode or a function that returns a VNode (useful with Vue's `h` function).             |
| `dialogSlots` | `{ header?: () => VNode; footer?: () => VNode; }` | An object to provide custom VNodes for the header and footer slots.                                                              |
| `dialogProps` | `QDialogProps`                     | An object of props to be passed to the underlying Quasar `q-dialog` component. Allows for advanced customization (e.g., `persistent`). |
| `onClose`     | `() => void`                       | A callback function that gets executed when the dialog is closed.                                                                        |

## Examples

Here are some examples of how to configure and open different types of dialogs. These examples are taken from the `DialogDemo.vue` page.

### Simple Dialog

```typescript
import { h } from 'vue';

const openSimpleDialog = () => {
  const config: DialogConfig = {
    title: 'Simple Dialog',
    showClose: true,
    children: () => h('p', 'This is the content of the simple dialog.'),
    onClose: () => {
      console.log('Simple dialog closed');
    },
  };
  eventEmitter.emit(CommonEvent.OPEN_DIALOG, config);
};
```

### Dialog with a Custom Footer

```typescript
import { h } from 'vue';
import { QBtn } from 'quasar';

const openFooterDialog = () => {
  const config: DialogConfig = {
    title: 'Dialog with Footer',
    showClose: false,
    children: () => h('p', 'This dialog has a custom footer with action buttons.'),
    dialogSlots: {
      footer: () => [
        h(QBtn, {
          label: 'Cancel',
          color: 'primary',
          flat: true,
          onClick: () => eventEmitter.emit(CommonEvent.CLOSE_DIALOG),
        }),
        h(QBtn, {
          label: 'OK',
          color: 'primary',
          onClick: () => eventEmitter.emit(CommonEvent.CLOSE_DIALOG),
        }),
      ],
    },
  };
  eventEmitter.emit(CommonEvent.OPEN_DIALOG, config);
};
```

### Persistent Dialog

```typescript
import { h } from 'vue';

const openPersistentDialog = () => {
  const config: DialogConfig = {
    title: 'Persistent Dialog',
    showClose: false,
    dialogProps: {
      persistent: true,
    },
    children: () => h('p', 'This dialog cannot be closed by normal means.'),
  };
  eventEmitter.emit(CommonEvent.OPEN_DIALOG, config);
};
```
