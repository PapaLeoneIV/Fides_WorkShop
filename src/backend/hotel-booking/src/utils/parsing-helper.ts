
export async function parseRequest(msg: string, schema: any) {
      return schema.parse((JSON.parse(msg)));
}
  