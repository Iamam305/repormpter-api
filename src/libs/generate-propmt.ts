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
    Please read the given original prompt text carefully to fully understand its intent and content. Then review the instructions for improving the prompt in detail.

    Here is the original prompt text:
    <prompt>
    {prompt}
    </prompt>
    Provide your revised and improved version of the original prompt inside <revised_prompt></revised_prompt> tags. The revised prompt should aim to fully address the instructions for improvement while preserving the core intent of the original prompt as much as possible. 

    Remember, your task is to modify the original prompt based on the improvement instructions, not to actually follow or complete the original prompt itself.

    Here are the instructions for improving the prompt:
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
    
 
      

    return data;
  } catch (error) {
    throw new Error("Failed to generate prompt: " + error);
  }
};
