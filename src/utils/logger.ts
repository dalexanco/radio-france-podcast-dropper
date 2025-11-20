import pino from "pino";

let loggerInstance: pino.Logger | null = null;

/**
 * Initialize the logger with the specified log level
 */
export function setVerboseMode(verbose: boolean) {
  const level = verbose ? "debug" : "error";
  
  loggerInstance = pino({
    level,
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "HH:MM:ss",
        ignore: "pid,hostname",
        singleLine: false,
      },
    },
  });
}

/**
 * Get the logger instance, initializing with default level if not already initialized
 */
function getLogger(): pino.Logger {
  if (!loggerInstance) {
    setVerboseMode(false);
  }
  return loggerInstance!;
}

/**
 * Classic logger API
 * Supports both: logger.debug(msg) and logger.debug(context, msg)
 */
export const logger = {
  debug: (contextOrMsg: string | Record<string, any>, msg?: string) => {
    const log = getLogger();
    if (typeof contextOrMsg === "string") {
      log.debug({}, contextOrMsg);
    } else {
      log.debug(contextOrMsg, msg || "");
    }
  },
  
  info: (contextOrMsg: string | Record<string, any>, msg?: string) => {
    const log = getLogger();
    if (typeof contextOrMsg === "string") {
      log.info({}, contextOrMsg);
    } else {
      log.info(contextOrMsg, msg || "");
    }
  },
  
  error: (msg: string, error?: any, context?: Record<string, any>) => {
    const log = getLogger();
    const errorContext: Record<string, any> = { ...context };
    
    if (error) {
      if (error instanceof Error) {
        errorContext.error = {
          message: error.message,
          stack: error.stack,
          name: error.name,
        };
      } else {
        errorContext.error = error;
      }
    }
    
    log.error(errorContext, msg);
  },
};
