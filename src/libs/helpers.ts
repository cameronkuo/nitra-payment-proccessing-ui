function logIfDevelopment(logFunction: (...args: unknown[]) => void) {
  return (message?: unknown, ...optionalParams: unknown[]) => {
    if (import.meta.env.MODE === 'development') {
      logFunction(message, ...optionalParams);
    }
  };
}

/**
 * A collection of console methods that only log in development mode.
 * @type {object}
 * @property {Function} log - Logs a message to the console.
 * @property {Function} error - Logs an error message to the console.
 * @property {Function} warn - Logs a warning message to the console.
 * @property {Function} info - Logs an informational message to the console.
 * @property {Function} debug - Logs a debug message to the console.
 * @property {Function} table - Displays tabular data as a table.
 * @example
 * devConsole.log('This is a log message');
 */
export const devConsole = {
  // eslint-disable-next-line no-console
  log: logIfDevelopment(console.log),
  error: logIfDevelopment(console.error),
  warn: logIfDevelopment(console.warn),
  // eslint-disable-next-line no-console
  info: logIfDevelopment(console.info),
  // eslint-disable-next-line no-console
  debug: logIfDevelopment(console.debug),
  // eslint-disable-next-line no-console
  table: logIfDevelopment((...args) => console.table(...args)),
};
