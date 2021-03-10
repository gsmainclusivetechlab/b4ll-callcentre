/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import style from './AlertButton.module.css';
import React from 'react';
import axios from 'axios';

const useInput = (init) => {
    const [value, setValue] = React.useState(init);
    const onChange = React.useCallback(
        (e) => setValue(`+${e.target.value.replace(/[^\d]/gi, '')}`),
        [setValue]
    );
    const onFocus = React.useCallback(
        (e) => setValue(`+${e.target.value.replace(/[^\d]/gi, '')}`),
        [value, setValue]
    );
    return { value, onChange, onFocus };
};

const useAlertTrigger = (phone) => {
    const [state, setState] = React.useState({ state: 'INIT' });
    const trigger = React.useCallback(async () => {
        setState({ state: 'PENDING' });
        try {
            await axios.get(
                `${
                    process.env.API_HOST
                }/en-GB/callback?Caller=${encodeURIComponent(phone)}`
            , { crossdomain: true });
            setState({ state: 'SUCCESS' });
        } catch (e) {
            setState({
                state: 'ERROR',
                error: e.response.data.error || 'An unexpected error occurred',
            });
        }
    }, [phone, setState]);
    return { state, trigger };
};

export default function AlertButton() {
    const phoneNumber = useInput('+44...');
    const { trigger, state } = useAlertTrigger(phoneNumber.value);

    switch (state.state) {
        case 'PENDING':
            return <div>Please wait...</div>;
        case 'SUCCESS':
            return <div>Successfully requested! Please await your call...</div>;
    }

    let message = state.error || null;
    return (
        <div>
            <input
                className={style.input}
                type="text"
                placeholder="+44"
                {...phoneNumber}
            />
            <button className={style.button} onClick={trigger}>
                Call me!
            </button>
            <br />
            {message ? (
                <div className="admonition admonition-danger alert alert--danger">
                    <div className="admonition-content">
                        <p>{message}</p>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
