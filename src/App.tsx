import { ConfigProvider, ThemeConfig, Typography, theme } from 'antd';
import ar_EG from 'antd/locale/ar_EG';
import { useEffect, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import Athletes from "./components/Athletes";


const queryClient = new QueryClient();

function App() {

    const [mode, setMode] = useState<'dark' | 'light'>(() => localStorage.getItem('mode') as 'light' | 'dark' || 'light');

    const antdTheme = useMemo(() => ({
        algorithm: mode == 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
            fontSize: 20,
            fontFamily: 'Rubik'
        }
    } as ThemeConfig), [mode]);

    useEffect(() => {
        localStorage.setItem('mode', mode);
    }, [mode]);

    return (
        <QueryClientProvider client={queryClient}>
            <ConfigProvider locale={ar_EG} direction="rtl" theme={antdTheme}>
                <div className={"p-4 pb-0 box-border " + mode}>
                    <Typography.Title level={2} className="font-bold m-0 text-nowrap text-ellipsis text-center">النادي الهاوي لكمال الأجسام رميساء</Typography.Title>
                    <Athletes {...{ mode, setMode }} />
                </div>
            </ConfigProvider>
        </QueryClientProvider>
    );
}

export default App;
