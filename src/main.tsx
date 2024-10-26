import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {Provider} from 'react-redux';
import App from './App.tsx';
import './index.css';
import {storeConfig} from "./reducerConfig/storeConfig.ts";

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <Provider store={storeConfig}>
            <App/>
        </Provider>
    </StrictMode>,
)
