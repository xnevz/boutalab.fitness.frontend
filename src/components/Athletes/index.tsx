import { Button, Image, Input, Popconfirm, Popover, Switch, Table, TableColumnsType, Tag, Tooltip, message } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import "dayjs/locale/ar-dz";
import { useMemo, useState } from 'react';
import { BiRefresh } from 'react-icons/bi';
import { FaEdit, FaPlusCircle, FaTrash, FaUsers, FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaCalendarPlus } from 'react-icons/fa';
import { useMutation, useQuery } from 'react-query';
import { Athlete, deleteAthlete, fetchAthletes, updateAthlete } from '../../api';
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
        return 'يوم واحد';
    if (days === 2)
        return 'يومان';
    if ((days % 100) <= 10 && (days % 100) > 1)
        return days + ' أيام';
    return days + ' يوم';
}

function PaymentStatus({ daysToPay }: { daysToPay: number; }) {
    const color = useMemo(() => {
        if (daysToPay <= 0) return '#ff4d4f';
        if (daysToPay < MAX_DAYS_TO_PAY) return '#faad14';
        return '#52c41a';
    }, [daysToPay]);

    return <div className='flex flex-col gap-1 items-center justify-center'>
        {daysToPay <= 0 ? (
            <Tag color='error' className='m-0 font-bold px-2 py-1 text-sm'>
                انتهى {daysToPay < 0 ? `منذ ${daysOrDayArabic(-daysToPay)}` : 'اليوم'}
            </Tag>
        ) : (
            <span className='font-bold text-lg' style={{ color }}>
                {daysOrDayArabic(daysToPay)} للدفع
            </span>
        )}
    </div>;
}

function Note({ value }: { value: string; }) {
    return value.length > 30 ? <Popover content={<span className='max-w-56 block'>{value}</span>}>
        {value.substring(0, 30)}...
    </Popover> : <span>{value}</span>;
}

