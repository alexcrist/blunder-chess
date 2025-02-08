import classNames from "classnames";
import { useEffect, useState } from "react";
import styles from "./Modal.module.css";

const TRANSITION_TIME_MS = 400;

const Modal = ({ children, isVisible, className }) => {
    // Fade modal in and out
    const [isShowing, setIsShowing] = useState(false);
    const [opacity, setOpacity] = useState(0);
    useEffect(() => {
        if (isVisible && !isShowing) {
            setIsShowing(true);
            requestAnimationFrame(() => setOpacity(1));
        }
    }, [isShowing, isVisible]);
    useEffect(() => {
        if (!isVisible && isShowing) {
            setOpacity(0);
            setTimeout(() => setIsShowing(false), TRANSITION_TIME_MS);
        }
    }, [isShowing, isVisible]);

    if (!isShowing) {
        return null;
    }
    return (
        <div
            className={styles.container}
            style={{ transition: `all ${TRANSITION_TIME_MS}ms`, opacity }}
        >
            <div className={classNames(styles.content, className)}>
                {children}
            </div>
        </div>
    );
};

export default Modal;
