// components/Assistant.tsx
"use client";
import React, { useState } from "react";
import AssistantVisualization from "./AssistantVisualization";

const Assistant: React.FC = () => {
  const [imageData, setImageData] = useState<string>("");
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  // Convert the selected file to a base64 string
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      setResult("");
      // Set a preview URL for the selected image
      setPreviewUrl(URL.createObjectURL(file));

      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setImageData(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    if (!imageData) return;
    setLoading(true);
    setResult("");

    try {
      const response = await fetch("/api/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: imageData }),
      });
      const data = await response.json();
      if (data.message) {
        console.log("Image name:", data.message);
      }
      setResult(data.message || "No result");
      if (data.audio) {
        const audio = new Audio(data.audio);
        await audio.play();
      }
    } catch (error) {
      console.error("Error calling API:", error);
      setResult("An error occurred.");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto p-4 flex flex-col justify-evenly items-center h-screen w-screen">
      <div className="flex flex-col justify-center items-center bg-white rounded-lg px-4 py-8">
        <h2 className="text-2xl font-bold text-center mb-4 text-black">
          Asistente Interactivo Museo
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File input accepts images and uses the camera on mobile devices */}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-black
                     file:mr-4 file:py-2 file:px-4
                     file:rounded-full
                     file:text-sm file:font-semibold
                     file:bg-white file:text-black file:border-2 file:border-black
                     hover:file:bg-black hover:file:text-white hover:file:border-white transition"
          />
          {/* Display a preview if available */}
          {previewUrl && !result && (
            <div className="mb-4">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full rounded-lg shadow-md"
              />
            </div>
          )}
          <button
            type="submit"
            disabled={loading || !imageData}
            className="w-full bg-white text-black py-2 px-4 rounded-lg border-2 border-black hover:bg-black hover:text-white hover:border-2 hover:border-white transition"
          >
            {loading ? "Cargando..." : "Obtener Ficha"}
          </button>
        </form>
        <AssistantVisualization />
      </div>

      {result && (
        <div className="mt-6 p-4 bg-gray-100 rounded-lg shadow">
          <strong className="block mb-2">Descripcion:</strong>
          <p>{result}</p>
        </div>
      )}
    </div>
  );
};

export default Assistant;
