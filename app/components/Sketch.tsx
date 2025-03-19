"use client";

import React, { useEffect, useRef, useState } from "react";
// We'll dynamically import p5 on the client side only

interface VoiceAssistantVisualizationProps {
  width?: number;
  height?: number;
  speaking?: boolean;
}

const VoiceAssistantVisualization: React.FC<
  VoiceAssistantVisualizationProps
> = ({ width = 400, height = 400, speaking = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sketchRef = useRef<any>(null);
  const speakingRef = useRef<boolean>(speaking);
  const [p5Loaded, setP5Loaded] = useState(false);

  // Update ref when prop changes
  useEffect(() => {
    speakingRef.current = speaking;
  }, [speaking]);

  // First, load p5 dynamically on client side only
  useEffect(() => {
    let mounted = true;

    const loadP5 = async () => {
      try {
        // Dynamically import p5 only on client-side
        const p5Module = await import("p5");
        if (mounted) {
          setP5Loaded(true);
        }
      } catch (error) {
        console.error("Failed to load p5:", error);
      }
    };

    loadP5();

    return () => {
      mounted = false;
    };
  }, []);

  // Then create sketch when p5 is loaded
  useEffect(() => {
    if (!p5Loaded || !containerRef.current) return;

    const createSketch = async () => {
      // Import p5 again when creating the sketch
      const p5Module = await import("p5");
      const p5 = p5Module.default;

      // Define the P5 sketch
      const sketch = (p: any) => {
        // Configuration options
        const config = {
          // Color scheme (modern, subtle colors)
          colors: {
            background: "#000000",
            primaryCircle: "#4E6AFF",
            secondaryCircles: ["#6979F8", "#8BE9FD", "#A5D8FF"],
            idleColor: "#CED4DA",
          },
          // Animation parameters
          animation: {
            baseRadius: 120,
            minRadius: 100,
            maxRadius: 150,
            breatheSpeed: 0.02,
            particleCount: 6,
            particleMaxRadius: 8,
            particleMinRadius: 3,
            particleSpeed: 0.03,
          },
        };

        // State variables
        let angle = 0;
        let breathe = 0;
        let particles: Array<{
          angle: number;
          radius: number;
          distance: number;
          speed: number;
        }> = [];
        let radius = config.animation.baseRadius;
        let targetRadius = config.animation.baseRadius;
        let waveAmplitude = 0;
        let waveTargetAmplitude = 0;

        p.setup = () => {
          p.createCanvas(width, height);

          // Initialize particles
          for (let i = 0; i < config.animation.particleCount; i++) {
            particles.push({
              angle: p.random(p.TWO_PI),
              radius: p.random(
                config.animation.particleMinRadius,
                config.animation.particleMaxRadius
              ),
              distance: p.random(
                config.animation.baseRadius * 0.5,
                config.animation.baseRadius * 0.8
              ),
              speed: p.random(0.02, 0.04),
            });
          }
        };

        p.draw = () => {
          // Check speaking state from ref
          const isSpeaking = speakingRef.current;

          // Set background
          p.background(config.colors.background);
          p.translate(p.width / 2, p.height / 2);

          // Update animation state
          updateAnimationState(isSpeaking);

          // Draw main circle with wave effect when speaking
          drawMainCircle(isSpeaking);

          // Draw orbiting particles
          drawParticles(isSpeaking);
        };

        // Update all animation parameters each frame
        const updateAnimationState = (isSpeaking: boolean) => {
          // Smooth breathing animation when idle
          breathe += config.animation.breatheSpeed;
          if (!isSpeaking) {
            let breatheOffset = p.sin(breathe) * 10;
            targetRadius = config.animation.baseRadius + breatheOffset;
          } else {
            targetRadius = config.animation.maxRadius;
            waveTargetAmplitude = 12;
          }

          if (!isSpeaking) {
            waveTargetAmplitude = 0;
          }

          // Smooth transitions for radius and wave amplitude
          radius = p.lerp(radius, targetRadius, 0.1);
          waveAmplitude = p.lerp(waveAmplitude, waveTargetAmplitude, 0.1);

          // Update particle positions
          angle += 0.01;
          for (let particle of particles) {
            particle.angle += particle.speed;
          }
        };

        // Draw the main central circle with wave effect
        const drawMainCircle = (isSpeaking: boolean) => {
          p.noFill();
          p.strokeWeight(2);

          if (isSpeaking) {
            // When speaking: draw wave effect
            p.beginShape();
            for (let a = 0; a < p.TWO_PI; a += 0.1) {
              // Create wavy effect when speaking
              let xoff = p.map(p.cos(a), -1, 1, 0, 3);
              let yoff = p.map(p.sin(a), -1, 1, 0, 3);
              let noise = p.map(
                p.noise(xoff, yoff, p.frameCount * 0.05),
                0,
                1,
                -waveAmplitude,
                waveAmplitude
              );

              let r = radius + noise;
              let x = r * p.cos(a);
              let y = r * p.sin(a);

              p.stroke(config.colors.primaryCircle);
              p.vertex(x, y);
            }
            p.endShape(p.CLOSE);

            // Add subtle glow effect if possible
            try {
              (p.drawingContext as CanvasRenderingContext2D).shadowBlur = 20;
              (p.drawingContext as CanvasRenderingContext2D).shadowColor =
                config.colors.primaryCircle + "80";
            } catch (e) {
              // Ignore if not supported
            }
          } else {
            // When idle: draw simple circle with breathing animation
            p.stroke(config.colors.idleColor);
            p.circle(0, 0, radius * 2);
          }

          // Reset shadow effect
          try {
            (p.drawingContext as CanvasRenderingContext2D).shadowBlur = 0;
          } catch (e) {
            // Ignore if not supported
          }
        };

        // Draw orbiting particles around the main circle
        const drawParticles = (isSpeaking: boolean) => {
          p.noStroke();

          for (let i = 0; i < particles.length; i++) {
            const particle = particles[i];
            const x = particle.distance * p.cos(particle.angle);
            const y = particle.distance * p.sin(particle.angle);

            // Use different colors for particles
            const particleColor = isSpeaking
              ? config.colors.secondaryCircles[
                  i % config.colors.secondaryCircles.length
                ]
              : config.colors.idleColor;

            p.fill(particleColor);

            // Subtle pulsing effect for particles
            const pulseSize = isSpeaking
              ? particle.radius + p.sin(p.frameCount * 0.05 + i) * 2
              : particle.radius;

            p.circle(x, y, pulseSize * 2);
          }
        };

        p.windowResized = () => {
          p.resizeCanvas(width, height);
        };
      };
      // Create new P5 instance
      if (containerRef.current) {
        sketchRef.current = new p5(sketch, containerRef.current);
      }
    };

    createSketch();

    // Cleanup function
    return () => {
      if (sketchRef.current) {
        sketchRef.current.remove();
      }
    };
  }, [p5Loaded, width, height]); // Re-initialize if dimensions change or p5 loads

  return <div ref={containerRef} style={{ width, height }} />;
};

export default VoiceAssistantVisualization;
