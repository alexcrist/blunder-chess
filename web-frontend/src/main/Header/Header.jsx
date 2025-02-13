import classNames from "classnames";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigateToMenu } from "../useNavigation";
import styles from "./Header.module.css";

const Header = ({ isLight }) => {
    const pageWidth = useSelector((state) => state.main.pageWidth);
    const fontSize = useMemo(() => {
        return Math.max(Math.min(20, pageWidth / 36), 14);
    }, [pageWidth]);
    const navigateToMenu = useNavigateToMenu();
    return (
        <div
            className={classNames(styles.container, {
                [styles.isLight]: isLight,
            })}
            onClick={navigateToMenu}
        >
            <a href="/" style={{ fontSize }}>
                blunderchess.net
            </a>
        </div>
    );
};

export default Header;
