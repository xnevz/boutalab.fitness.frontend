import { Form, Input, InputNumber, Modal, message } from 'antd';
import dayjs from 'dayjs';
import { useMutation } from 'react-query';
import { Athlete, createAthlete } from '../../../api';
import MyDatePicker from './MyDatePicker';
import MyWebcam from './MyWebcam';
import TextArea from 'antd/es/input/TextArea';

interface Props {
    onSuccess: () => void;
    open: boolean;
    onCancel: () => void;
}

export default function CreateAthlete({ onSuccess, open, onCancel: onCancelParams }: Props) {
    const [form] = Form.useForm();
    const daysPaid = Form.useWatch('daysPaid', form);

    const { mutateAsync } = useMutation<Athlete, Error, Athlete>({
        mutationFn: async (values) => {
            return await createAthlete(values);
        },
        onSuccess() {
            onSuccess();
            form.resetFields();
            message.success('تم إضافة الرياضي بنجاح');
        },
        onError: (err: any) => {
            if (err.response?.status === 409) {
                message.error(err.response.data?.error || 'هذا الإسم مسجل بالفعل');
            } else {
                message.error('حدث خطأ أثناء إضافة الرياضي');
            }
        }
    });

    function handleFinish(values: Athlete) {
        mutateAsync(values);
    }

    function handleCancel() {
        const isDirty = form.isFieldsTouched() || !!form.getFieldValue('avatar');
        if (isDirty) {
            Modal.confirm({
                title: 'تأكيد إلغاء العملية',
                content: 'هل أنت متأكد من إلغاء العملية؟ ستفقد البيانات المدخلة وغير المحفوظة.',
                okText: 'نعم، إلغاء',
                cancelText: 'تراجع',
                okButtonProps: { danger: true },
                onOk: () => {
                    onCancelParams();
                    form.resetFields();
                }
            });
        } else {
            onCancelParams();
            form.resetFields();
        }
    }

    return (
        <Modal 
            destroyOnClose 
            onCancel={handleCancel} 
            open={open} 
            width={760} 
            title={<span className="text-xl font-bold">إضافة رياضي جديد</span>}
            okText="إضافة"
            cancelText="إلغاء"
            onOk={form.submit}
        >
            <Form<Athlete> 
                onFinish={handleFinish} 
                form={form} 
                layout="vertical"
                className="mt-6" 
                initialValues={{
                    daysPaid: 30,
                    lastPaymentDate: dayjs().format('YYYY-MM-DD')
                }}
            >
                <div className="flex gap-6 items-start">
                    {/* Right Column: Form Fields */}
                    <div className="flex-grow flex flex-col gap-1">
                        <Form.Item 
                            rules={[
                                { required: true, message: 'يرجى إدخال اسم الرياضي' },
                                { min: 3, message: 'يجب أن يكون الاسم ٣ أحرف على الأقل' }
                            ]} 
                            name="name" 
                            label="الإسم"
                        >
                            <Input placeholder="الاسم الكامل للرياضي" className="w-full" />
                        </Form.Item>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Form.Item 
                                rules={[{ required: true, message: 'يرجى تحديد عدد الأيام' }]} 
                                name="daysPaid" 
                                label="الدفع باليوم"
                            >
                                <InputNumber min={1} className="w-full" />
                            </Form.Item>

                            <Form.Item 
                                rules={[{ required: true, message: 'يرجى اختيار تاريخ الدفع' }]} 
                                name="lastPaymentDate" 
                                label="تاريخ الدفع"
                            >
                                <MyDatePicker daysPaid={daysPaid} />
                            </Form.Item>
                        </div>

                        <Form.Item 
                            name="phone" 
                            label="رقم الهاتف"
                            rules={[
                                {
                                    pattern: /^[0-9+\s-()]*$/,
                                    message: 'رقم الهاتف غير صالح، يرجى إدخال أرقام فقط'
                                }
                            ]}
                        >
                            <Input placeholder="مثال: 0555123456" className="w-full ltr !text-right" />
                        </Form.Item>

                        <Form.Item name="note" label="الملاحظة">
                            <TextArea placeholder="أدخل أي ملاحظات هنا..." rows={3} className="w-full" />
                        </Form.Item>
                    </div>

                    {/* Vertical Divider */}
                    <div className="w-[1px] self-stretch bg-gray-200 dark:bg-gray-700" />

                    {/* Left Column: Profile Avatar / Webcam */}
                    <div className="w-[220px] flex-shrink-0 flex flex-col items-center justify-center pt-2">
                        <span className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">الصورة الشخصية</span>
                        <Form.Item name="avatar" noStyle>
                            <MyWebcam />
                        </Form.Item>
                    </div>
                </div>
            </Form>
        </Modal>
    );
}