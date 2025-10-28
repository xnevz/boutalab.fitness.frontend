import { Button, Form, Input, InputNumber, Modal, message } from 'antd';
import { useMutation } from 'react-query';
import { Athlete, updateAthlete } from '../../../api';
import MyDatePicker from './MyDatePicker';
import MyWebcam from './MyWebcam';
import { useEffect } from 'react';
import TextArea from 'antd/es/input/TextArea';

interface Props {
    onSuccess: () => void,
    athlete: Athlete | null;
    onCancel: () => void;
}

export default function EditAthlete({ onSuccess, athlete, onCancel: onCancelParams }: Props) {
    const [form] = Form.useForm();

    const { mutateAsync } = useMutation<Athlete, Error, Athlete>({
        mutationFn: async (values) => {
            return await updateAthlete(values);
        },
        onSuccess() {
            onSuccess();
            form.resetFields();
            message.success('تم تعديل الرياضي بنجاح');

        },
        onError: () => {
            message.error('حدث خطأ أثناء تعديل الرياضي');
        }
    });

    function handleFinish(values: Athlete) {
        mutateAsync(values);
    }

    function onCancel() {
        onCancelParams();
        form.resetFields();
    }
    useEffect(() => {
        if (!!athlete)
            form.setFieldsValue(athlete);
    }, [athlete]);

    return (
        <Modal destroyOnClose onCancel={onCancel} onClose={onCancel} open={athlete !== null} width='100%' onOk={form.submit}>
            <Form<Athlete> onFinish={handleFinish} form={form} className='mt-12' >

                <Form.Item name='id' hidden />

                <Form.Item rules={[{ required: true, min: 3 }]} name='name' label='الإسم'>
                    <Input />
                </Form.Item>

                <Form.Item rules={[{ required: true }]} name='daysPaid' label='الدفع باليوم'>
                    <InputNumber min={1} max={30} />
                </Form.Item>

                <Form.Item required name='lastPaymentDate' label='تاريخ الدفع' >
                    <MyDatePicker extra={<>
                        <Button type='primary' onClick={form.submit} className='ms-5'>تأكيد</Button>
                    </>} />
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