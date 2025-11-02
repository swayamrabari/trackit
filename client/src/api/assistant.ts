import api from "./index";
import { executeFunction, FunctionResult } from "@/utils/functionExecutor";

export interface AssistantResponse {
  type: "text" | "function_call";
  response?: string;
  functionName?: string;
  parameters?: Record<string, any>;
  message?: string;
  error?: string;
}

export const sendMessage = async (
  message: string,
  functionResults?: Array<{ functionName: string; parameters: Record<string, any>; result: FunctionResult }>,
  conversationHistory?: Array<{ role: string; content: string }>,
): Promise<AssistantResponse> => {
  try {
    const response = await api.post("/assistant", {
      prompt: message,
      functionResults,
      conversationHistory,
    });

    // Log the raw API response
    console.log('API Response Data:', response.data);
    console.log('Response data.response field:', response.data?.response);

    return response.data;
  } catch (error: any) {
    console.error('Error sending message to assistant:', error);
    console.error('Error response:', error?.response?.data);
    console.error('Error status:', error?.response?.status);
    
    // Return a more detailed error message
    const errorMessage = error?.response?.data?.message 
      || error?.response?.data?.error 
      || error?.message 
      || "Something went wrong. Please check if the server is running and your OpenAI API key is configured.";
    
    return {
      type: "text",
      error: errorMessage,
    };
  }
};

export const executeFunctionCall = async (
  functionName: string,
  parameters: Record<string, any>,
): Promise<FunctionResult> => {
  return await executeFunction(functionName, parameters);
};

export const getFunctionCatalog = async () => {
  try {
    const response = await api.get("/assistant/functions");
    return response.data;
  } catch (error) {
    return {
      error:
        (error as any)?.response?.data?.message ||
        "Failed to get function catalog",
    };
  }
};
