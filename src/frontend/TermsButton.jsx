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
                }/en-GB/register?Caller=${encodeURIComponent(phone)}`
            ).then(function (response) {
                console.log(response)
                if (response.data.status == 'OK') {
                    setState({ state: 'SUCCESS' });
                } else {
                    setState({ state: 'ERROR' });
                }
            });
        } catch (e) {
            setState({
                state: 'ERROR',
                error: e.response.data.error || 'An unexpected error occurred',
            });
        }
    }, [phone, setState]);
    return { state, trigger };
};

export default function TermsButton() {
    const phoneNumber = useInput('+44...');
    const { trigger, state } = useAlertTrigger(phoneNumber.value);

    switch (state.state) {
        case 'PENDING':
            return <div>Please wait...</div>;
        case 'SUCCESS':
            return <div>Your number has been successfully approved! You may now call and use the call centre.</div>;
        case 'ERROR':
            return <div>There was a problem adding your number. It may already be approved or the format is incorrect. Please verify your number is correct and try again.</div>
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
                Register
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
