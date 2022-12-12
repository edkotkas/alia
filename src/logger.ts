export abstract class Log {
  public static info(...data: unknown[]): void {
    console.log(...data)
  }

  public static error(...data: unknown[]): void {
    console.error(...data)
  }
}
