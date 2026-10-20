import { ConfigProvider, ThemeConfig, Typography, theme, message } from 'antd';
import ar_EG from 'antd/locale/ar_EG';
import { useEffect, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider, useMutation, useQuery } from 'react-query';
import Athletes from "./components/Athletes";
import { fetchSettings, updateSettings } from './api';


const queryClient = new QueryClient();

function GymApp({ mode, setMode }: { mode: 'dark' | 'light', setMode: (mode: 'dark' | 'light') => void; }) {
    const { data: settings, refetch } = useQuery('settings', fetchSettings);

    const { mutateAsync: updateSettingsAsync } = useMutation(updateSettings, {
        onSuccess() {
            refetch();
            message.success('تم تحديث الاسم بنجاح');
        },
        onError() {
            message.error('حدث خطأ أثناء تحديث الاسم');
        }
    });

    const gymName = settings?.gym_name || 'النادي الهاوي لكمال الأجسام رميساء';
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.altKey && e.key === 'd') {
                setIsAdmin(admin => !admin);
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    const handleTitleChange = async (newTitle: string) => {
        if (!newTitle || newTitle.trim().length < 3) {
            message.warning('الاسم قصير جداً');
            return;
        }
        await updateSettingsAsync({ key: 'gym_name', value: newTitle.trim() });
    };

    return (
        <div className={"p-4 pb-3 box-border flex flex-col h-screen " + mode}>
            <div className="flex flex-col items-center justify-center gap-1 mb-2 flex-shrink-0">
                <Typography.Title
                    level={2}
                    className="font-bold m-0 text-center"
                    editable={isAdmin ? {
                        onChange: handleTitleChange,
                        tooltip: 'تعديل اسم النادي',
                        triggerType: ['icon', 'text']
                    } : false}
                >
                    {gymName}
                </Typography.Title>
                {!isAdmin && (
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 opacity-60 pointer-events-none select-none">
                        (اضغط Ctrl+Alt+D للتحكم في الإعدادات)
                    </span>
                )}
            </div>
            <div className="flex-grow overflow-hidden">
                <Athletes {...{ mode, setMode }} />
            </div>
            <a target='_blank' href='https://www.facebook.com/abdelkarimbettayeb1/' className="text-center text-xs py-1 text-gray-500 dark:text-gray-400 opacity-80 flex-shrink-0 select-none">
                Made with ❤️ by Abdelkarim. All rights reserved.
            </a>
        </div >
    );
}

function App() {

    const [mode, setMode] = useState<'dark' | 'light'>(() => localStorage.getItem('mode') as 'light' | 'dark' || 'light');

    const antdTheme = useMemo(() => ({
        algorithm: mode == 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
            fontSize: 20,
            fontFamily: 'Cairo'
        }
    } as ThemeConfig), [mode]);

    useEffect(() => {
        localStorage.setItem('mode', mode);
    }, [mode]);

    return (
        <QueryClientProvider client={queryClient}>
            <ConfigProvider locale={ar_EG} direction="rtl" theme={antdTheme}>
                <GymApp {...{ mode, setMode }} />
            </ConfigProvider>
        </QueryClientProvider>
    );
}

export default App;
