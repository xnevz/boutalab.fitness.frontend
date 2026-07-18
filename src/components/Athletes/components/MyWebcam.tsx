import { Button, Image } from 'antd';
import { useRef, useCallback, useState } from 'react';
import Webcam from 'react-webcam';
import { FaCamera, FaUser, FaTrash } from 'react-icons/fa';

export default function MyWebcam({ value, onChange }: { value?: string, onChange?: (value: string) => void; }) {
    const webcamRef = useRef<Webcam>(null);
    const [iswebCamOpened, setIswebCamOpened] = useState(false);

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc && onChange) {
            onChange(imageSrc);
            setIswebCamOpened(false);
        }
    }, [webcamRef, onChange]);

    const imageUrl = value 
        ? (value.startsWith('/avatars/') || value.startsWith('avatars/')
            ? `http://localhost:8048${value.startsWith('/') ? '' : '/'}${value}` 
            : value) 
        : '';

    return (
        <div className="flex flex-col items-center gap-3">
            <div className="w-[200px] h-[200px] rounded-2xl overflow-hidden border-2 border-solid border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center justify-center relative shadow-inner">
                {iswebCamOpened ? (
                    <Webcam
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        videoConstraints={{ width: 480, height: 480, aspectRatio: 1 }}
                        className="w-full h-full object-cover"
                    />
                ) : value ? (
                    <Image
                        src={imageUrl}
                        alt="avatar"
                        preview={true}
                        className="w-full h-full object-cover"
                        style={{ width: '200px', height: '200px', objectFit: 'cover' }}
                    />
                ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-400 dark:text-gray-500">
                        <FaUser size={48} className="opacity-50" />
                        <span className="text-xs">لا توجد صورة</span>
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-2 w-full">
                {iswebCamOpened ? (
                    <div className="flex gap-2 w-full justify-center">
                        <Button type="primary" onClick={capture} className="flex-1">
                            التقاط
                        </Button>
                        <Button danger onClick={() => setIswebCamOpened(false)} className="flex-1">
                            إلغاء
                        </Button>
                    </div>
                ) : (
                    <div className="flex gap-2 w-full justify-center">
                        <Button 
                            type="primary" 
                            ghost={!!value} 
                            onClick={() => setIswebCamOpened(true)} 
                            className="flex-1 flex items-center justify-center gap-1"
                        >
                            <FaCamera size={14} />
                            {value ? 'تغيير الصورة' : 'أخذ صورة'}
                        </Button>
                        {value && (
                            <Button 
                                danger 
                                ghost 
                                onClick={() => onChange?.('')} 
                                className="flex items-center justify-center"
                                title="حذف الصورة"
                            >
                                <FaTrash size={14} />
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
