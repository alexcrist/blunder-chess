import { useMemo } from "react";
import { FaEnvelope, FaGithub, FaMugSaucer } from "react-icons/fa6";
import { useSelector } from "react-redux";
import Button from "../Button/Button";
import CheckboardBackground from "../CheckboardBackground/CheckboardBackground";
import {
    useNavigateToConnectOnline,
    useNavigateToGameLocal,
    useNavigateToHowToPlay,
} from "../useNavigation";
import styles from "./Menu.module.css";

const FOOTER = [
    {
        icon: <FaGithub />,
        text: "GitHub",
        link: "https://github.com/alexcrist/blunderchess",
    },
    {
        icon: <FaEnvelope />,
        text: "Give feedback",
        link: "https://forms.gle/dWPuUzAyfW9W72yP9",
    },
    {
        icon: <FaMugSaucer />,
        text: "Buy me a coffee",
        link: "https://buymeacoffee.com/alexcrist",
    },
];

const Menu = () => {
    const navigateToGameLocal = useNavigateToGameLocal();
    const navigateToConnectOnline = useNavigateToConnectOnline();
    const navigateToHowToPlay = useNavigateToHowToPlay();

    // Calculate title / button font-size
    const pageWidth = useSelector((state) => state.main.pageWidth);
    const fontSize = useMemo(() => {
        return Math.min(100, pageWidth / 12);
    }, [pageWidth]);

    return (
        <div className={styles.container}>
            <CheckboardBackground />
            <div className={styles.title} style={{ fontSize }}>
                blunderchess.net
                <div className={styles.subtitle}>
                    where blundering is a strategy!
                </div>
            </div>
            <Button
                className={styles.button}
                onClick={navigateToGameLocal}
                style={{ fontSize: fontSize * 0.5 }}
            >
                Blunder locally
            </Button>
            <Button
                className={styles.button}
                onClick={navigateToConnectOnline}
                style={{ fontSize: fontSize * 0.5 }}
            >
                Blunder online
            </Button>
            <Button
                className={styles.button}
                onClick={navigateToHowToPlay}
                style={{ fontSize: fontSize * 0.5 }}
            >
                How to play
            </Button>
            <div className={styles.spacer}></div>
            <div className={styles.footer}>
                {FOOTER.map((item, index) => {
                    return (
                        <div className={styles.footerItem} key={index}>
                            <a href={item.link} target="_">
                                <div className={styles.icon}>{item.icon}</div>
                                <div className={styles.text}>{item.text}</div>
                            </a>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Menu;
