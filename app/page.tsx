'use client';

import logo from '@/public/logo.jpg';
import { useEffect } from 'react';

const HomePage = () => {
  useEffect(() => {
    const canvas = document.getElementById('gradient-canvas') as HTMLCanvasElement | null;
    const ctx = canvas?.getContext('2d');

    if (!canvas || !ctx) return;

    // Medical-inspired calming tones
    const colors = ['#0ea5e9', '#06b6d4', '#2dd4bf', '#67e8f9']; // Sky, Cyan, Teal shades
    let particles: Particle[] = [];

    function resizeCanvas() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;

      constructor() {
        this.x = Math.random() * (canvas?.width ?? window.innerWidth);
        this.y = Math.random() * (canvas?.height ?? window.innerHeight);
        this.vx = (Math.random() - 0.5) * 0.2;
        this.vy = (Math.random() - 0.5) * 0.2;
        this.radius = Math.random() * 300 + 200; // softer gradients, bigger glow
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || (canvas?.width !== undefined && this.x > canvas.width)) this.vx *= -1;
        if (this.y < 0 || (canvas && this.y > canvas.height)) this.vy *= -1;
      }

      draw() {
        if (!ctx) return;
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
        gradient.addColorStop(0, this.color + '22'); // More subtle glow
        gradient.addColorStop(1, this.color + '00');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function initParticles() {
      resizeCanvas();
      particles = Array.from({ length: 6 }, () => new Particle());
    }

    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resizeCanvas);
    initParticles();
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <div className="relative antialiased min-h-screen overflow-hidden bg-[#0f172a] text-slate-100 font-sans">
      <canvas id="gradient-canvas" className="fixed top-0 left-0 w-full h-full -z-10"></canvas>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <main className="w-full max-w-2xl mx-auto">
          <header className="mb-10">
            <div className="mb-4">
              <img
                src={logo.src}
                alt="Simri company logo"
                className="inline-block rounded-full border-4 border-slate-700/50"
                width={150}
              />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">Simri</h1>
            <p className="mt-2 text-lg text-slate-300">AI-Powered MRI Similarity Search</p>
          </header>

          <section>
            <h2 className="text-2xl md:text-3xl font-semibold text-slate-100">
              A new clarity in diagnostics is coming soon.
            </h2>
            <p className="mt-4 text-base md:text-lg text-slate-300 max-w-xl mx-auto">
              We&apos;re developing the next generation of Simri — a powerful, intuitive platform designed to accelerate MRI
              analysis for clinicians and researchers. Our mission is to bridge the gap between scan and insight,
              enabling better healthcare outcomes.
            </p>
          </section>
        </main>

        <footer className="absolute bottom-6 w-full text-center">
          <p className="text-sm text-slate-500">&copy; 2025 Simri. A clearer future for medical imaging.</p>
        </footer>
      </div>
    </div>
  );
};

export default HomePage;
