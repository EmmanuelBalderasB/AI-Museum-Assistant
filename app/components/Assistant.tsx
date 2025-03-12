// components/Assistant.tsx
"use client";
import React, { useState } from "react";

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
    <div className="max-w-md mx-auto p-4 flex flex-row justify-evenly items-center">
      <div className="flex flex-col justify-center items-center">
        <h2 className="text-2xl font-bold text-center mb-4">
          Asistente Interactivo Museo
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File input accepts images and uses the camera on mobile devices */}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
                     file:mr-4 file:py-2 file:px-4
                     file:rounded-full file:border-0
                     file:text-sm file:font-semibold
                     file:bg-blue-50 file:text-blue-700
                     hover:file:bg-blue-100"
          />
          {/* Display a preview if available */}
          {previewUrl && (
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
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
          >
            {loading ? "Naming..." : "Name Artwork"}
          </button>
        </form>
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
