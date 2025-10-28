import { PropsWithChildren, useEffect, useState } from 'react';

export default function HiddenContent({ children }: PropsWithChildren) {
    const [hidden, setHidden] = useState(true);

    useEffect(() => {
        // listen for Ctrl+Alt+D
        const handler = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.altKey && e.key === 'd') {
                setHidden(!hidden);
            }
        };

        window.addEventListener('keydown', handler);

        return () => window.removeEventListener('keydown', handler);
    });

    return (
        <div className={hidden ? 'hidden' : undefined}>
            {children}
        </div>
    );
}
