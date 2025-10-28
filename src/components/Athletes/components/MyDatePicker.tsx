import { Button, DatePicker } from 'antd';
import dayjs from 'dayjs';
import { useState } from 'react';
import "dayjs/locale/ar-dz";

export default function MyDatePicker({ value, onChange, extra }: { value?: string; onChange?: (date: string) => void; extra?: any; }) {
    const [initialValue, _setInitialValue] = useState(value);

    return (
        <div className='flex gap-2'>
            <DatePicker
                disabledDate={d => dayjs() < d}
                value={value && dayjs(value)}
                onChange={(_v, v) => onChange?.(v as string)}
                popupClassName='[&>div>div>div>div>div]:!w-[500px]' />
            <Button type='primary' ghost onClick={() => initialValue && onChange?.(initialValue)}>استعادة القيمة الأصلية</Button>
            <Button type='primary' onClick={() => onChange?.(dayjs().toString())}>اليوم</Button>
            <Button type='primary' danger onClick={() => value && onChange?.(dayjs(value).add(30, 'day').toString())}>إضافة شهر</Button>
            {extra}
        </div>
    );
}
