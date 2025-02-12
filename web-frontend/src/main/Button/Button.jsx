import classNames from "classnames";
import styles from "./Button.module.css";

const Button = ({
    className,
    style,
    onClick: rawOnClick,
    children,
    isDisabled,
}) => {
    const onClick = (event) => {
        if (!isDisabled) {
            rawOnClick(event);
        }
    };
    return (
        <div
            onClick={onClick}
            style={style}
            className={classNames(styles.container, className, {
                [styles.isDisabled]: isDisabled,
            })}
        >
            {children}
        </div>
    );
};

export default Button;
