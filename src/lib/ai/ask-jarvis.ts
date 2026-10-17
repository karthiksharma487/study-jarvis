import { createServerFn } from "@tanstack/react-start";

export const askJarvis = createServerFn({ method: "POST" })
  .validator((input: { question: string; snapshot: string }) => input)
  .handler(async ({ data }) => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false as const, error: "AI is not available in this environment." };

    const question = data.question.trim().slice(0, 2000);
    const snapshot = data.snapshot.slice(0, 12000);
    if (!question) return { ok: false as const, error: "Ask a question first." };

    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-4.5",
        max_tokens: 700,
        temperature: 0.3,
        messages: [
          {
            role: "system",
            content:
              "You are Study Jarvis, the student's academic operating system. Answer only from the provided database snapshot. Be concise, specific, and calm. Never invent deadlines, scores, chapter names, or progress. If data is missing, say so and suggest what to log. Prefer a single next action when asked what to study. Use short paragraphs or tight lists. Do not use emoji.",
          },
          {
            role: "user",
            content: `Academic snapshot:\n${snapshot}\n\nQuestion:\n${question}`,
          },
        ],
      }),
    });

    if (!res.ok) {
      return { ok: false as const, error: `Jarvis could not reach the model (${res.status}).` };
    }
    const body = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = body.choices?.[0]?.message?.content?.trim() ?? "";
    if (!text) return { ok: false as const, error: "Jarvis returned an empty reply." };
    return { ok: true as const, text };
  });
