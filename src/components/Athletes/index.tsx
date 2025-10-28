import { Button, Image, Input, Popconfirm, Popover, Switch, Table, TableColumnsType, Tag, Tooltip, message } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import "dayjs/locale/ar-dz";
import { useMemo, useState } from 'react';
import { BiRefresh } from 'react-icons/bi';
import { FaEdit, FaPlusCircle, FaTrash } from 'react-icons/fa';
import { useMutation, useQuery } from 'react-query';
import { Athlete, deleteAthlete, fetchAthletes } from '../../api';
import { MAX_DAYS_TO_PAY, daysToPay } from '../../helpers';
import CreateAthlete from './components/CreateAthlete';
import EditAthlete from './components/EditAthlete';
import HiddenContent from './components/HiddenContent';
import Logs from './components/Logs';

interface AtheleteDetailed extends Athlete {
    daysToPay: number;
}

function PaymentDate({ date }: { date: Dayjs; }) {
    return <div className='flex gap-2 items-center justify-center'>
        <span>{date.locale("ar-dz").format('D MMMM YYYY')}</span>
    </div>;
}

function daysOrDayArabic(days: number) {
    if (days === 0)
        return 'يدفع اليوم';
    if (days === 1)
        return 'يوم واحد للدفع';
    if ((days % 100) <= 10 && (days % 100) > 1)
        return days + ' أيام للدفع';
    return days + ' يوم للدفع';

}

function PaymentStatus({ daysToPay }: { daysToPay: number; }) {
    const color = useMemo(() => {
        if (daysToPay <= 0) return 'red';
        if (daysToPay < MAX_DAYS_TO_PAY) return 'yellow';
        return 'green';
    }, [daysToPay]);

    return <div className='flex flex-col gap-2 items-center justify-center'>
        {daysToPay <= 0 && <Tag color='red'>
            انتهى
            {daysToPay < 0 && <>&nbsp;منذ {daysOrDayArabic(-daysToPay)}</>}
        </Tag>}
        <span className={`font-bold text-white`} style={{
            color
        }}>{daysOrDayArabic(Math.max(daysToPay, 0))}</span>
    </div>;
}

function Note({ value }: { value: string; }) {
    return value.length > 30 ? <Popover content={<span className='max-w-56 block'>{value}</span>}>
        {value.substring(0, 30)}...
    </Popover> : <span>{value}</span>;
}

