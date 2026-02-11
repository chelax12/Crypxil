
import React, { useEffect, useRef } from 'react';

const BackgroundEffect: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let nodes: Node[] = [];
    let particles: Particle[] = [];
    const mouse = { x: 0, y: 0, radius: 120 };

    const getNodeCount = () => {
      const area = window.innerWidth * window.innerHeight;
      return Math.min(Math.max(Math.floor(area / 15000), 40), 100);
    };

    class Node {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;
        this.size = Math.random() * 2 + 1;
        this.color = '#00f0ff'; // Bright cyan for a futuristic look
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Mouse interaction
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          this.x -= (dx / dist) * force * 0.5;
          this.y -= (dy / dist) * force * 0.5;
        }

        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fill();
      }
    }
    
    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      
      constructor(source: Node, target: Node) {
        this.x = source.x;
        this.y = source.y;
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const speed = Math.random() * 1.5 + 0.5;
        this.vx = (dx / dist) * speed;
        this.vy = (dy / dist) * speed;
        this.life = Math.random() * 100 + 50;
      }
      
      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
      }
      
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, 0.8, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fill();
      }
    }

    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      nodes = [];
      particles = [];
      const count = getNodeCount();
      for (let i = 0; i < count; i++) {
        nodes.push(new Node());
      }
    };

    const animate = () => {
      ctx.fillStyle = 'rgba(5, 7, 10, 0.8)'; // Slow fade effect
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.shadowBlur = 0; // Reset shadowBlur for performance

      // Draw connections and spawn particles
      const connectionDistance = 200;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            const opacity = 1 - dist / connectionDistance;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(0, 240, 255, ${opacity * 0.1})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
            
            // Spawn data particles
            if (Math.random() < 0.001) {
                particles.push(new Particle(nodes[i], nodes[j]));
            }
          }
        }
      }
      
      // Update and draw nodes
      nodes.forEach(n => {
        n.update();
        n.draw();
      });
      
      // Update and draw particles
      particles = particles.filter(p => p.life > 0);
      particles.forEach(p => {
        p.update();
        p.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    const handleResize = () => init();
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    init();
    animate();
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: -1, background: '#05070a' }}
    />
  );
};

export default BackgroundEffect;
