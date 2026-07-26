export interface GenerateOptions {
  schemaPath?: string;
  outputPath?: string;
}

export async function generateCommand(
  opts: GenerateOptions = {},
): Promise<void> {
  void opts;
}
