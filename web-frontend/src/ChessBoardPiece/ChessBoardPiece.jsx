import styles from "./ChessBoardPiece.module.css";

const ChessBoardPiece = ({ pieceString }) => {
    const imageSrc = new URL(
        `../assets/pieces/${pieceString}.png`,
        import.meta.url,
    ).href;
    return (
        <img src={imageSrc} className={styles.container} draggable="false" />
    );
};

export default ChessBoardPiece;
