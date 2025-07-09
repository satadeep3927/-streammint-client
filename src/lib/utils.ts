export function getWebSocketFromHttpUrl(httpUrl: string): string {
  if (!httpUrl.startsWith("http://") && !httpUrl.startsWith("https://")) {
    throw new Error("Invalid HTTP URL");
  }

  const wsPrefix = httpUrl.startsWith("https://") ? "wss://" : "ws://";
  return httpUrl.replace(/^https?:\/\//, wsPrefix);
}
