import { useMemo } from "react";
import { useSelector } from "react-redux";
import CheckboardBackground from "../../main/CheckboardBackground/CheckboardBackground";
import Header from "../../main/Header/Header";
import styles from "./HowToPlay.module.css";

const HowToPlay = () => {
    // Calculate title / button font-size
    const pageWidth = useSelector((state) => state.main.pageWidth);
    const fontSize = useMemo(() => {
        return Math.min(40, pageWidth / 12);
    }, [pageWidth]);

    return (
        <>
            <div className={styles.container}>
                <CheckboardBackground />
                <div className={styles.headerContainer}>
                    <Header />
                </div>
                <div className={styles.content}>
                    <div className={styles.title} style={{ fontSize }}>
                        How to play blunderchess
                    </div>
                    <div className={styles.description}>
                        Blunderchess follows the rules of normal chess, with one
                        twist: at certain points, you get to play for your
                        opponent and try to make them blunder.
                    </div>
                    <div className={styles.subtitle}>Turn Order</div>
                    <div className={styles.description}>
                        Player 1 is trying to win as White, and Player 2 is
                        trying to win as Black. The turn order is as follows:
                        {"\n"}
                        <ol>
                            <li>Player 1 plays for White</li>
                            <li>Player 2 plays for Black</li>
                            <li>Player 1 plays for White</li>
                            <li>Player 2 plays for Black</li>
                            <li>
                                <b>
                                    Player 2 plays for White (attempting to make
                                    White blunder)
                                </b>
                            </li>
                            <li>
                                <b>
                                    Player 1 plays for Black (attempting to make
                                    Black blunder)
                                </b>
                            </li>
                            <li>Player 1 plays for White</li>
                            <li>Player 2 plays for Black</li>
                            <li>Player 1 plays for White</li>
                            <li>Player 2 plays for Black</li>
                            <li>Player 1 plays for White</li>
                            <li>
                                <b>
                                    Player 1 plays for Black (attempting to make
                                    Black blunder)
                                </b>
                            </li>
                            <li>
                                <b>
                                    Player 2 plays for White (attempting to make
                                    White blunder)
                                </b>
                            </li>
                            <li>Player 2 plays for Black</li>
                        </ol>
                        This cycle continues throughout the game, forcing
                        players to balance good moves with sabotage when given
                        control of their opponent’s pieces.
                    </div>
                </div>
            </div>
        </>
    );
};

export default HowToPlay;
