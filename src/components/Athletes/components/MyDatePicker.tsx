import { Button, DatePicker } from 'antd';
import dayjs from 'dayjs';
import { useState, useEffect } from 'react';
import "dayjs/locale/ar-dz";

export default function MyDatePicker({ value, onChange, daysPaid, extra }: { value?: string; onChange?: (date: string) => void; daysPaid?: number; extra?: any; }) {
    const [initialValue, setInitialValue] = useState(value);

    useEffect(() => {
        if (value && !initialValue) {
            setInitialValue(value);
        }
    }, [value, initialValue]);

    return (
        <div className='flex flex-col gap-2 w-full'>
            <DatePicker
                disabledDate={d => d.isAfter(dayjs(), 'day')}
                value={value ? dayjs(value) : null}
                onChange={(_v, dateString) => onChange?.(dateString as string)}
                popupClassName='[&>div>div>div>div>div]:!w-[500px]'
                className="w-full"
            />
            <div className="flex gap-2 flex-wrap items-center">
                {initialValue && value !== initialValue && (
                    <Button 
                        size="small" 
                        type="dashed" 
                        onClick={() => onChange?.(initialValue)}
                    >
                        استعادة القيمة الأصلية
                    </Button>
                )}
                <Button 
                    size="small" 
                    onClick={() => onChange?.(dayjs().format('YYYY-MM-DD'))}
                >
                    اليوم
                </Button>
                <Button 
                    size="small" 
                    type="primary" 
                    danger 
                    onClick={() => onChange?.(dayjs(value || undefined).add(daysPaid ?? 30, 'day').format('YYYY-MM-DD'))}
                >
                    تجديد ({daysPaid ?? 30} يوم)
                </Button>
                {extra}
            </div>
        </div>
    );
}
