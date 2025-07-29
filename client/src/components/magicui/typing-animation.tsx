"use client";

import { cn } from "@/utils/utils";
import { motion, MotionProps } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface TypingAnimationProps extends MotionProps {
  children: string;
  className?: string;
  duration?: number;
  delay?: number;
  as?: React.ElementType;
  startOnView?: boolean;
  repeat?: boolean;
  showCursor?: boolean;
  allowHTML?: boolean;
}

export function TypingAnimation({
  children,
  className,
  duration = 100,
  delay = 0,
  as: Component = "div",
  startOnView = false,
  repeat = false,
  showCursor = true,
  allowHTML = false,
  ...props
}: TypingAnimationProps) {
  const MotionComponent = motion(Component);

  const [displayedText, setDisplayedText] = useState<string>("");
  const [started, setStarted] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!startOnView) {
      const startTimeout = setTimeout(() => {
        setStarted(true);
      }, delay);
      return () => clearTimeout(startTimeout);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setStarted(true);
          }, delay);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [delay, startOnView]);

  useEffect(() => {
    if (!started) return;

    const runTypingAnimation = () => {
      setIsTyping(true);
      let i = 0;
      const typingEffect = setInterval(() => {
        if (i < children.length) {
          setDisplayedText(children.substring(0, i + 1));
          i++;
        } else {
          clearInterval(typingEffect);
          setIsTyping(false);
          
          if (repeat) {
            setTimeout(() => {
              setDisplayedText("");
              setTimeout(runTypingAnimation, 500);
            }, 2000);
          }
        }
      }, duration);

      return () => {
        clearInterval(typingEffect);
      };
    };

    const cleanup = runTypingAnimation();
    return cleanup;
  }, [children, duration, started, repeat]);

  return (
    <MotionComponent
      ref={elementRef}
      className={cn(
        "text-4xl font-bold leading-[5rem] tracking-[-0.02em]",
        className,
      )}
      {...props}
    >
      {allowHTML ? (
        <span dangerouslySetInnerHTML={{ __html: displayedText }} />
      ) : (
        displayedText
      )}
      {showCursor && (
        <span className={cn(
          "animate-pulse",
          isTyping || repeat ? "opacity-100" : "opacity-0"
        )}>
          |
        </span>
      )}
    </MotionComponent>
  );
}