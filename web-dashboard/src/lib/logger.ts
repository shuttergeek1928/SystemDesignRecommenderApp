/**
 * Utility to send logs from the UI to the backend Serilog instance.
 * These logs are filtered into logs/ui-log.txt on the server.
 */

const API_BASE = "http://localhost:5220";

export const uiLogger = {
  info: (message: string) => sendLog(message, "Information"),
  warn: (message: string) => sendLog(message, "Warning"),
  error: (message: string) => sendLog(message, "Error"),
  debug: (message: string) => sendLog(message, "Debug"),
};

async function sendLog(message: string, level: string) {
  // Always log to browser console too
  const logFn = level.toLowerCase() === "error" ? console.error : 
                level.toLowerCase() === "warning" ? console.warn : console.log;
  logFn(`[UI-${level}] ${message}`);

  try {
    await fetch(`${API_BASE}/api/Logs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, level }),
    });
  } catch (err) {
    // Silent fail to avoid infinite loops if the logging endpoint itself fails
  }
}
