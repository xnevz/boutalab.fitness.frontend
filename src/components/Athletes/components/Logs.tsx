import { Modal, Table } from 'antd';
import { useQuery } from 'react-query';
import { fetchLogs } from '../../../api';

export default function Logs({ open, onClose }: { open: boolean; onClose?: () => void; }) {

    const { data, isLoading } = useQuery({
        queryKey: 'logs',
        queryFn: fetchLogs
    });
    return (
        <Modal destroyOnClose open={open} onCancel={onClose} onClose={onClose}>
            <Table loading={isLoading}
                dataSource={data}
                columns={[
                    {
                        title: 'التاريخ',
                        dataIndex: 'date',
                        key: 'date',
                        render: (date: string) => new Date(date).toLocaleString()
                    },
                    {
                        title: 'الرسالة',
                        dataIndex: 'message',
                        key: 'message',
                    }
                ]} />
        </Modal>
    );
}
