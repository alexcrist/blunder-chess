import classNames from "classnames";
import styles from "./Header.module.css";

const Header = ({ isLight, isLinkDisabled }) => {
    return (
        <div
            className={classNames(styles.container, {
                [styles.isLight]: isLight,
                [styles.isLinkDisabled]: isLinkDisabled,
            })}
        >
            <a href="/">blunderchess.net</a>
        </div>
    );
};

export default Header;
