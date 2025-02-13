import classNames from "classnames";
import { useNavigateToMenu } from "../useNavigation";
import styles from "./Header.module.css";

const Header = ({ isLight }) => {
    const navigateToMenu = useNavigateToMenu();
    return (
        <div
            className={classNames(styles.container, {
                [styles.isLight]: isLight,
            })}
            onClick={navigateToMenu}
        >
            <a href="/">blunderchess.net</a>
        </div>
    );
};

export default Header;
