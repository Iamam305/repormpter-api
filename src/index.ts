import { Elysia, t } from "elysia";
import { generate_prompt } from "./libs/generate-propmt";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { rateLimit } from "elysia-rate-limit";

class Logger {
  log(value: string) {
    console.log(value);
  }
}
const app = new Elysia()
  .decorate("logger", new Logger())
  .use(swagger())
  .get("/", () => "Hello Elysia")
  .post(
    "/generate-prompt",
    async ({ body }) => {
      const prompt = (await generate_prompt(body.input)) || "";
      const matches = prompt.match(
        /<revised_prompt>([\s\S]*?)<\/revised_prompt>/g
      );

      const extractedTexts = matches
        ? matches.map((match) => match.replace(/<[^>]*>/g, "").trim())
        : [];
      return extractedTexts;
    },
    {
      body: t.Object({
        input: t.String({
          minLength: 25,
        }),
      }),
    }
  )
  .use(cors()) 
  .use(rateLimit())
  .listen(3000);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
);
