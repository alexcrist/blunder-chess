import { FaPen } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import CheckboardBackground from "../../main/CheckboardBackground/CheckboardBackground";
import mainSlice from "../../main/mainSlice";
import ConnectionStatusModal from "../ConnectionStatusModal/ConnectionStatusModal";
import { useConnectToPeers } from "../useConnectToPeers";
import styles from "./ConnectionMenu.module.css";

const MAX_NAME_LENGTH = 50;

const ConnectionMenu = () => {
    const dispatch = useDispatch();
    const name = useSelector((state) => state.main.name);
    const {
        players,
        requestMatch,
        acceptMatch,
        rejectMatch,
        peerIdOfInboundReq,
        peerIdOfOutboundReq,
        broadcastNameChange,
    } = useConnectToPeers();
    const onClickEditName = () => {
        const newName = prompt("Name:");
        if (!newName) {
            return;
        }
        if (newName.length > MAX_NAME_LENGTH) {
            alert("Invalid name.");
        }
        dispatch(mainSlice.actions.setName(newName));
        broadcastNameChange(newName);
    };
    return (
        <>
            <div className={styles.container}>
                <CheckboardBackground />
                <div className={styles.content}>
                    <div className={styles.titleContainer}>
                        <div className={styles.title}>Peers</div>
                        <div className={styles.yourNameContainer}>
                            <div className={styles.yourName}>
                                Your name: <b>{name}</b>
                            </div>
                            <FaPen
                                size={14}
                                onClick={onClickEditName}
                                className={styles.editName}
                            />
                        </div>
                    </div>
                    <div className={styles.players}>
                        {players.map((player, index) => {
                            const onClickPlayer = () => {
                                // TODO: if not on cooldown
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
                acceptMatch={acceptMatch}
                rejectMatch={rejectMatch}
                peerIdOfInboundReq={peerIdOfInboundReq}
                peerIdOfOutboundReq={peerIdOfOutboundReq}
            />
        </>
    );
};

export default ConnectionMenu;
