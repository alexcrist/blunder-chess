import classNames from "classnames";
import styles from "./Header.module.css";

const Header = ({ isLight }) => {
    return (
        <div
            className={classNames(styles.container, {
                [styles.isLight]: isLight,
            })}
        >
            <a href="/" target="_">
                blunderchess.net
            </a>
        </div>
    );
};

export default Header;
