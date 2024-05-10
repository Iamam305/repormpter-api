import { ChatAnthropic } from "@langchain/anthropic";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { PromptTemplate } from "@langchain/core/prompts";
export const generate_prompt = async (input: string) => {
  try {
    const model = new ChatAnthropic({
      temperature: 0.9,
      model: "claude-3-haiku-20240307",
      // In Node.js defaults to ,
      apiKey: process.env.ANTHROPIC_API_KEY,
      maxTokens: 200,
    });
    const prompt = PromptTemplate.fromTemplate(`
    You will be provided with an original prompt text and a set of instructions for improving that prompt. Your task is to revise the original prompt based on the improvement instructions while preserving the core intent of the prompt as much as possible.

    Here is the original prompt text:
    <prompt>
    {prompt}
    </prompt>



    Please read both the original prompt and the improvement instructions carefully to fully understand them. Then, revise the original prompt to address the instructions as best you can. 

    Provide your revised and improved version of the prompt inside <revised_prompt> </revised_prompt>  tags. Format the revised prompt as a template, using placeholders (like {{placeholder}}) where additional user-provided information will need to be inserted. The placeholders should flow naturally as part of the prompt.

    Remember, your goal is to modify the original prompt based on the improvement instructions, not to actually follow or complete the original prompt itself. Focus on revising the prompt while maintaining its core purpose.

    And here are the instructions for improving the prompt:
    <instructions>
    {instructions} 
    </instructions>`);

    const loader = new TextLoader("src/documents/instruction.txt");

    const docs = await loader.load();
    const parser = new StringOutputParser();
    const chain = prompt.pipe(model).pipe(parser);

    const data = await chain.invoke({
      prompt: input,
      instructions: docs[0].pageContent,
    });
    console.log(data);

    return data;
  } catch (error) {
    throw new Error("Failed to generate prompt: " + error);
  }
};