export default function Athletes({ mode, setMode }: { mode: 'dark' | 'light', setMode: (mode: 'dark' | 'light') => void; }) {
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [logsOpen, setLogsOpen] = useState(false);
    const [athleteToEdit, setAthleteToEdit] = useState<Athlete | null>(null);

    const [searchText, setSearchText] = useState('');

    const { data, status, refetch } = useQuery({
        queryKey: 'athletes',
        queryFn: fetchAthletes
    });

    const { mutateAsync: deleteAthleteAsync } = useMutation({
        mutationFn: deleteAthlete,
        onSuccess() {
            refetch();
            message.success('تم حذف الرياضي بنجاح');
        }
    });

    const processedDatax = useMemo(() => data?.map(d => {
        const lastPaymentDate = dayjs(d.lastPaymentDate);
        return ({
            ...d,
            lastPaymentDate,
            daysToPay: daysToPay(lastPaymentDate, d.daysPaid)
        });
    }), [data]);

    const processedData = useMemo(() => processedDatax?.filter(a => a.name.includes(searchText)), [processedDatax, searchText]);

    return (
        <div className='flex flex-col items-center gap-5 h-[calc(100%-100px)] box-border'>
            <CreateAthlete
                onCancel={() => setCreateModalOpen(false)}
                onSuccess={() => {
                    refetch();
                    setCreateModalOpen(false);
                }} open={createModalOpen} />

            <EditAthlete
                athlete={athleteToEdit}
                onCancel={() => setAthleteToEdit(null)}
                onSuccess={() => {
                    refetch();
                    setAthleteToEdit(null);
                }} />

            <Logs open={logsOpen} onClose={() => setLogsOpen(false)} />

            <div className='flex gap-5 items-center justify-center'>
                <Tag className='text-lg'>اليوم: {dayjs().locale("ar-dz").format('D MMMM YYYY')}</Tag>
                <Tag className='text-lg'>{data?.length} شخص</Tag>


                <Tooltip title="إضافة شخص">
                    <Button onClick={() => setCreateModalOpen(true)} className='m-0 p-3' type='primary'>
                        <FaPlusCircle size={20} className='m-0 block p-0' />
                    </Button>
                </Tooltip>

                <Input
                    size='large'
                    placeholder='البحث بالإسم'
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className='w-1/3'
                    allowClear
                    onClear={() => setSearchText('')}
                />

                <HiddenContent>
                    <div className='flex gap-5 items-center'>
                        <Button onClick={() => setLogsOpen(true)}>Logs</Button>
                        <Tooltip title="تحديث">
                            <Button onClick={() => refetch()} className='m-0 p-5' type='primary'>
                                <BiRefresh size={30} className='m-0 block p-0' />
                            </Button>
                        </Tooltip>
                    </div>
                </HiddenContent>

                <Switch
                    checkedChildren="🌛"
                    unCheckedChildren="🔆"
                    onChange={() => setMode(mode === "light" ? "dark" : "light")}
                    defaultChecked={mode === "dark"} />
            </div>

            <div className='overflow-auto w-full grow'>
                <Table<AtheleteDetailed>
                    loading={status === 'loading'}
                    className='min-w-[1000px]'
                    rowKey='id'
                    sticky={{ offsetHeader: 0 }}
                    size='small'
                    pagination={false}
                    bordered
                    dataSource={processedData}
                    columns={[
                        {
                            key: 'name',
                            dataIndex: 'name',
                            title: 'الإسم'
                        },
                        {
                            key: 'lastPaymentDate',
                            className: '!text-center',
                            dataIndex: 'lastPaymentDate',
                            title: 'من',
                            render: (date: Dayjs) => <PaymentDate date={date} />
                        },
                        {
                            className: '!text-center',
                            key: 'lastPaymentDate',
                            dataIndex: 'lastPaymentDate',
                            title: 'إلى',
                            render: (date: Dayjs, r) => <span>
                                <span>{date.locale("ar-dz").add(30, 'day').format('D MMMM YYYY')}</span>
                                {r.daysPaid !== undefined && r.daysPaid !== 30 && <span className='text-green-500 font-bold'> (دفع {r.daysPaid})</span>}
                            </span>
                        },
                        {
                            key: 'daysToPay',
                            className: '!text-center',
                            dataIndex: 'daysToPay',
                            title: 'الحالة',
                            width: 300,
                            render: (daysToPay: number) => <PaymentStatus daysToPay={daysToPay} />,
                            sorter: (a, b) => a.daysToPay - b.daysToPay,
                            defaultSortOrder: 'ascend'
                        },
                        {
                            key: 'note',
                            dataIndex: 'note',
                            title: 'ملاحضة',
                            className: '!text-center w-36',
                            render: v => !!v ? <Note value={v} /> : <span className='text-red-500'>-</span>
                        },
                        {
                            key: 'phone',
                            dataIndex: 'phone',
                            className: '!text-center',
                            render: (v: string | undefined) => <span className='ltr'>{!!v ? v.replace(/\s+/g, '-') : '-'}</span>,
                            title: 'رقم الهاتف'
                        },
                        {
                            key: 'avatar',
                            dataIndex: 'avatar',
                            title: 'الصورة',
                            className: '!text-center',
                            width: 120,
                            render: (avatar: string) => avatar ? <Image src={avatar} alt='avatar' width={100} height={100} /> : '-'
                        },
                        {
                            key: 'actions',
                            width: 150,
                            className: '!text-center',
                            title: 'العمليات',
                            render: (_v, r) => <div>
                                <Button size="small" onClick={() => setAthleteToEdit(r)} type='link'><FaEdit size={25} /></Button>
                                <Popconfirm title="هل أنت متأكد؟" onConfirm={() => deleteAthleteAsync(r.id)}>
                                    <Button size="small" type='link'><FaTrash color='red' size={25} /></Button>
                                </Popconfirm>
                            </div>
                        }
                    ] as TableColumnsType<AtheleteDetailed>}
                />
            </div>
        </div>
    );
}
