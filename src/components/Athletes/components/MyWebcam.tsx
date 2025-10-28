import { Button, Image } from 'antd';
import { useRef, useCallback, useState } from 'react';
import Webcam from 'react-webcam';

export default function MyWebcam({ value, onChange }: { value?: string, onChange?: (value: string) => void; }) {
    const webcamRef = useRef<Webcam>(null);

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc && onChange) {
            onChange(imageSrc);
        }
    }, [webcamRef]);

    const [iswebCamOpened, setIswebCamOpened] = useState(false);

    return (
        <div className='flex gap-2'>
            {value && <Image src={value} alt='avatar' width={100} height={100} />}
            {iswebCamOpened && <Webcam ref={webcamRef} width={600} className='border-violet-400 border-solid rounded-lg' />}
            <Button onClick={() => {
                if (!iswebCamOpened)
                    setIswebCamOpened(true);
                else
                    capture();
            }}>أخذ صورة</Button>
        </div>
    );
}
