export class CustomError extends Error {
  public code: string;

  constructor(message: string, code: string) {
    super(message); // Pass message to the Error constructor.

    this.name = this.constructor.name; // Set the name to the name of this class.
    this.code = code; // Custom code property to identify the error further.
  }
}
