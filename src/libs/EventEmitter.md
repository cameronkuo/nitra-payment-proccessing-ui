# `EventEmitter` Class

## Overview

The `EventEmitter` is a generic, type-safe class that provides a simple and reliable way to implement the publish-subscribe pattern in the application. It allows different parts of the code to communicate with each other without having direct dependencies.

This implementation is type-safe, meaning that the event names and their corresponding payload types are checked at compile time, which helps to prevent common errors.

## Creating an Instance

To use the `EventEmitter`, you first need to define an `EventMap`. The `EventMap` is an interface or type that defines the available events and the types of their arguments.

### EventMap

The `EventMap` is a record where:
*   The **keys** are the names of the events (as strings or enums).
*   The **values** are tuples representing the types of the arguments for each event.

**Example:**

```typescript
type User = {
  name: string;
  age: number;
  email: string;
};

type UserAuthEventMap = {
  login: [user: User];
  logout: []; // No arguments
};
```

### Instantiation

Once you have the `EventMap`, you can create a new instance of the `EventEmitter`:

```typescript
const userAuthEmitter = new EventEmitter<UserAuthEventMap>();
```

## API

The `EventEmitter` class has three main methods: `on`, `emit`, and `off`.

### `on(event, callback)`

Subscribes to an event.

*   `event`: The name of the event to subscribe to. Must be a key of the `EventMap`.
*   `callback`: A function to be called when the event is emitted. The arguments of the callback are type-checked against the `EventMap`.

**Example:**

```typescript
userAuthEmitter.on("login", ({ name, age, email }) => {
  console.log(`User logged in: ${name}`);
});

userAuthEmitter.on("logout", () => {
  console.log("User logged out");
});
```

### `emit(event, ...args)`

Emits an event, calling all the subscribed callbacks.

*   `event`: The name of the event to emit. Must be a key of the `EventMap`.
*   `...args`: The arguments to pass to the callbacks. These arguments are type-checked against the `EventMap`.

**Example:**

```typescript
userAuthEmitter.emit("login", {
  name: "John Doe",
  age: 42,
  email: "john.doe@example.com",
});

userAuthEmitter.emit("logout");
```

### `off(event)`

Unsubscribes all callbacks from a specific event.

*   `event`: The name of the event to unsubscribe from. Must be a key of the `EventMap`.

**Example:**

```typescript
userAuthEmitter.off("login");
```

## Global Event Emitter

The project includes a pre-configured global event emitter located at `src/utils/event-emitter.ts`. This instance is used for application-wide communication, such as controlling the `GlobalDialog`.

You can import it and use it directly:

```typescript
import { eventEmitter } from 'src/utils/event-emitter';
import { CommonEvent } from 'src/enums/emitter';

// Example of using the global event emitter
eventEmitter.emit(CommonEvent.CLOSE_DIALOG);
```
