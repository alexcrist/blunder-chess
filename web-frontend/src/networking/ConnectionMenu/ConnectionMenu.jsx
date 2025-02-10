import { useSelector } from "react-redux";
import CheckboardBackground from "../../main/CheckboardBackground/CheckboardBackground";
import ConnectionStatusModal from "../ConnectionStatusModal/ConnectionStatusModal";
import { useConnectToPeers } from "../useConnectToPeers";
import styles from "./ConnectionMenu.module.css";

const ConnectionMenu = () => {
    const name = useSelector((state) => state.main.name);
    const {
        players,
        requestMatch,
        confirmMatch,
        rejectMatch,
        peerIdOfInboundReq,
        peerIdOfOutboundReq,
    } = useConnectToPeers();
    return (
        <>
            <div className={styles.container}>
                <CheckboardBackground />
                <div className={styles.content}>
                    <div className={styles.title}>Connections for {name}</div>
                    <div className={styles.players}>
                        {players.map((player, index) => {
                            const onClickPlayer = () => {
                                requestMatch(player.peerId);
                            };
                            return (
                                <div
                                    key={index}
                                    className={styles.player}
                                    onClick={onClickPlayer}
                                >
                                    {player.name}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            <ConnectionStatusModal
                players={players}
                confirmMatch={confirmMatch}
                rejectMatch={rejectMatch}
                peerIdOfInboundReq={peerIdOfInboundReq}
                peerIdOfOutboundReq={peerIdOfOutboundReq}
            />
        </>
    );
};

export default ConnectionMenu;
