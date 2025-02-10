import CheckboardBackground from "../../main/CheckboardBackground/CheckboardBackground";
import { useGetOtherPlayers } from "../useGetOtherPlayers";
import styles from "./ConnectionMenu.module.css";

const ConnectionMenu = () => {
    const players = useGetOtherPlayers();
    return (
        <div className={styles.container}>
            <CheckboardBackground />
            <div className={styles.content}>
                <div className={styles.title}>Connections</div>
                <div className={styles.players}>
                    {players.map((player, index) => {
                        return (
                            <div key={index} className={styles.player}>
                                {player.name}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ConnectionMenu;
