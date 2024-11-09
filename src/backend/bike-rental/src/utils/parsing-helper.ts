
export async function parseRequest(msg: string, schema: any) : Promise<any> {
      let parsedMessage = JSON.parse(msg);
      if (typeof parsedMessage === "string") return parsedMessage;
      else return schema.parse(parsedMessage);    
}

