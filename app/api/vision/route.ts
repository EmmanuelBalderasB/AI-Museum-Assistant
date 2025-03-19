// app/api/vision/route.ts
import { NextResponse } from "next/server";
import { ElevenLabsClient, play } from "elevenlabs";

const grokApiKey = process.env.GROK_API_KEY;
const elevenLabsClient = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});
const voiceId = "e5WNhrdI30aXpS2RSGm1";
export async function POST(request: Request) {
  console.log("Request received");
  try {
    const { imageUrl } = await request.json();
    console.log("Image URL received");

    if (!imageUrl) {
      console.log("Missing imageUrl in request body");
      return NextResponse.json(
        { error: "Missing imageUrl in request body" },
        { status: 400 }
      );
    }

    const payload = {
      model: "llama-3.2-90b-vision-preview", // or "llama-3.2-11b-vision-preview"
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              // text:
              text: "You are a helpful assistant specialized in art and museums. Give information about the artwork an/or their questions, the artist, the medium, the year, the name, and if applicable, the museum where it is located. Do not respond with anything other than the description. If the image is not of an artwork, respond with 'I'm sorry but i don't recognize this image.' Keep it short and concise.",
            },
          ],
        },
        {
          role: "user",
          content: [{ type: "image_url", image_url: { url: imageUrl } }],
        },
      ],
      temperature: 0,
      max_completion_tokens: 1024,
      top_p: 1,
      stream: false,
    };

    const groqResponse = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${grokApiKey}`,
        },
        body: JSON.stringify(payload),
      }
    );

    if (!groqResponse.ok) {
      const errorDetails = await groqResponse.json();
      return NextResponse.json(
        { error: "Groq API error", details: errorDetails },
        { status: groqResponse.status }
      );
    }

    const data = await groqResponse.json();
    console.log("Groq response:", data);

    const messageContent = data.choices?.[0]?.message?.content;
    if (!messageContent) {
      console.log("Message structure:", data.choices?.[0]?.message);
      return NextResponse.json(
        { error: "No response content from Groq" },
        { status: 422 }
      );
    }

    const elevenLabsResponse = await elevenLabsClient.textToSpeech.convert(
      voiceId,
      {
        output_format: "mp3_44100_128",
        model_id: "eleven_multilingual_v2",
        text: messageContent,
      }
    );

    // Convert stream to buffer
    const chunks = [];
    for await (const chunk of elevenLabsResponse) {
      chunks.push(chunk);
    }
    const audioBuffer = Buffer.concat(chunks);
    const base64Audio = audioBuffer.toString("base64");

    return NextResponse.json(
      {
        message: messageContent,
        audio: `data:audio/mpeg;base64,${base64Audio}`,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error calling Groq API:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
