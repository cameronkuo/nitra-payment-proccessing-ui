import { devConsole } from './helpers';

type Listener<T extends unknown[]> = (...args: T) => void;

/**
 * @example
 * ```
 * type User = {
 *   name: string;
 *   age: number;
 *   email: string;
 * };
 *
 * type UserAuthEventMap = {
 *   login: [user: User];
 *   logout: [];
 * };
 *
 * const userAuthEmitter = new EventEmitter<UserAuthEventMap>();
 *
 * userAuthEmitter.on("login", ({ name, age, email }) => {});
 * userAuthEmitter.on("logout", () => {});
 *
 * userAuthEmitter.emit("login", {
 *   name: "John",
 *   age: 42,
 *   email: "test@gmail.com",
 * });
 * userAuthEmitter.emit("logout");
 * ```
 */
class EventEmitter<EventMap extends Record<string | number, unknown[]>> {
  private events: {
    [K in keyof EventMap]?: Array<Listener<EventMap[K]>>;
  } = {};

  on<K extends keyof EventMap>(event: K, callback: Listener<EventMap[K]>) {
    devConsole.log('%con', 'color: green', event);
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event]?.push(callback);
  }

  emit<K extends keyof EventMap>(event: keyof EventMap, ...args: EventMap[K]) {
    devConsole.log('%cemit', 'color: blue', event, args);
    this.events[event]?.forEach((listener) => listener(...args));
  }

  off(event: keyof EventMap) {
    devConsole.log('%coff', 'color: red', event);
    delete this.events[event];
  }
}

export default EventEmitter;