// Arabic text normalization helper to standardize search behavior
function normalizeArabic(text: string): string {
    return text
        .replace(/[أإآا]/g, 'ا')
        .replace(/ة/g, 'ه')
        .replace(/ى/g, 'ي')
        .replace(/ئ/g, 'ي')
        .replace(/ؤ/g, 'و')
        .replace(/[\u064B-\u065F]/g, '') // remove diacritics
        .toLowerCase();
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

    const { mutateAsync: updateAthleteAsync } = useMutation({
        mutationFn: updateAthlete,
        onSuccess() {
            refetch();
            message.success('تم تجديد الاشتراك بنجاح');
        },
        onError() {
            message.error('حدث خطأ أثناء تجديد الاشتراك');
        }
    });

    const handleAdd30Days = async (athlete: Athlete) => {
        try {
            const currentLastPaymentDate = dayjs(athlete.lastPaymentDate);
            const daysToAdd = athlete.daysPaid || 30;
            const newDate = currentLastPaymentDate.add(daysToAdd, 'day').format('YYYY-MM-DD');
            await updateAthleteAsync({
                ...athlete,
                lastPaymentDate: newDate as any
            });
        } catch (error) {
            console.error(error);
        }
    };

    const processedDatax = useMemo(() => data?.map(d => {
        const lastPaymentDate = dayjs(d.lastPaymentDate);
        return ({
            ...d,
            lastPaymentDate,
            daysToPay: daysToPay(lastPaymentDate, d.daysPaid)
        });
    }), [data]);

    const processedData = useMemo(() => {
        if (!processedDatax) return [];
        const normalizedSearch = normalizeArabic(searchText);
        return processedDatax.filter(a => 
            normalizeArabic(a.name).includes(normalizedSearch)
        );
    }, [processedDatax, searchText]);

    const stats = useMemo(() => {
        const total = processedDatax?.length || 0;
        const active = processedDatax?.filter(a => a.daysToPay > 0).length || 0;
        const expired = processedDatax?.filter(a => a.daysToPay <= 0).length || 0;
        const warning = processedDatax?.filter(a => a.daysToPay > 0 && a.daysToPay <= MAX_DAYS_TO_PAY).length || 0;
        return { total, active, expired, warning };
    }, [processedDatax]);

    return (
        <div className='flex flex-col items-center gap-5 h-full box-border w-full'>
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

            {/* Premium Stats Dashboard */}
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full px-2 mt-2'>
                <div className='bg-gradient-to-br from-blue-600/90 to-indigo-700/90 backdrop-blur-md p-5 rounded-2xl text-white shadow-lg flex justify-between items-center transition-all duration-300 hover:scale-[1.03] hover:shadow-indigo-500/20 border border-solid border-white/10'>
                    <div className='flex flex-col gap-1'>
                        <span className='text-xs opacity-75 font-medium'>إجمالي المشتركين</span>
                        <span className='text-3xl font-extrabold'>{stats.total} <span className='text-sm font-normal'>عضو</span></span>
                    </div>
                    <div className='bg-white/10 p-3 rounded-xl'>
                        <FaUsers size={28} className='text-white/90' />
                    </div>
                </div>
                <div className='bg-gradient-to-br from-emerald-500/90 to-teal-600/90 backdrop-blur-md p-5 rounded-2xl text-white shadow-lg flex justify-between items-center transition-all duration-300 hover:scale-[1.03] hover:shadow-teal-500/20 border border-solid border-white/10'>
                    <div className='flex flex-col gap-1'>
                        <span className='text-xs opacity-75 font-medium'>الاشتراكات النشطة</span>
                        <span className='text-3xl font-extrabold'>{stats.active} <span className='text-sm font-normal'>عضو</span></span>
                    </div>
                    <div className='bg-white/10 p-3 rounded-xl'>
                        <FaCheckCircle size={28} className='text-white/90' />
                    </div>
                </div>
                <div className='bg-gradient-to-br from-amber-500/90 to-orange-600/90 backdrop-blur-md p-5 rounded-2xl text-white shadow-lg flex justify-between items-center transition-all duration-300 hover:scale-[1.03] hover:shadow-orange-500/20 border border-solid border-white/10'>
                    <div className='flex flex-col gap-1'>
                        <span className='text-xs opacity-75 font-medium'>اشتراكات قريبة الانتهاء</span>
                        <span className='text-3xl font-extrabold'>{stats.warning} <span className='text-sm font-normal'>عضو</span></span>
                    </div>
                    <div className='bg-white/10 p-3 rounded-xl'>
                        <FaExclamationTriangle size={28} className='text-white/90' />
                    </div>
                </div>
                <div className='bg-gradient-to-br from-rose-500/90 to-red-600/90 backdrop-blur-md p-5 rounded-2xl text-white shadow-lg flex justify-between items-center transition-all duration-300 hover:scale-[1.03] hover:shadow-red-500/20 border border-solid border-white/10'>
                    <div className='flex flex-col gap-1'>
                        <span className='text-xs opacity-75 font-medium'>الاشتراكات المنتهية</span>
                        <span className='text-3xl font-extrabold'>{stats.expired} <span className='text-sm font-normal'>عضو</span></span>
                    </div>
                    <div className='bg-white/10 p-3 rounded-xl'>
                        <FaTimesCircle size={28} className='text-white/90' />
                    </div>
                </div>
            </div>

            <div className='flex gap-5 items-center justify-center w-full mt-2'>
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

            <div className='overflow-auto w-full grow mt-2'>
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
                                <span>{date.locale("ar-dz").add(r.daysPaid ?? 30, 'day').format('D MMMM YYYY')}</span>
                                {r.daysPaid !== undefined && r.daysPaid !== 30 && <span className='text-green-500 font-bold'> (دفع {r.daysPaid} يوم)</span>}
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
                            render: (avatar: string) => avatar ? <Image src={avatar.startsWith('/avatars/') ? `http://localhost:8048${avatar}` : avatar} alt='avatar' width={100} height={100} /> : '-'
                        },
                        {
                            key: 'actions',
                            width: 180,
                            className: '!text-center',
                            title: 'العمليات',
                            render: (_v, r) => <div>
                                <Tooltip title={`تجديد الاشتراك (${r.daysPaid || 30} يوم)`}>
                                    <Popconfirm 
                                        title={`هل تريد إضافة ${r.daysPaid || 30} يوماً لهذا الرياضي؟`} 
                                        onConfirm={() => handleAdd30Days(r)}
                                        okText="نعم"
                                        cancelText="لا"
                                    >
                                        <Button size="small" type='link'>
                                            <FaCalendarPlus color='green' size={25} />
                                        </Button>
                                    </Popconfirm>
                                </Tooltip>
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
