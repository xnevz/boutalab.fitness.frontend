import { Form, Input, InputNumber, Modal, message } from 'antd';
import dayjs from 'dayjs';
import { useMutation } from 'react-query';
import { Athlete, createAthlete } from '../../../api';
import MyDatePicker from './MyDatePicker';
import MyWebcam from './MyWebcam';
import TextArea from 'antd/es/input/TextArea';

interface Props {
    onSuccess: () => void,
    open: boolean;
    onCancel: () => void;
}

export default function CreateAthlete({ onSuccess, open, onCancel: onCancelParams }: Props) {
    const [form] = Form.useForm();

    const { mutateAsync } = useMutation<Athlete, Error, Athlete>({
        mutationFn: async (values) => {
            return await createAthlete(values);
        },
        onSuccess() {
            onSuccess();
            form.resetFields();
            message.success('تم إضافة الرياضي بنجاح');

        },
        onError: () => {
            message.error('حدث خطأ أثناء إضافة الرياضي');
        }
    });

    function handleFinish(values: Athlete) {
        mutateAsync(values);
    }

    function onCancel() {
        onCancelParams();
        form.resetFields();
    }

    return (
        <Modal destroyOnClose onCancel={onCancel} onClose={onCancel} open={open} width='100%' onOk={form.submit}>
            <Form<Athlete> onFinish={handleFinish} form={form} className='mt-12' initialValues={{
                lastPaymentDate: dayjs().format('YYYY-MM-DD')
            }}>
                <Form.Item rules={[{ required: true, min: 3 }]} name='name' label='الإسم'>
                    <Input />
                </Form.Item>

                <Form.Item rules={[{ required: true }]} name='daysPaid' label='الدفع باليوم' initialValue={30}>
                    <InputNumber min={1} max={30} defaultValue={30} />
                </Form.Item>

                <Form.Item required name='lastPaymentDate' label='تاريخ الدفع' >
                    <MyDatePicker />
                </Form.Item>

                <Form.Item name='note' label='الملاحظة'>
                    <TextArea />
                </Form.Item>

                <Form.Item name='phone' label='رقم الهاتف'>
                    <Input />
                </Form.Item>

                <Form.Item name='avatar' label='الصورة'>
                    <MyWebcam />
                </Form.Item>
            </Form>
        </Modal>
    );
}