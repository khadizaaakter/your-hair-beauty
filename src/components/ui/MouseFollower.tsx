import { useEffect, useRef } from 'react';

interface MouseFollowerProps {
    containerRef: React.RefObject<HTMLElement | null>;
}

export function MouseFollower({ containerRef }: MouseFollowerProps) {
    const followerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        const follower = followerRef.current;

        if (!container || !follower) return;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = container.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Update CSS custom properties for the gradient
            container.style.setProperty('--mouse-x', `${x}px`);
            container.style.setProperty('--mouse-y', `${y}px`);

            // Move the follower element
            follower.style.transform = `translate(${x - 300}px, ${y - 300}px)`;
        };

        const handleMouseLeave = () => {
            follower.style.opacity = '0';
        };

        const handleMouseEnter = () => {
            follower.style.opacity = '1';
        };

        container.addEventListener('mousemove', handleMouseMove);
        container.addEventListener('mouseleave', handleMouseLeave);
        container.addEventListener('mouseenter', handleMouseEnter);

        return () => {
            container.removeEventListener('mousemove', handleMouseMove);
            container.removeEventListener('mouseleave', handleMouseLeave);
            container.removeEventListener('mouseenter', handleMouseEnter);
        };
    }, [containerRef]);

    return (
        <div
            ref={followerRef}
            className="pointer-events-none absolute w-[600px] h-[600px] rounded-full opacity-0 transition-opacity duration-300"
            style={{
                background: 'radial-gradient(circle, rgba(255, 20, 147, 0.15) 0%, rgba(255, 20, 147, 0.05) 40%, transparent 70%)',
                filter: 'blur(40px)',
            }}
        />
    );
}

export default MouseFollower;
