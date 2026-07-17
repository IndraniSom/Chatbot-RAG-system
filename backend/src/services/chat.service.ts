export class ChatService {
  async chat(message: string) {
    // Simulate an AI delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    return {
      reply: `You said: "${message}". This is a dummy AI response from the backend.`,
    };
  }
}

export default new ChatService();